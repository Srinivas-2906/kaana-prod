import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { slugify, tenantToClient, parseSettings, seedCatalogForTenant } from '../db/index.js';
import { getOne, getAll, run } from '../db/query.js';
import { invalidateTenantCache, getTenantBySlug } from '../tenantContext.js';
import { SELF_SERVE_ENABLED, initialTenantStatus } from '../platformConfig.js';
import { createIntake } from '../services/onboarding.js';
import { notifySignup } from '../services/notify.js';
import { notifyCustomerSignup } from '../services/customerNotify.js';

const JWT_SECRET = process.env.JWT_SECRET || 'kaana-dev-secret-change-in-production';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

export function signToken(user, tenant = null) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      tenantId: tenant?.id ?? user.tenant_id,
      role: user.role,
      isPlatformAdmin: !!user.is_platform_admin,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES },
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.query.token;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      /* ignore */
    }
  }
  next();
}

export function requirePlatformAdmin(req, res, next) {
  if (!req.user?.isPlatformAdmin) {
    return res.status(403).json({ error: 'Platform admin access required' });
  }
  next();
}

export async function loginUser(identifier, password, options = {}) {
  const raw = String(identifier || '').trim();
  const tenantSlug = String(options.tenantSlug || '').trim();

  let user;
  let tenant = null;

  if (raw.includes('@')) {
    user = await getOne('SELECT * FROM users WHERE email = ?', [raw.toLowerCase()]);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return { error: 'Invalid email or password' };
    }
    if (user.tenant_id) {
      tenant = await getOne('SELECT * FROM tenants WHERE id = ?', [user.tenant_id]);
    }
  } else {
    if (!tenantSlug) {
      user = await getOne('SELECT * FROM users WHERE tenant_id IS NULL AND is_platform_admin = true AND username = ?', [raw]);
      if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return { error: 'Business slug required for username login' };
      }
      tenant = null;
    } else {
      tenant = await getTenantBySlug(tenantSlug);
      if (!tenant) return { error: 'Business not found' };
      user = await getOne('SELECT * FROM users WHERE tenant_id = ? AND username = ?', [tenant.id, raw]);
      if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return { error: 'Invalid username or password' };
      }
    }
  }
  const token = signToken(user, tenant);
  return {
    token,
    user: {
      id: user.id,
      username: user.username || null,
      email: user.email,
      name: user.name,
      role: user.role,
      isPlatformAdmin: !!user.is_platform_admin,
      mustChangePassword: !!user.must_change_password,
    },
    tenant: tenant ? await tenantToClient(tenant) : null,
  };
}

const INDUSTRY_EMOJI = {
  'real-estate': '🏠',
  clinic: '🏥',
  coaching: '📚',
  salon: '💇',
  retail: '🛍️',
  restaurant: '🍽️',
  ecommerce: '🛒',
  professional: '💼',
  fitness: '💪',
  education: '🎓',
  'home-services': '🔧',
  automotive: '🚗',
  other: '✨',
};

const INDUSTRY_BOT_NAMES = {
  'real-estate': 'PropBot',
  clinic: 'ClinicBot',
  coaching: 'CoachBot',
  salon: 'SalonBot',
  retail: 'ShopBot',
  restaurant: 'MenuBot',
  ecommerce: 'StoreBot',
  professional: 'BizBot',
  fitness: 'FitBot',
  education: 'EduBot',
  'home-services': 'ServiceBot',
  automotive: 'AutoBot',
  other: 'Kaana Bot',
};

export async function signupBusiness({ businessName, email, password, name, industry, phone, plan = 'trial' }) {
  const normalizedEmail = email.toLowerCase().trim();
  if (await getOne('SELECT id FROM users WHERE email = ?', [normalizedEmail])) {
    return { error: 'Email already registered' };
  }

  let baseSlug = slugify(businessName);
  let slug = baseSlug;
  let n = 1;
  while (await getOne('SELECT id FROM tenants WHERE slug = ?', [slug])) {
    slug = `${baseSlug}-${n++}`;
  }

  const tenantId = slug;
  const userId = nanoid();
  const tenantStatus = initialTenantStatus();
  const trialEnd = tenantStatus === 'active'
    ? (() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString(); })()
    : null;

  const industryKey = industry || 'real-estate';

  const settings = {
    botName: INDUSTRY_BOT_NAMES[industryKey] || INDUSTRY_BOT_NAMES.other,
    agentName: name?.split(' ')[0] || 'Agent',
    agentPhone: phone || '',
    city: 'Hyderabad',
    emoji: INDUSTRY_EMOJI[industryKey] || INDUSTRY_EMOJI.other,
  };

  await run(`
    INSERT INTO tenants (id, slug, name, industry, plan, status, trial_ends_at, settings)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [tenantId, slug, businessName.trim(), industryKey, plan, tenantStatus, trialEnd, JSON.stringify(settings)]);

  const hash = bcrypt.hashSync(password, 10);
  await run(`
    INSERT INTO users (id, tenant_id, email, password_hash, name, role)
    VALUES (?, ?, ?, ?, ?, 'owner')
  `, [userId, tenantId, normalizedEmail, hash, name || businessName]);

  await run(`
    INSERT INTO team_members (id, tenant_id, user_id, name, role) VALUES (?, ?, ?, ?, 'owner')
  `, [nanoid(), tenantId, userId, name || businessName]);

  const tenant = await getOne('SELECT * FROM tenants WHERE id = ?', [tenantId]);
  const user = await getOne('SELECT * FROM users WHERE id = ?', [userId]);
  await createIntake(tenantId);
  if (SELF_SERVE_ENABLED || tenantStatus === 'active') {
    await seedCatalogForTenant(tenantId, industryKey);
  }
  invalidateTenantCache(tenantId);

  void notifySignup({
    businessName: businessName.trim(),
    name: name || businessName,
    email: normalizedEmail,
    phone: phone || settings.agentPhone,
    industry: industryKey,
    plan,
  });

  void notifyCustomerSignup({
    name: name || businessName,
    businessName: businessName.trim(),
    email: normalizedEmail,
    phone: phone || settings.agentPhone,
  });

  return {
    token: signToken(user, tenant),
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    tenant: await tenantToClient(tenant),
    conciergeMode: !SELF_SERVE_ENABLED,
    nextStep: SELF_SERVE_ENABLED ? 'dashboard' : 'onboarding',
  };
}

export async function getUserProfile(userId) {
  const user = await getOne('SELECT * FROM users WHERE id = ?', [userId]);
  if (!user) return null;
  let tenant = null;
  if (user.tenant_id) {
    tenant = await getOne('SELECT * FROM tenants WHERE id = ?', [user.tenant_id]);
  }
  return {
    user: {
      id: user.id,
      username: user.username || null,
      email: user.email,
      name: user.name,
      role: user.role,
      isPlatformAdmin: !!user.is_platform_admin,
      mustChangePassword: !!user.must_change_password,
    },
    tenant: tenant ? await tenantToClient(tenant) : null,
  };
}

export async function updateTenantSettings(tenantId, patch) {
  const row = await getOne('SELECT settings FROM tenants WHERE id = ?', [tenantId]);
  if (!row) return null;
  const settings = { ...parseSettings(row.settings), ...patch };
  await run('UPDATE tenants SET settings = ? WHERE id = ?', [JSON.stringify(settings), tenantId]);
  invalidateTenantCache(tenantId);
  const tenant = await getOne('SELECT * FROM tenants WHERE id = ?', [tenantId]);
  return await tenantToClient(tenant);
}

export async function listAllTenants() {
  const rows = await getAll('SELECT * FROM tenants ORDER BY created_at DESC');
  const results = [];
  for (const row of rows) {
    const client = await tenantToClient(row);
    const owner = await getOne(`SELECT email, name FROM users WHERE tenant_id = ? AND role = 'owner' LIMIT 1`, [row.id]);
    results.push({
      ...client,
      ownerEmail: owner?.email ?? '',
      ownerName: owner?.name ?? '',
      createdAt: row.created_at,
    });
  }
  return results;
}
