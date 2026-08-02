import { Router } from 'express';
import crypto from 'crypto';
import { nanoid } from 'nanoid';
import { allProperties, searchProperties, normalizeBhkFilter } from './data/properties.js';
import { getClient, getTenantBySlug, setRequestTenant, clearRequestTenant, getTenantById, incrementUsage } from './tenantContext.js';
import {
  getConversations, getLeads, addMessage, updateConversation, updateLead, getLeadById,
  summarizeConversation, getAnalytics, assignConversation, createBroadcast, createReminder, getReminders,
} from './store.js';
import {
  getPatients, getPatientById, createPatient, updatePatient, getPatientTimeline,
  getAppointments, getAppointmentById, createAppointment, updateAppointment,
  getTodayStats, getAvailableSlots, getAppointmentsRange,
} from './services/clinicStore.js';
import { createPayment, getPayments, getPaymentsRange, getPaymentSummary } from './services/clinicPayments.js';
import { logAudit, getAuditLog } from './services/clinicAudit.js';
import { getCatalogItems } from './db/index.js';
import { getOne, getAll, run } from './db/query.js';
import { sendText, showTyping, delay } from './messaging.js';
import { getWhatsAppDisplayNumber } from './whatsappConfig.js';
import { prepareBookingResume } from './clinicBookingResume.js';
import { authMiddleware, optionalAuth, requirePlatformAdmin } from './middleware/auth.js';
import { requireLiveTenant } from './middleware/requireLiveTenant.js';

const router = Router();

async function withTenant(req, res, next) {
  const host = String(req.headers.host || '').split(':')[0];
  const hostParts = host ? host.split('.') : [];
  let hostSlug = hostParts.length >= 4 ? hostParts[0] : null;
  if (!hostSlug && hostParts.length === 3) {
    const left = hostParts[0];
    if (left && left.endsWith('-chat')) hostSlug = left.slice(0, -'-chat'.length);
  }
  const slug = req.query.tenant || req.headers['x-tenant-slug'] || hostSlug;
  if (req.user?.tenantId) {
    setRequestTenant(req.user.tenantId);
  } else if (slug) {
    const tenant = await getTenantBySlug(slug);
    if (tenant) setRequestTenant(tenant.id);
  }
  next();
  res.on('finish', clearRequestTenant);
}

router.use(withTenant);

function catalogToProperty(item) {
  return {
    id: item.id,
    title: item.title,
    location: item.location || item.subtitle || '',
    bhk: item.bhk || item.category || '—',
    price: item.price,
    priceNum: item.price_num,
    sqft: item.meta || '',
    status: item.status || 'Available',
    image: item.image_url,
  };
}

async function getPropertiesForTenant(tenantId, filters) {
  const tenant = await getTenantById(tenantId);
  if (tenant?.industry === 'real-estate') {
    return allProperties.filter((p) => {
      if (filters.bhk && p.bhk !== filters.bhk) return false;
      if (p.priceNum < filters.budgetMin || p.priceNum > filters.budgetMax) return false;
      return true;
    });
  }
  const items = await getCatalogItems(tenantId, filters);
  return items.map(catalogToProperty);
}

function clientPayload() {
  const client = getClient();
  const biz = getWhatsAppDisplayNumber();
  return {
    ...client,
    whatsappNumber: client.whatsappNumber || biz || '',
    whatsappBusinessNumber: biz || client.whatsappNumber || '',
  };
}

router.get('/client', optionalAuth, (_req, res) => {
  res.json(clientPayload());
});

/** Save booking progress, then open the same WhatsApp chat to continue. */
router.get('/clinic/resume-booking', async (req, res) => {
  const tenantSlug = req.query.tenant;
  const from = req.query.from;
  const serviceId = req.query.service;

  if (!tenantSlug || !from || !serviceId) {
    return res.status(400).send('This link is incomplete. Please open services from your WhatsApp chat again.');
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return res.status(404).send('Clinic not found.');
  }

  const phone = String(from).replace(/\D/g, '');
  const title = await prepareBookingResume(phone, tenant, serviceId);
  if (!title) {
    return res.status(404).send('Service not found.');
  }

  const bizPhone = getWhatsAppDisplayNumber();
  const target = bizPhone ? `https://wa.me/${bizPhone}` : 'https://wa.me/';

  res.redirect(302, target);
});

router.get('/properties', optionalAuth, async (req, res) => {
  const bhk = normalizeBhkFilter(req.query.bhk) || req.query.bhk || null;
  const budgetMin = Number(req.query.budgetMin) || 0;
  const budgetMax = Number(req.query.budgetMax) || 999999;
  const slug = req.query.tenant;
  if (slug) {
    const tenant = await getTenantBySlug(slug);
    if (tenant?.status === 'pending_onboarding') {
      return res.status(503).json({
        client: getClient(),
        total: 0,
        properties: [],
        message: 'This mini-site is being customised for the business.',
      });
    }
  }
  const tenantId = req.user?.tenantId || getClient().id;

  const items = await getPropertiesForTenant(tenantId, { bhk, budgetMin, budgetMax });
  res.json({ client: clientPayload(), total: items.length, properties: items });
});

router.get('/catalog', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  res.json(await getCatalogItems(req.user.tenantId));
});

router.post('/catalog', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const { title, subtitle, price, priceNum, meta, imageUrl, category } = req.body ?? {};
  if (!title) return res.status(400).json({ error: 'Title required' });
  const id = nanoid(10);
  await run(`
    INSERT INTO catalog_items (id, tenant_id, title, subtitle, price, price_num, meta, image_url, category, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(sort_order),0)+1 FROM catalog_items WHERE tenant_id = ?))
  `, [id, req.user.tenantId, title, subtitle || '', price || '', priceNum || 0, meta || '', imageUrl || '', category || 'General', req.user.tenantId]);
  res.status(201).json({ id });
});

router.get('/properties/search', authMiddleware, requireLiveTenant, async (req, res) => {
  const tenant = await getTenantById(req.user.tenantId);
  if (tenant?.industry !== 'real-estate') {
    const items = (await getCatalogItems(req.user.tenantId)).slice(0, Number(req.query.limit) || 3);
    return res.json({ properties: items.map(catalogToProperty), total: items.length });
  }
  const result = searchProperties({
    bhk: req.query.bhk,
    budgetLabel: req.query.budget,
    excludeIds: (req.query.exclude || '').split(',').filter(Boolean),
    limit: Number(req.query.limit) || 3,
    offset: Number(req.query.offset) || 0,
  });
  res.json(result);
});

router.get('/conversations', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  res.json(await getConversations(req.user.tenantId));
});

router.get('/conversations/:id/summary', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const summary = await summarizeConversation(req.params.id, req.user.tenantId);
  if (!summary) return res.status(404).json({ error: 'Conversation not found' });
  res.json(summary);
});

router.post('/conversations/:id/assign', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const agentName = req.body?.agentName || getClient().agentName;
  await assignConversation(req.params.id, req.user.tenantId, agentName);
  res.json({ ok: true, assignedTo: agentName });
});

router.post('/conversations/:id/send', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });

  const text = req.body?.text?.trim();
  if (!text) return res.status(400).json({ error: 'Message text is required' });

  const id = req.params.id;
  if (!id.startsWith('wa-')) {
    return res.status(400).json({ error: 'Only live WhatsApp threads can send messages.' });
  }

  const phone = id.slice(3);
  setRequestTenant(req.user.tenantId);

  try {
    const session = getSession(phone);
    if (session.lastMessageId) {
      void showTyping(session.lastMessageId).catch(() => {});
      await delay(400);
    }
    await sendText(phone, text);
    await addMessage(phone, 'agent', text);
    await updateConversation(phone, { status: 'agent', unread: 0, assignedAgent: req.body?.agentName || getClient().agentName });
    patchSession(phone, { phase: 'agent', complete: true });
    await incrementUsage(req.user.tenantId, 'messages_sent');
    return res.json({ ok: true, delivered: true });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to send WhatsApp message' });
  } finally {
    clearRequestTenant();
  }
});

router.get('/leads', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  res.json(await getLeads(req.user.tenantId));
});

router.patch('/leads/:id', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const lead = await updateLead(Number(req.params.id), req.user.tenantId, req.body ?? {});
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json(lead);
});

router.post('/leads/:id/reminder', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const { message, remindAt } = req.body ?? {};
  const reminder = await createReminder(req.user.tenantId, {
    leadId: Number(req.params.id),
    message: message || 'Follow up with lead',
    remindAt: remindAt || new Date(Date.now() + 86400000).toISOString(),
  });
  res.status(201).json(reminder);
});

router.get('/analytics', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  res.json(await getAnalytics(req.user.tenantId));
});

router.post('/broadcasts', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const message = req.body?.message?.trim();
  if (!message) return res.status(400).json({ error: 'Message required' });
  res.status(201).json(await createBroadcast(req.user.tenantId, message));
});

router.get('/reminders', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  res.json(await getReminders(req.user.tenantId));
});

router.get('/team', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const members = await getAll('SELECT id, name, role, created_at FROM team_members WHERE tenant_id = ?', [req.user.tenantId]);
  const users = await getAll('SELECT id, name, email, role FROM users WHERE tenant_id = ?', [req.user.tenantId]);
  res.json({ members, users });
});

router.post('/team', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const { name, role } = req.body ?? {};
  if (!name) return res.status(400).json({ error: 'Name required' });
  const id = nanoid();
  await run('INSERT INTO team_members (id, tenant_id, name, role) VALUES (?, ?, ?, ?)', [id, req.user.tenantId, name, role || 'agent']);
  res.status(201).json({ id, name, role: role || 'agent' });
});

router.get('/api-keys', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const keys = await getAll('SELECT id, key_prefix, label, created_at FROM api_keys WHERE tenant_id = ?', [req.user.tenantId]);
  res.json(keys);
});

router.post('/api-keys', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const tenant = await getTenantById(req.user.tenantId);
  if (!['pro', 'growth'].includes(tenant?.plan)) {
    return res.status(403).json({ error: 'API keys require Growth or Pro plan' });
  }
  const rawKey = `kaana_${nanoid(24)}`;
  const hash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const id = nanoid();
  await run('INSERT INTO api_keys (id, tenant_id, key_prefix, key_hash, label) VALUES (?, ?, ?, ?, ?)', [
    id, req.user.tenantId, rawKey.slice(0, 12), hash, req.body?.label || 'Default',
  ]);
  res.status(201).json({ id, key: rawKey, label: req.body?.label || 'Default' });
});

// ── Clinic: patients & appointments ─────────────────────────────────────

router.get('/clinic/today', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  res.json(await getTodayStats(req.user.tenantId));
});

router.get('/patients', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  res.json(await getPatients(req.user.tenantId, { search: req.query.search }));
});

router.get('/patients/:id', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const timeline = await getPatientTimeline(req.params.id, req.user.tenantId);
  if (!timeline) return res.status(404).json({ error: 'Patient not found' });
  res.json(timeline);
});

router.post('/patients', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const { name, phone, email, age, gender, chiefComplaint, isReturning, source, photoUrl, prescriptionUrl, recordUrls } = req.body ?? {};
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });
  try {
    const patient = await createPatient(req.user.tenantId, {
      name, phone, email, age, gender, chiefComplaint, isReturning, source: source || 'Walk-in', photoUrl, prescriptionUrl, recordUrls,
    });
    await logAudit(req.user.tenantId, req.user.sub, 'create', 'patient', patient.id, { name });
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/patients/:id', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const patient = await updatePatient(req.params.id, req.user.tenantId, req.body ?? {});
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  await logAudit(req.user.tenantId, req.user.sub, 'update', 'patient', patient.id, req.body ?? {});
  res.json(patient);
});

router.get('/appointments', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  res.json(await getAppointments(req.user.tenantId, {
    date: req.query.date,
    status: req.query.status,
    patientId: req.query.patientId,
  }));
});

router.get('/appointments/slots', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  res.json({ date, slots: await getAvailableSlots(req.user.tenantId, date) });
});

router.post('/appointments', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const body = req.body ?? {};
  if (!body.scheduledAt) return res.status(400).json({ error: 'scheduledAt required' });
  try {
    const appt = await createAppointment(req.user.tenantId, body);
    await logAudit(req.user.tenantId, req.user.sub, 'create', 'appointment', appt.id, { service: body.service });
    res.status(201).json(appt);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/appointments/:id', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const appt = await updateAppointment(req.params.id, req.user.tenantId, req.body ?? {});
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  await logAudit(req.user.tenantId, req.user.sub, 'update', 'appointment', appt.id, req.body ?? {});
  res.json(appt);
});

router.get('/clinic/payments', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  res.json({
    summary: await getPaymentSummary(req.user.tenantId),
    payments: await getPayments(req.user.tenantId, { patientId: req.query.patientId }),
  });
});

router.get('/clinic/report', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const to = String(req.query.to || new Date().toISOString().slice(0, 10));
  const from = String(req.query.from || to);
  const appointments = await getAppointmentsRange(req.user.tenantId, { from, to, limit: 5000 });
  const payments = await getPaymentsRange(req.user.tenantId, { from, to, limit: 5000 });
  const summary = await getPaymentSummary(req.user.tenantId);
  const total = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  res.json({ from, to, appointments, payments, summary: { ...summary, total } });
});

router.post('/clinic/payments', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const { patientId, appointmentId, amount, method, reference, notes, status } = req.body ?? {};
  if (!patientId || amount == null) return res.status(400).json({ error: 'patientId and amount required' });
  const payment = await createPayment(req.user.tenantId, { patientId, appointmentId, amount: Number(amount), method, reference, notes, status });
  await logAudit(req.user.tenantId, req.user.sub, 'create', 'payment', payment.id, { amount });
  res.status(201).json(payment);
});

router.get('/clinic/audit', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  res.json(await getAuditLog(req.user.tenantId));
});

router.get('/health', (_req, res) => {
  res.json({ ok: true, multiTenant: true, persistent: true });
});

export default router;
