import { Router } from 'express';
import { getTenantBySlug } from '../tenantContext.js';
import { handleIncomingMessage } from '../conversation.js';

const router = Router();

const DEMO_ENABLED = process.env.DEMO_MODE === 'true' || process.env.NODE_ENV !== 'production';

/**
 * Simulate an inbound WhatsApp message locally (no Meta webhook needed).
 * POST /api/demo/whatsapp
 * { "tenantSlug": "smile-dental", "phone": "919876543210", "message": "hi" }
 */
router.post('/whatsapp', async (req, res) => {
  if (!DEMO_ENABLED) {
    return res.status(403).json({ error: 'Demo endpoint disabled in production. Set DEMO_MODE=true to enable.' });
  }

  const { tenantSlug, phone, message, buttonPayload } = req.body ?? {};
  if (!tenantSlug || !phone) {
    return res.status(400).json({ error: 'tenantSlug and phone required' });
  }

  const tenant = getTenantBySlug(tenantSlug);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  try {
    await handleIncomingMessage(phone, message || '', buttonPayload || '', `demo-${Date.now()}`, tenant.id);
    return res.json({ ok: true, tenant: tenant.slug, phone, message: message || buttonPayload });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Handler failed' });
  }
});

router.get('/clinic-credentials', (_req, res) => {
  if (!DEMO_ENABLED) return res.status(403).json({ error: 'Disabled in production' });
  res.json({
    login: { email: 'demo@dentacare.in', password: 'demo1234' },
    tenant: 'denta-care',
    clinic: 'Denta Care Dental Clinic — Dr. D. Ajit',
    simulate: 'POST /api/demo/whatsapp with { tenantSlug: "denta-care", phone, message }',
  });
});

export default router;
