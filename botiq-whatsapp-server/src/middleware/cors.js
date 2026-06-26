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

export function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;
  if (origin && (ALLOWED_ORIGINS.has(origin) || process.env.NODE_ENV !== 'production')) {
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
