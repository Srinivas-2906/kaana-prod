const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5180',
  'http://localhost:5185',
  'https://kaana.in',
  'https://www.kaana.in',
  'https://app.kaana.in',
  'https://inbox.kaana.in',
  'https://crm.kaana.in',
  'https://clinic.kaana.in',
  'https://api.kaana.in',
]);

const RESERVED_SUBDOMAINS = new Set([
  'www', 'app', 'api', 'inbox', 'crm', 'clinic', 'admin', 'mail', 'kaana',
]);

const PRODUCT_PREFIXES = new Set(['inbox', 'crm', 'clinic', 'app', 'chat']);

function isCloudRunOrigin(origin) {
  try {
    return new URL(origin).hostname.endsWith('.run.app');
  } catch {
    return false;
  }
}

/** crm.dentacare.kaana.in, dentacare.crm.kaana.in (legacy), dentacare.kaana.in */
function isAllowedTenantOrigin(origin) {
  try {
    const { hostname } = new URL(origin);
    const parts = hostname.split('.');
    if (parts.length < 3 || parts[parts.length - 2] !== 'kaana' || parts[parts.length - 1] !== 'in') {
      return false;
    }

    // crm.{tenant}.kaana.in (preferred)
    if (parts.length >= 4 && PRODUCT_PREFIXES.has(parts[0].toLowerCase())) {
      const slug = parts[1];
      return !!slug && !RESERVED_SUBDOMAINS.has(slug.toLowerCase());
    }

    // {tenant}.{product}.kaana.in (legacy)
    if (parts.length >= 4 && PRODUCT_PREFIXES.has(parts[1].toLowerCase())) {
      const slug = parts[0];
      return !!slug && !RESERVED_SUBDOMAINS.has(slug.toLowerCase());
    }

    // {tenant}.kaana.in (marketing / clinic site)
    if (parts.length === 3) {
      const slug = parts[0];
      return !!slug && !RESERVED_SUBDOMAINS.has(slug.toLowerCase());
    }

    return false;
  } catch {
    return false;
  }
}

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (isCloudRunOrigin(origin)) return true;
  if (isAllowedTenantOrigin(origin)) return true;
  if (process.env.NODE_ENV !== 'production') return true;
  return false;
}

export function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tenant-Slug');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
}
