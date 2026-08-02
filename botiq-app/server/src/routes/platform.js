import { Router } from 'express';
import {
  authMiddleware,
  requirePlatformAdmin,
  loginUser,
  signupBusiness,
  getUserProfile,
  updateTenantSettings,
} from '../middleware/auth.js';
import { tenantToClient, parseSettings, seedCatalogForTenant } from '../db/index.js';
import { getOne, getAll, run } from '../db/query.js';
import { getTenantBySlug, invalidateTenantCache } from '../tenantContext.js';
import { getAnalytics } from '../store.js';
import { getPlatformConfig } from '../platformConfig.js';
import { requireLiveTenant } from '../middleware/requireLiveTenant.js';
import { provisionTenantByAdmin, resetTenantAdminPassword } from '../services/provisioning.js';
import {
  getIntakeForTenant,
  saveIntake,
  listPendingIntakes,
  setIntakeAdminNotes,
} from '../services/onboarding.js';
import { trackSiteEvent, getAdminOverview, listBillingForAdmin } from '../services/tracking.js';
import { saveSiteLead, listSiteLeadsForAdmin, updateSiteLead } from '../services/siteLeads.js';
import { getSetupQueue, getTenantAdminDetail, listTenantsWithStage } from '../services/adminOps.js';
import { notifyIntakeSubmitted, notifySiteLead } from '../services/notify.js';
import { notifyCustomerIntakeSubmitted, notifyCustomerActivated } from '../services/customerNotify.js';

const router = Router();

router.get('/config', (_req, res) => {
  res.json(getPlatformConfig());
});

router.post('/track', async (req, res) => {
  const { event, path, referrer, meta } = req.body ?? {};
  if (!path || typeof path !== 'string') {
    return res.status(400).json({ error: 'path required' });
  }
  await trackSiteEvent({
    event: event || 'pageview',
    path,
    referrer: referrer || req.headers.referer || '',
    userAgent: req.headers['user-agent'] || '',
    meta: meta || {},
  });
  res.json({ ok: true });
});

router.post('/lead', async (req, res) => {
  const { name, phone, source, path, meta } = req.body ?? {};
  const trimmedName = String(name || '').trim();
  const trimmedPhone = String(phone || '').trim().replace(/\s+/g, '');
  if (!trimmedName || trimmedName.length < 2) {
    return res.status(400).json({ error: 'Please enter your name' });
  }
  if (!trimmedPhone || trimmedPhone.replace(/\D/g, '').length < 10) {
    return res.status(400).json({ error: 'Please enter a valid WhatsApp number' });
  }

  const lead = await saveSiteLead({
    name: trimmedName,
    phone: trimmedPhone,
    source: source || 'homepage',
    path: path || '/',
    meta: meta || {},
  });

  await trackSiteEvent({
    event: 'lead_submit',
    path: path || '/',
    referrer: req.headers.referer || '',
    userAgent: req.headers['user-agent'] || '',
    meta: { name: trimmedName, phone: trimmedPhone },
  });

  void notifySiteLead({
    name: trimmedName,
    phone: trimmedPhone,
    source: source || 'homepage',
    path: path || '/',
  });

  res.status(201).json({ ok: true, id: lead.id });
});

router.post('/signup', async (req, res) => {
  const { businessName, email, password, name, industry, phone, plan } = req.body ?? {};
  if (!businessName?.trim() || !email?.trim() || !password || password.length < 6) {
    return res.status(400).json({ error: 'Business name, email, and password (6+ chars) required' });
  }
  const config = getPlatformConfig();
  if (!config.selfServeEnabled && config.conciergeSpotsRemaining <= 0) {
    return res.status(403).json({ error: 'Early access is full. Email hello@kaana.in to join the waitlist.' });
  }
  const result = await signupBusiness({ businessName, email, password, name, industry, phone, plan });
  if (result.error) return res.status(409).json({ error: result.error });
  res.status(201).json(result);
});

router.post('/login', async (req, res) => {
  const { email, identifier, password, tenantSlug } = req.body ?? {};
  const id = identifier || email;
  const inferredTenant = tenantSlug || req.headers['x-tenant-slug'] || req.query.tenant;
  if (!id || !password) return res.status(400).json({ error: 'Email/username and password required' });
  const result = await loginUser(id, password, { tenantSlug: inferredTenant });
  if (result.error) return res.status(401).json({ error: result.error });
  res.json({ ...result, ...getPlatformConfig() });
});

router.get('/me', authMiddleware, async (req, res) => {
  const profile = await getUserProfile(req.user.sub);
  if (!profile) return res.status(404).json({ error: 'User not found' });
  const intake = req.user.tenantId ? await getIntakeForTenant(req.user.tenantId) : null;
  res.json({ ...profile, intake, platform: getPlatformConfig() });
});

router.get('/onboarding/intake', authMiddleware, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant required' });
  const intake = await getIntakeForTenant(req.user.tenantId);
  res.json(intake ?? { status: 'draft', step: 0, answers: {} });
});

router.post('/onboarding/intake', authMiddleware, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant required' });
  const { answers, step, submit } = req.body ?? {};
  const intake = await saveIntake(req.user.tenantId, { answers, step, submit: !!submit });
  const parsed = await getIntakeForTenant(req.user.tenantId);

  if (submit && parsed) {
    const tenant = await getOne('SELECT name, industry FROM tenants WHERE id = ?', [req.user.tenantId]);
    const owner = await getOne('SELECT email, name FROM users WHERE tenant_id = ? AND role = ?', [req.user.tenantId, 'owner']);
    void notifyIntakeSubmitted({
      tenantName: tenant?.name ?? req.user.tenantId,
      industry: tenant?.industry,
      email: owner?.email ?? req.user.email,
      phone: answers?.existingWhatsApp || answers?.phone,
      answers: parsed.answers,
    });
    void notifyCustomerIntakeSubmitted({
      name: owner?.name ?? req.user.email,
      businessName: tenant?.name ?? req.user.tenantId,
      email: owner?.email ?? req.user.email,
      phone: answers?.existingWhatsApp || answers?.phone,
    });
  }

  res.json(intake);
});

router.patch('/tenant', authMiddleware, async (req, res) => {
  const tenantId = req.user.tenantId;
  if (!tenantId) return res.status(403).json({ error: 'No tenant associated with account' });
  const updated = await updateTenantSettings(tenantId, req.body ?? {});
  res.json(updated);
});

router.patch('/tenant/whatsapp', authMiddleware, requireLiveTenant, async (req, res) => {
  const tenantId = req.user.tenantId;
  if (!tenantId) return res.status(403).json({ error: 'No tenant associated with account' });
  const { phoneNumberId, accessToken, whatsappNumber } = req.body ?? {};
  if (phoneNumberId) {
    await run('UPDATE tenants SET whatsapp_phone_id = ? WHERE id = ?', [phoneNumberId, tenantId]);
  }
  if (accessToken) {
    await run('UPDATE tenants SET whatsapp_token = ? WHERE id = ?', [accessToken, tenantId]);
  }
  if (whatsappNumber) {
    const row = await getOne('SELECT settings FROM tenants WHERE id = ?', [tenantId]);
    const settings = { ...parseSettings(row.settings), whatsappNumber };
    await run('UPDATE tenants SET settings = ? WHERE id = ?', [JSON.stringify(settings), tenantId]);
  }
  invalidateTenantCache(tenantId);
  const tenant = await getOne('SELECT * FROM tenants WHERE id = ?', [tenantId]);
  res.json(await tenantToClient(tenant));
});

router.get('/analytics', authMiddleware, requireLiveTenant, async (req, res) => {
  if (!req.user.tenantId) return res.status(403).json({ error: 'Tenant required' });
  res.json(await getAnalytics(req.user.tenantId));
});

router.get('/tenant/:slug/public', async (req, res) => {
  const tenant = await getTenantBySlug(req.params.slug);
  if (!tenant) return res.status(404).json({ error: 'Business not found' });
  if (tenant.status === 'pending_onboarding') {
    return res.status(503).json({ error: 'This business page is being set up.', client: await tenantToClient(tenant) });
  }
  res.json(await tenantToClient(tenant));
});

router.get('/admin/tenants', authMiddleware, requirePlatformAdmin, async (_req, res) => {
  const tenants = await listTenantsWithStage();
  const stats = await getAll(`SELECT plan, COUNT(*)::int AS count FROM tenants GROUP BY plan`);
  const pending = await listPendingIntakes();
  const overview = await getAdminOverview();
  const queue = await getSetupQueue();
  res.json({ tenants, stats, total: tenants.length, pendingIntakes: pending, platform: getPlatformConfig(), overview, queue });
});

router.post('/admin/provision', authMiddleware, requirePlatformAdmin, async (req, res) => {
  const result = await provisionTenantByAdmin(req.body ?? {});
  if (result.error) return res.status(400).json({ error: result.error });

  const tenant = await tenantToClient(result.tenant);
  const slug = tenant.slug;

  const root = process.env.TENANT_ROOT_DOMAIN || 'kaana.in';
  const links = {
    platform: `https://app.${root}`,
    inbox: `https://${slug}.inbox.${root}`,
    crm: `https://crm.${slug}.${root}`,
    clinic: `https://crm.${slug}.${root}`,
    site: `https://${slug}.${root}`,
  };

  res.status(201).json({
    tenant,
    links,
    credentials: result.credentials,
  });
});

router.post('/admin/tenants/:id/reset-password', authMiddleware, requirePlatformAdmin, async (req, res) => {
  const password = req.body?.password;
  const result = await resetTenantAdminPassword(req.params.id, password);
  if (result.error) return res.status(404).json({ error: result.error });
  res.json(result);
});

router.get('/admin/queue', authMiddleware, requirePlatformAdmin, async (_req, res) => {
  res.json(await getSetupQueue());
});

router.get('/admin/leads', authMiddleware, requirePlatformAdmin, async (_req, res) => {
  res.json({ leads: await listSiteLeadsForAdmin() });
});

router.patch('/admin/leads/:id', authMiddleware, requirePlatformAdmin, async (req, res) => {
  const lead = await updateSiteLead(req.params.id, {
    status: req.body?.status,
    adminNotes: req.body?.adminNotes,
    markContacted: !!req.body?.markContacted,
  });
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json(lead);
});

router.get('/admin/tenants/:id', authMiddleware, requirePlatformAdmin, async (req, res) => {
  const detail = await getTenantAdminDetail(req.params.id);
  if (!detail) return res.status(404).json({ error: 'Tenant not found' });
  res.json(detail);
});

router.patch('/admin/tenants/:id', authMiddleware, requirePlatformAdmin, async (req, res) => {
  const tenantId = req.params.id;
  const tenant = await getOne('SELECT * FROM tenants WHERE id = ?', [tenantId]);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  const { name, industry, settings: settingsUpdate } = req.body ?? {};

  const fields = [];
  const values = [];

  const trimmedName = String(name || '').trim();
  if (trimmedName) { fields.push('name = ?'); values.push(trimmedName); }

  const trimmedIndustry = String(industry || '').trim();
  if (trimmedIndustry) { fields.push('industry = ?'); values.push(trimmedIndustry); }

  if (fields.length) {
    await run(`UPDATE tenants SET ${fields.join(', ')} WHERE id = ?`, [...values, tenantId]);
  }

  if (settingsUpdate && typeof settingsUpdate === 'object') {
    const current = parseSettings(tenant.settings);
    const merged = { ...current };
    for (const [k, v] of Object.entries(settingsUpdate)) {
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        merged[k] = typeof v === 'number' ? v : String(v).trim();
      }
    }
    await run('UPDATE tenants SET settings = ? WHERE id = ?', [JSON.stringify(merged), tenantId]);
  }

  invalidateTenantCache(tenantId);
  const updated = await getOne('SELECT * FROM tenants WHERE id = ?', [tenantId]);
  res.json(await tenantToClient(updated));
});

router.patch('/admin/tenants/:id/notes', authMiddleware, requirePlatformAdmin, async (req, res) => {
  const { adminNotes } = req.body ?? {};
  if (adminNotes === undefined) return res.status(400).json({ error: 'adminNotes required' });
  await setIntakeAdminNotes(req.params.id, String(adminNotes));
  res.json({ ok: true });
});

router.get('/admin/overview', authMiddleware, requirePlatformAdmin, async (_req, res) => {
  res.json(await getAdminOverview());
});

router.get('/admin/billing', authMiddleware, requirePlatformAdmin, async (_req, res) => {
  const rows = await listBillingForAdmin();
  res.json({
    subscriptions: rows.map((r) => ({
      id: r.id,
      tenantName: r.tenant_name,
      slug: r.slug,
      ownerEmail: r.owner_email,
      plan: r.plan,
      status: r.status,
      amount: r.amount,
      amountInr: Math.round((r.amount || 0) / 100),
      currency: r.currency,
      razorpayOrderId: r.razorpay_order_id,
      razorpayPaymentId: r.razorpay_payment_id,
      createdAt: r.created_at,
      periodEnd: r.current_period_end,
    })),
  });
});

router.get('/admin/tenants/:id/intake', authMiddleware, requirePlatformAdmin, async (req, res) => {
  const intake = await getIntakeForTenant(req.params.id);
  if (!intake) return res.status(404).json({ error: 'No intake found' });
  res.json(intake);
});

router.patch('/admin/tenants/:id/activate', authMiddleware, requirePlatformAdmin, async (req, res) => {
  const tenantId = req.params.id;
  const tenant = await getOne('SELECT * FROM tenants WHERE id = ?', [tenantId]);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 14);

  await run(`UPDATE tenants SET status = 'active', trial_ends_at = ? WHERE id = ?`, [trialEnd.toISOString(), tenantId]);
  await seedCatalogForTenant(tenantId, tenant.industry || 'other');

  const intake = await getIntakeForTenant(tenantId);
  if (intake?.answers) {
    const a = intake.answers;
    const settings = {
      ...parseSettings(tenant.settings),
      ...(a.citiesServed ? { city: a.citiesServed } : {}),
      ...(a.existingWhatsApp ? { agentPhone: a.existingWhatsApp, whatsappNumber: a.existingWhatsApp } : {}),
      ...(a.businessHours ? { businessHours: a.businessHours } : {}),
      ...(a.brandNotes ? { brandNotes: a.brandNotes } : {}),
      ...(a.botTone ? { botTone: a.botTone } : {}),
    };
    await run('UPDATE tenants SET settings = ? WHERE id = ?', [JSON.stringify(settings), tenantId]);
    await run(`UPDATE onboarding_intake SET status = 'reviewed' WHERE tenant_id = ?`, [tenantId]);
  }

  if (req.body?.adminNotes) await setIntakeAdminNotes(tenantId, req.body.adminNotes);
  invalidateTenantCache(tenantId);

  const updated = await getOne('SELECT * FROM tenants WHERE id = ?', [tenantId]);
  const owner = await getOne('SELECT email, name FROM users WHERE tenant_id = ? AND role = ?', [tenantId, 'owner']);
  const settings = parseSettings(updated.settings);
  void notifyCustomerActivated({
    name: owner?.name,
    businessName: updated.name,
    email: owner?.email,
    phone: settings.agentPhone || settings.whatsappNumber,
    trialEndsAt: trialEnd.toISOString(),
  });

  res.json({ ok: true, tenant: await tenantToClient(updated) });
});

router.get('/plans', (_req, res) => {
  res.json({
    plans: [
      {
        id: 'trial',
        name: 'Free Trial',
        price: 0,
        period: '14 days',
        features: [
          'WhatsApp setup help',
          'Automated replies',
          'Shared inbox',
          'Lead CRM',
          'Mini-site',
          '2 team members',
          'Support',
        ],
      },
      {
        id: 'starter',
        name: 'Starter',
        price: 999,
        period: 'month',
        features: [
          '1 WhatsApp number',
          'Reply as a team from one WhatsApp number',
          'Track every enquiry from first message to sale',
          'Share products or services with a simple branded page',
          'Answer common questions automatically',
          'WhatsApp onboarding assistance',
          '2 team members',
          'Support',
        ],
      },
      {
        id: 'growth',
        name: 'Growth',
        price: 2499,
        period: 'month',
        features: [
          'Everything in Starter',
          '5 team members',
          'Broadcast campaigns',
          'Advanced workflows',
          'Priority support',
        ],
      },
      {
        id: 'pro',
        name: 'Pro',
        price: -1,
        period: 'custom',
        customPrice: true,
        features: ['Custom workflows', 'Priority support', 'Advanced integrations'],
      },
    ],
  });
});

export default router;
