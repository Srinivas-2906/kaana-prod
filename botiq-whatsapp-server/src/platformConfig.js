import { getDb } from './db/index.js';

/** When false, new signups enter manual onboarding (first 5–10 customers). */
export const SELF_SERVE_ENABLED = process.env.KAANA_SELF_SERVE === 'true';

/** Max businesses we onboard manually before opening self-serve. */
export const CONCIERGE_SPOTS = Number(process.env.KAANA_CONCIERGE_SPOTS) || 10;

export function getPlatformConfig() {
  const db = getDb();
  const onboarded = db.prepare(`
    SELECT COUNT(*) as c FROM tenants WHERE status IN ('active', 'pending_onboarding')
  `).get().c;
  return {
    selfServeEnabled: SELF_SERVE_ENABLED,
    conciergeMode: !SELF_SERVE_ENABLED,
    conciergeSpotsTotal: CONCIERGE_SPOTS,
    conciergeSpotsRemaining: Math.max(0, CONCIERGE_SPOTS - onboarded),
    onboardingMessage: SELF_SERVE_ENABLED
      ? 'Create your workspace and go live in minutes.'
      : 'We personally set up your bot, inbox, CRM, and mini-site — usually within 24 hours.',
  };
}

export function isTenantLive(tenant) {
  if (!tenant) return false;
  return tenant.status === 'active';
}

export function initialTenantStatus() {
  return SELF_SERVE_ENABLED ? 'active' : 'pending_onboarding';
}
