import { parseSettings, tenantToClient } from './db/index.js';
import { getOne, run } from './db/query.js';

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

export async function getTenantById(id) {
  if (!id) return null;
  const cached = tenantCache.get(id);
  if (cached) return cached;
  const row = await getOne('SELECT * FROM tenants WHERE id = ?', [id]);
  if (row) tenantCache.set(id, row);
  return row ?? null;
}

const SLUG_ALIASES = {
  'denta-care': 'dentacare',
  ajithdentacare: 'dentacare',
};

export async function getTenantBySlug(slug) {
  const resolved = SLUG_ALIASES[slug] || slug;
  const row = await getOne('SELECT * FROM tenants WHERE slug = ?', [resolved]);
  if (row) tenantCache.set(row.id, row);
  return row ?? null;
}

export async function getTenantByWhatsAppPhoneId(phoneId) {
  if (!phoneId) return null;
  const row = await getOne('SELECT * FROM tenants WHERE whatsapp_phone_id = ?', [phoneId]);
  if (row) tenantCache.set(row.id, row);
  return row ?? null;
}

export function getClient() {
  const tenantId = getRequestTenantId();
  const cached = tenantCache.get(tenantId);
  if (!cached) {
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
  const s = parseSettings(cached.settings);
  let products = ['platform', 'inbox', 'crm', 'clinic'];
  try {
    const parsed = typeof cached.products === 'object' ? cached.products : JSON.parse(cached.products || '[]');
    if (Array.isArray(parsed)) products = parsed;
  } catch { /* ignore */ }
  return {
    id: cached.id,
    slug: cached.slug,
    name: cached.name,
    botName: s.botName || 'PropBot',
    agentName: s.agentName || 'Agent',
    agentPhone: s.agentPhone || s.whatsappNumber || '',
    whatsappNumber: s.whatsappNumber || s.agentPhone || '',
    city: s.city || 'India',
    emoji: s.emoji || '🏠',
    industry: cached.industry,
    plan: cached.plan,
    status: cached.status,
    products,
  };
}

export async function getClientAsync() {
  const tenant = await getTenantById(getRequestTenantId());
  if (!tenant) return getClient();
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

export async function checkTenantLimits(tenantId) {
  const tenant = await getTenantById(tenantId);
  if (!tenant || !isTenantActive(tenant)) {
    return { ok: false, reason: 'Account inactive or trial expired. Upgrade at kaana.ai/pricing' };
  }
  const month = new Date().toISOString().slice(0, 7);
  const usage = await getOne('SELECT bot_replies FROM usage WHERE tenant_id = ? AND month = ?', [tenantId, month]);
  const limits = { trial: 200, starter: 500, growth: 2000, pro: 10000 };
  const cap = limits[tenant.plan] ?? 500;
  if ((usage?.bot_replies ?? 0) >= cap) {
    return { ok: false, reason: 'Monthly message limit reached. Upgrade your plan.' };
  }
  return { ok: true, cap, used: usage?.bot_replies ?? 0 };
}

export async function incrementUsage(tenantId, field = 'bot_replies') {
  const month = new Date().toISOString().slice(0, 7);
  await run(
    `INSERT INTO usage (tenant_id, month, ${field}) VALUES (?, ?, 1)
     ON CONFLICT (tenant_id, month) DO UPDATE SET ${field} = usage.${field} + 1`,
    [tenantId, month],
  );
}

/** Preload tenant into cache for sync getClient() in bot handlers. */
export async function ensureTenantCached(tenantId) {
  await getTenantById(tenantId);
}
