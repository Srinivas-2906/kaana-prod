import { getDb, tenantToClient } from './db/index.js';

const tenantCache = new Map();
let defaultTenantId = process.env.DEFAULT_TENANT_ID || 'prestige-properties';

const asyncLocal = { tenantId: null };

export function setRequestTenant(tenantId) {
  asyncLocal.tenantId = tenantId;
}

export function getRequestTenantId() {
  return asyncLocal.tenantId || defaultTenantId;
}

export function clearRequestTenant() {
  asyncLocal.tenantId = null;
}

export function runWithTenant(tenantId, fn) {
  const prev = asyncLocal.tenantId;
  asyncLocal.tenantId = tenantId;
  try {
    return fn();
  } finally {
    asyncLocal.tenantId = prev;
  }
}

export async function runWithTenantAsync(tenantId, fn) {
  const prev = asyncLocal.tenantId;
  asyncLocal.tenantId = tenantId;
  try {
    return await fn();
  } finally {
    asyncLocal.tenantId = prev;
  }
}

export function getTenantById(id) {
  if (!id) return null;
  const cached = tenantCache.get(id);
  if (cached) return cached;
  const row = getDb().prepare('SELECT * FROM tenants WHERE id = ?').get(id);
  if (row) tenantCache.set(id, row);
  return row ?? null;
}

export function getTenantBySlug(slug) {
  const row = getDb().prepare('SELECT * FROM tenants WHERE slug = ?').get(slug);
  if (row) tenantCache.set(row.id, row);
  return row ?? null;
}

export function getTenantByWhatsAppPhoneId(phoneId) {
  if (!phoneId) return null;
  const row = getDb().prepare('SELECT * FROM tenants WHERE whatsapp_phone_id = ?').get(phoneId);
  if (row) tenantCache.set(row.id, row);
  return row ?? null;
}

export function getClient() {
  const tenant = getTenantById(getRequestTenantId());
  if (!tenant) {
    return {
      id: defaultTenantId,
      slug: 'demo',
      name: 'Demo Business',
      botName: 'PropBot',
      agentName: 'Agent',
      agentPhone: '',
      city: 'India',
      emoji: '🏠',
    };
  }
  return tenantToClient(tenant);
}

export function invalidateTenantCache(id) {
  tenantCache.delete(id);
}

export function isTenantActive(tenant) {
  if (!tenant) return false;
  if (tenant.status === 'suspended') return false;
  if (tenant.status === 'pending_onboarding') return false;
  if (tenant.plan === 'trial' && tenant.trial_ends_at) {
    return new Date(tenant.trial_ends_at) > new Date();
  }
  return tenant.status === 'active';
}

export function checkTenantLimits(tenantId) {
  const tenant = getTenantById(tenantId);
  if (!tenant || !isTenantActive(tenant)) {
    return { ok: false, reason: 'Account inactive or trial expired. Upgrade at kaana.ai/pricing' };
  }
  const month = new Date().toISOString().slice(0, 7);
  const usage = getDb().prepare('SELECT bot_replies FROM usage WHERE tenant_id = ? AND month = ?').get(tenantId, month);
  const limits = { trial: 200, starter: 500, growth: 2000, pro: 10000 };
  const cap = limits[tenant.plan] ?? 500;
  if ((usage?.bot_replies ?? 0) >= cap) {
    return { ok: false, reason: 'Monthly message limit reached. Upgrade your plan.' };
  }
  return { ok: true, cap, used: usage?.bot_replies ?? 0 };
}

export function incrementUsage(tenantId, field = 'bot_replies') {
  const month = new Date().toISOString().slice(0, 7);
  getDb().prepare(`
    INSERT INTO usage (tenant_id, month, ${field}) VALUES (?, ?, 1)
    ON CONFLICT(tenant_id, month) DO UPDATE SET ${field} = ${field} + 1
  `).run(tenantId, month);
}
