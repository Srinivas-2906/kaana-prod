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
  getTodayStats, getAvailableSlots,
} from './services/clinicStore.js';
import { createPayment, getPayments, getPaymentSummary } from './services/clinicPayments.js';
import { logAudit, getAuditLog } from './services/clinicAudit.js';
import { getCatalogItems, getDb, parseSettings } from './db/index.js';
import { sendText, showTyping, delay } from './messaging.js';
import { getWhatsAppDisplayNumber } from './whatsappConfig.js';
import { prepareBookingResume } from './clinicBookingResume.js';
import { authMiddleware, optionalAuth, requirePlatformAdmin } from './middleware/auth.js';
import { requireLiveTenant } from './middleware/requireLiveTenant.js';

const router = Router();

function withTenant(req, res, next) {
  const slug = req.query.tenant || req.headers['x-tenant-slug'];
  if (req.user?.tenantId) {
    setRequestTenant(req.user.tenantId);
  } else if (slug) {
    const tenant = getTenantBySlug(slug);
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

function getPropertiesForTenant(tenantId, filters) {
  const tenant = getTenantById(tenantId);
  if (tenant?.industry === 'real-estate') {
    return allProperties.filter((p) => {
      if (filters.bhk && p.bhk !== filters.bhk) return false;
      if (p.priceNum < filters.budgetMin || p.priceNum > filters.budgetMax) return false;
      return true;
    });
  }
  const items = getCatalogItems(tenantId, filters);
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
router.get('/clinic/resume-booking', (req, res) => {
  const tenantSlug = req.query.tenant;
  const from = req.query.from;
  const serviceId = req.query.service;

  if (!tenantSlug || !from || !serviceId) {
    return res.status(400).send('This link is incomplete. Please open services from your WhatsApp chat again.');
  }

  const tenant = getTenantBySlug(tenantSlug);
  if (!tenant) {
    return res.status(404).send('Clinic not found.');
  }

  const phone = String(from).replace(/\D/g, '');
  const title = prepareBookingResume(phone, tenant, serviceId);
  if (!title) {
    return res.status(404).send('Service not found.');
  }

  const bizPhone = getWhatsAppDisplayNumber();
  const target = bizPhone ? `https://wa.me/${bizPhone}` : 'https://wa.me/';

  res.redirect(302, target);
});

router.get('/properties', optionalAuth, (req, res) => {
  const bhk = normalizeBhkFilter(req.query.bhk) || req.query.bhk || null;
  const budgetMin = Number(req.query.budgetMin) || 0;
  const budgetMax = Number(req.query.budgetMax) || 999999;
  const slug = req.query.tenant;
  if (slug) {
    const tenant = getTenantBySlug(slug);
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

  const items = getPropertiesForTenant(tenantId, { bhk, budgetMin, budgetMax });
  res.json({ client: clientPayload(), total: items.length, properties: items });
});

router.get('/catalog', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  res.json(getCatalogItems(req.user.tenantId));
});

router.post('/catalog', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const { title, subtitle, price, priceNum, meta, imageUrl, category } = req.body ?? {};
  if (!title) return res.status(400).json({ error: 'Title required' });
  const id = nanoid(10);
  getDb().prepare(`
    INSERT INTO catalog_items (id, tenant_id, title, subtitle, price, price_num, meta, image_url, category, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(sort_order),0)+1 FROM catalog_items WHERE tenant_id = ?))
  `).run(id, req.user.tenantId, title, subtitle || '', price || '', priceNum || 0, meta || '', imageUrl || '', category || 'General', req.user.tenantId);
  res.status(201).json({ id });
});

router.get('/properties/search', authMiddleware, requireLiveTenant, (req, res) => {
  const tenant = getTenantById(req.user.tenantId);
  if (tenant?.industry !== 'real-estate') {
    const items = getCatalogItems(req.user.tenantId).slice(0, Number(req.query.limit) || 3);
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

router.get('/conversations', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  res.json(getConversations(req.user.tenantId));
});

router.get('/conversations/:id/summary', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const summary = summarizeConversation(req.params.id, req.user.tenantId);
  if (!summary) return res.status(404).json({ error: 'Conversation not found' });
  res.json(summary);
});

router.post('/conversations/:id/assign', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const agentName = req.body?.agentName || getClient().agentName;
  assignConversation(req.params.id, req.user.tenantId, agentName);
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
    addMessage(phone, 'agent', text);
    updateConversation(phone, { status: 'agent', unread: 0, assignedAgent: req.body?.agentName || getClient().agentName });
    patchSession(phone, { phase: 'agent', complete: true });
    incrementUsage(req.user.tenantId, 'messages_sent');
    return res.json({ ok: true, delivered: true });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to send WhatsApp message' });
  } finally {
    clearRequestTenant();
  }
});

router.get('/leads', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  res.json(getLeads(req.user.tenantId));
});

router.patch('/leads/:id', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const lead = updateLead(Number(req.params.id), req.user.tenantId, req.body ?? {});
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json(lead);
});

router.post('/leads/:id/reminder', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const { message, remindAt } = req.body ?? {};
  const reminder = createReminder(req.user.tenantId, {
    leadId: Number(req.params.id),
    message: message || 'Follow up with lead',
    remindAt: remindAt || new Date(Date.now() + 86400000).toISOString(),
  });
  res.status(201).json(reminder);
});

router.get('/analytics', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  res.json(getAnalytics(req.user.tenantId));
});

router.post('/broadcasts', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const message = req.body?.message?.trim();
  if (!message) return res.status(400).json({ error: 'Message required' });
  res.status(201).json(createBroadcast(req.user.tenantId, message));
});

router.get('/reminders', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  res.json(getReminders(req.user.tenantId));
});

router.get('/team', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const members = getDb().prepare('SELECT id, name, role, created_at FROM team_members WHERE tenant_id = ?').all(req.user.tenantId);
  const users = getDb().prepare('SELECT id, name, email, role FROM users WHERE tenant_id = ?').all(req.user.tenantId);
  res.json({ members, users });
});

router.post('/team', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const { name, role } = req.body ?? {};
  if (!name) return res.status(400).json({ error: 'Name required' });
  const id = nanoid();
  getDb().prepare('INSERT INTO team_members (id, tenant_id, name, role) VALUES (?, ?, ?, ?)').run(id, req.user.tenantId, name, role || 'agent');
  res.status(201).json({ id, name, role: role || 'agent' });
});

router.get('/api-keys', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const keys = getDb().prepare('SELECT id, key_prefix, label, created_at FROM api_keys WHERE tenant_id = ?').all(req.user.tenantId);
  res.json(keys);
});

router.post('/api-keys', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const tenant = getTenantById(req.user.tenantId);
  if (!['pro', 'growth'].includes(tenant?.plan)) {
    return res.status(403).json({ error: 'API keys require Growth or Pro plan' });
  }
  const rawKey = `kaana_${nanoid(24)}`;
  const hash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const id = nanoid();
  getDb().prepare('INSERT INTO api_keys (id, tenant_id, key_prefix, key_hash, label) VALUES (?, ?, ?, ?, ?)').run(
    id, req.user.tenantId, rawKey.slice(0, 12), hash, req.body?.label || 'Default',
  );
  res.status(201).json({ id, key: rawKey, label: req.body?.label || 'Default' });
});

// ── Clinic: patients & appointments ─────────────────────────────────────

router.get('/clinic/today', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  res.json(getTodayStats(req.user.tenantId));
});

router.get('/patients', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  res.json(getPatients(req.user.tenantId, { search: req.query.search }));
});

router.get('/patients/:id', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const timeline = getPatientTimeline(req.params.id, req.user.tenantId);
  if (!timeline) return res.status(404).json({ error: 'Patient not found' });
  res.json(timeline);
});

router.post('/patients', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const { name, phone, email, age, gender, chiefComplaint, isReturning, source } = req.body ?? {};
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });
  try {
    const patient = createPatient(req.user.tenantId, {
      name, phone, email, age, gender, chiefComplaint, isReturning, source: source || 'Walk-in',
    });
    logAudit(req.user.tenantId, req.user.sub, 'create', 'patient', patient.id, { name });
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/patients/:id', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const patient = updatePatient(req.params.id, req.user.tenantId, req.body ?? {});
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  logAudit(req.user.tenantId, req.user.sub, 'update', 'patient', patient.id, req.body ?? {});
  res.json(patient);
});

router.get('/appointments', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  res.json(getAppointments(req.user.tenantId, {
    date: req.query.date,
    status: req.query.status,
    patientId: req.query.patientId,
  }));
});

router.get('/appointments/slots', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  res.json({ date, slots: getAvailableSlots(req.user.tenantId, date) });
});

router.post('/appointments', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const body = req.body ?? {};
  if (!body.scheduledAt) return res.status(400).json({ error: 'scheduledAt required' });
  try {
    const appt = createAppointment(req.user.tenantId, body);
    logAudit(req.user.tenantId, req.user.sub, 'create', 'appointment', appt.id, { service: body.service });
    res.status(201).json(appt);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/appointments/:id', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const appt = updateAppointment(req.params.id, req.user.tenantId, req.body ?? {});
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  logAudit(req.user.tenantId, req.user.sub, 'update', 'appointment', appt.id, req.body ?? {});
  res.json(appt);
});

router.get('/clinic/payments', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  res.json({
    summary: getPaymentSummary(req.user.tenantId),
    payments: getPayments(req.user.tenantId, { patientId: req.query.patientId }),
  });
});

router.post('/clinic/payments', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  const { patientId, appointmentId, amount, method, reference, notes, status } = req.body ?? {};
  if (!patientId || amount == null) return res.status(400).json({ error: 'patientId and amount required' });
  const payment = createPayment(req.user.tenantId, { patientId, appointmentId, amount: Number(amount), method, reference, notes, status });
  logAudit(req.user.tenantId, req.user.sub, 'create', 'payment', payment.id, { amount });
  res.status(201).json(payment);
});

router.get('/clinic/audit', authMiddleware, requireLiveTenant, (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant access required' });
  res.json(getAuditLog(req.user.tenantId));
});

router.get('/health', (_req, res) => {
  res.json({ ok: true, multiTenant: true, persistent: true });
});

export default router;
