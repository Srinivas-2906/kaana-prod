import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { getDb, slugify, seedCatalogForTenant, parseSettings } from '../db/index.js';
import { invalidateTenantCache, getTenantBySlug } from '../tenantContext.js';
import { createIntake } from './onboarding.js';

const DEFAULT_USERNAME = process.env.DEFAULT_TENANT_ADMIN_USERNAME || 'Admin';
const DEFAULT_PASSWORD = process.env.DEFAULT_TENANT_ADMIN_PASSWORD || 'Kaana@2024';

const INDUSTRY_EMOJI = {
  'real-estate': '🏠',
  clinic: '🦷',
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

function uniqueTenantSlug(businessName) {
  const db = getDb();
  let baseSlug = slugify(businessName);
  let slug = baseSlug;
  let n = 1;
  while (db.prepare('SELECT id FROM tenants WHERE slug = ?').get(slug)) {
    slug = `${baseSlug}-${n++}`;
  }
  return slug;
}

function isValidSlug(slug) {
  if (!slug || slug.length > 48) return false;
  if (!/^[a-z0-9-]+$/.test(slug)) return false;
  if (slug.startsWith('-') || slug.endsWith('-')) return false;
  if (slug.includes('--')) return false;
  return true;
}

function trialEndIso(days = 14) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function provisionTenantByAdmin(input) {
  const db = getDb();
  const businessName = String(input?.businessName || '').trim();
  if (!businessName) return { error: 'businessName required' };

  const industry = String(input?.industry || 'clinic').trim() || 'clinic';
  const ownerName = String(input?.ownerName || '').trim() || DEFAULT_USERNAME;
  const ownerPhone = String(input?.ownerPhone || '').trim();
  const adminUsername = String(input?.adminUsername || DEFAULT_USERNAME).trim() || DEFAULT_USERNAME;
  const adminPassword = String(input?.adminPassword || DEFAULT_PASSWORD);
  const mustChangePassword = input?.mustChangePassword === undefined ? false : !!input.mustChangePassword;
  if (adminPassword.length < 6) return { error: 'adminPassword must be at least 6 characters' };

  const products = Array.isArray(input?.products) ? input.products.filter((p) => typeof p === 'string') : null;
  const productsJson = JSON.stringify(products?.length ? products : ['platform', 'inbox', 'crm', 'clinic']);

  const slug = input?.slug ? String(input.slug).trim() : uniqueTenantSlug(businessName);
  if (!isValidSlug(slug)) {
    return { error: 'Invalid slug (use lowercase letters, numbers, hyphens)' };
  }
  if (getTenantBySlug(slug)) return { error: 'Slug already exists' };

  const tenantId = slug;
  const settings = {
    botName: String(input?.botName || '').trim() || INDUSTRY_BOT_NAMES[industry] || INDUSTRY_BOT_NAMES.other,
    agentName: ownerName.split(' ')[0] || DEFAULT_USERNAME,
    agentPhone: ownerPhone || '',
    city: String(input?.city || '').trim() || 'India',
    emoji: String(input?.emoji || '').trim() || INDUSTRY_EMOJI[industry] || INDUSTRY_EMOJI.other,
  };

  // Clinic-specific settings
  if (input?.doctorName) settings.doctorName = String(input.doctorName).trim();
  if (input?.doctorQualification) settings.doctorQualification = String(input.doctorQualification).trim();
  if (input?.experience) settings.experience = String(input.experience).trim();
  if (input?.address) settings.address = String(input.address).trim();
  if (input?.hoursLabel) settings.hoursLabel = String(input.hoursLabel).trim();
  if (input?.consultationFee !== undefined && input.consultationFee !== '') {
    settings.consultationFee = Number(input.consultationFee) || 0;
  }

  const status = String(input?.status || 'active');
  const plan = String(input?.plan || 'trial');
  const trialEndsAt = plan === 'trial' ? trialEndIso(14) : null;

  db.prepare(`
    INSERT INTO tenants (id, slug, name, industry, plan, status, trial_ends_at, settings, products)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    tenantId,
    slug,
    businessName,
    industry,
    plan,
    status,
    trialEndsAt,
    JSON.stringify(settings),
    productsJson,
  );

  const userId = nanoid();
  const hash = bcrypt.hashSync(adminPassword, 10);
  const email = (input?.ownerEmail && String(input.ownerEmail).trim())
    ? String(input.ownerEmail).trim().toLowerCase()
    : `admin+${slug}@kaana.in`;

  db.prepare(`
    INSERT INTO users (id, tenant_id, username, email, password_hash, name, role, must_change_password)
    VALUES (?, ?, ?, ?, ?, ?, 'owner', ?)
  `).run(userId, tenantId, adminUsername, email, hash, ownerName, mustChangePassword ? 1 : 0);

  db.prepare(`
    INSERT INTO team_members (id, tenant_id, user_id, name, role)
    VALUES (?, ?, ?, ?, 'owner')
  `).run(nanoid(), tenantId, userId, ownerName);

  createIntake(tenantId);
  seedCatalogForTenant(tenantId, industry);
  invalidateTenantCache(tenantId);

  const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantId);
  return {
    tenantId,
    slug,
    tenant,
    credentials: {
      username: adminUsername,
      password: adminPassword,
      email,
      mustChangePassword,
    },
  };
}

export function resetTenantAdminPassword(tenantId, password = DEFAULT_PASSWORD) {
  const db = getDb();
  const t = db.prepare('SELECT id, settings FROM tenants WHERE id = ?').get(tenantId);
  if (!t) return { error: 'Tenant not found' };
  const hash = bcrypt.hashSync(String(password), 10);
  const u = db.prepare('SELECT id, email, username FROM users WHERE tenant_id = ? AND role = ? ORDER BY created_at ASC LIMIT 1')
    .get(tenantId, 'owner');
  if (!u) return { error: 'No owner user found' };
  db.prepare('UPDATE users SET password_hash = ?, must_change_password = 1 WHERE id = ?').run(hash, u.id);
  invalidateTenantCache(tenantId);
  return {
    ok: true,
    userId: u.id,
    email: u.email,
    username: u.username,
    password: String(password),
    mustChangePassword: true,
    display: { name: parseSettings(t.settings)?.botName || 'Admin' },
  };
}

