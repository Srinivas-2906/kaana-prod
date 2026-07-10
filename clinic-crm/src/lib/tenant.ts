export const DENTA_CARE_SLUG = 'dentacare';

const DENTA_CARE_LOGIN = {
  user: 'ajitdentacare@gmail.com',
  pass: 'Dentacare@123',
  label: 'Denta Care — Dr. D. Ajit',
};

export const TENANT_LOGIN_DEFAULTS: Record<string, { user: string; pass: string; label: string }> = {
  [DENTA_CARE_SLUG]: DENTA_CARE_LOGIN,
  'denta-care': DENTA_CARE_LOGIN,
};

export function getTenantLoginDefaults(slug: string | null) {
  if (slug && TENANT_LOGIN_DEFAULTS[slug]) return TENANT_LOGIN_DEFAULTS[slug];
  return { user: 'Admin', pass: 'Kaana@2024', label: 'Platform admin' };
}

export function resolveTenantSlug(): string | null {
  const params = new URLSearchParams(window.location.search);
  const qp = params.get('tenant') || params.get('workspace');
  if (qp) return qp.trim();

  const env = (import.meta as any).env?.VITE_TENANT_SLUG as string | undefined;
  if (env && typeof env === 'string' && env.trim()) return env.trim();

  const host = window.location.hostname;
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return DENTA_CARE_SLUG;
  }
  const parts = host.split('.');
  if (parts.length < 3) return null;
  const slug = parts[0];
  const product = parts[1];
  if (!slug || slug === 'www') return null;
  if (!['inbox', 'crm', 'clinic', 'app'].includes(product)) return null;
  return slug;
}

