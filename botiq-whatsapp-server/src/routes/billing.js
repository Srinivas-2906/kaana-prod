import { Router } from 'express';
import crypto from 'crypto';
import { nanoid } from 'nanoid';
import { authMiddleware } from '../middleware/auth.js';
import { getDb } from '../db/index.js';
import { invalidateTenantCache } from '../tenantContext.js';
import { SELF_SERVE_ENABLED } from '../platformConfig.js';
import { notifyPayment } from '../services/notify.js';

const router = Router();

const PLANS = {
  starter: { amount: 99900, name: 'Starter', plan: 'starter' },
  growth: { amount: 249900, name: 'Growth', plan: 'growth' },
};

function getRazorpayKeys() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret };
}

router.post('/create-order', authMiddleware, async (req, res) => {
  const planId = req.body?.plan || 'starter';
  const plan = PLANS[planId];
  if (!plan) return res.status(400).json({ error: planId === 'pro' ? 'Contact us for Pro pricing' : 'Invalid plan' });

  const tenantId = req.user.tenantId;
  if (!tenantId) return res.status(403).json({ error: 'Tenant required' });

  const tenant = getDb().prepare('SELECT status FROM tenants WHERE id = ?').get(tenantId);
  if (!SELF_SERVE_ENABLED && tenant?.status === 'pending_onboarding') {
    return res.status(403).json({ error: 'Billing opens after your workspace goes live.', code: 'ONBOARDING_PENDING' });
  }

  const keys = getRazorpayKeys();
  if (!keys) {
    return res.status(503).json({ error: 'Billing is not configured. Contact support.' });
  }

  const orderId = `order_${nanoid(12)}`;
  const subId = nanoid();

  getDb().prepare(`
    INSERT INTO subscriptions (id, tenant_id, plan, status, razorpay_order_id, amount, currency)
    VALUES (?, ?, ?, 'pending', ?, ?, 'INR')
  `).run(subId, tenantId, plan.plan, orderId, plan.amount);

  try {
    const auth = Buffer.from(`${keys.keyId}:${keys.keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: plan.amount,
        currency: 'INR',
        receipt: orderId,
        notes: { tenantId, plan: plan.plan },
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(502).json({ error: data.error?.description || 'Razorpay error' });
    }
    getDb().prepare('UPDATE subscriptions SET razorpay_order_id = ? WHERE id = ?').run(data.id, subId);
    res.json({ order: data, key: keys.keyId, subscriptionId: subId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/verify', authMiddleware, (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body ?? {};
  const keys = getRazorpayKeys();

  if (!keys) {
    return res.status(503).json({ error: 'Billing is not configured. Contact support.' });
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto.createHmac('sha256', keys.keySecret).update(body).digest('hex');
  if (expected !== razorpay_signature) {
    return res.status(400).json({ error: 'Invalid payment signature' });
  }

  activatePlan(req.user.tenantId, plan || 'starter', razorpay_order_id, razorpay_payment_id);
  res.json({ ok: true });
});

function activatePlan(tenantId, plan, orderId, paymentId, demo = false) {
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  getDb().prepare(`
    UPDATE subscriptions SET status = 'active', razorpay_payment_id = ?, current_period_end = ?
    WHERE tenant_id = ? AND razorpay_order_id = ?
  `).run(paymentId || null, periodEnd.toISOString(), tenantId, orderId);
  getDb().prepare('UPDATE tenants SET plan = ?, status = ? WHERE id = ?').run(plan, 'active', tenantId);
  invalidateTenantCache(tenantId);

  const tenant = getDb().prepare('SELECT name FROM tenants WHERE id = ?').get(tenantId);
  const sub = getDb().prepare('SELECT amount FROM subscriptions WHERE tenant_id = ? AND razorpay_order_id = ?').get(tenantId, orderId);
  void notifyPayment({
    tenantName: tenant?.name ?? tenantId,
    plan,
    amount: sub?.amount,
    paymentId,
    demo,
  });
}

router.post('/webhook', (req, res) => {
  res.json({ received: true });
});

export default router;
