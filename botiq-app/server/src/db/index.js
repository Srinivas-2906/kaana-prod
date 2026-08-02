import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCatalogTemplate } from '../templates/catalogTemplates.js';
import { getSetupStatus } from '../services/setupStatus.js';
import { exec, getAll, getOne, run } from './query.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, '../../migrations');

export async function initDatabase() {
  await runMigrations();
  await seedDefaults();
  await syncDentaCareDemo();
  await migrateCatalogs();
}

async function runMigrations() {
  await exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const id = file.replace(/\.sql$/, '');
    const applied = await getOne('SELECT id FROM schema_migrations WHERE id = ?', [id]);
    if (applied) continue;

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    await exec(sql);
    await run('INSERT INTO schema_migrations (id) VALUES (?)', [id]);
    console.log(`✅ Migration applied: ${file}`);
  }
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'business';
}

export function parseSettings(raw) {
  try {
    if (raw == null) return {};
    if (typeof raw === 'object') return raw;
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function parseJsonField(raw, fallback) {
  try {
    if (raw == null) return fallback;
    if (typeof raw === 'object') return raw;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function tenantToClient(row) {
  const s = parseSettings(row.settings);
  let products = ['platform', 'inbox', 'crm', 'clinic'];
  const parsedProducts = parseJsonField(row.products, products);
  if (Array.isArray(parsedProducts) && parsedProducts.every((x) => typeof x === 'string')) {
    products = parsedProducts;
  }

  const intake = await getOne(
    'SELECT status, submitted_at FROM onboarding_intake WHERE tenant_id = ?',
    [row.id],
  );
  const intakeParsed = intake ? { status: intake.status, submittedAt: intake.submitted_at } : null;
  const setup = getSetupStatus(row, intakeParsed);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    botName: s.botName || 'PropBot',
    agentName: s.agentName || 'Agent',
    agentPhone: s.agentPhone || s.whatsappNumber || '',
    whatsappNumber: s.whatsappNumber || s.agentPhone || '',
    city: s.city || 'India',
    emoji: s.emoji || '🏠',
    industry: row.industry,
    plan: row.plan,
    status: row.status,
    whatsappConnected: !!(row.whatsapp_phone_id && row.whatsapp_token),
    isLive: row.status === 'active',
    onboardingPending: row.status === 'pending_onboarding',
    intakeStatus: intake?.status ?? 'draft',
    intakeSubmitted: intake?.status === 'submitted' || intake?.status === 'reviewed',
    intakeSubmittedAt: intake?.submitted_at ?? null,
    trialEndsAt: setup.trialEndsAt,
    trialEndsAtFormatted: setup.trialEndsAtFormatted,
    trialDaysLeft: setup.trialDaysLeft,
    trialStarted: setup.trialStarted,
    setupStatus: setup.steps,
    setupCurrentStep: setup.currentStep,
    products,
  };
}

export async function seedCatalogForTenant(tenantId, industry) {
  const existing = await getOne(
    'SELECT id FROM catalog_items WHERE tenant_id = ? LIMIT 1',
    [tenantId],
  );
  if (existing) return;

  const items = getCatalogTemplate(industry);
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    await run(
      `INSERT INTO catalog_items (id, tenant_id, title, subtitle, price, price_num, meta, image_url, category, bhk, location, status, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Available', ?)`,
      [
        nanoid(10), tenantId, item.title, item.subtitle, item.price, item.priceNum ?? 0,
        item.meta, item.image, item.category, item.bhk || null, item.location || null, i,
      ],
    );
  }
}

export async function getCatalogItems(tenantId, filters = {}) {
  let sql = 'SELECT * FROM catalog_items WHERE tenant_id = ?';
  const params = [tenantId];
  if (filters.category) {
    sql += ' AND category = ?';
    params.push(filters.category);
  }
  if (filters.bhk) {
    sql += ' AND bhk = ?';
    params.push(filters.bhk);
  }
  if (filters.budgetMin != null) {
    sql += ' AND price_num >= ?';
    params.push(filters.budgetMin);
  }
  if (filters.budgetMax != null) {
    sql += ' AND price_num <= ?';
    params.push(filters.budgetMax);
  }
  sql += ' ORDER BY sort_order ASC';
  return getAll(sql, params);
}

async function seedDefaults() {
  const existing = await getOne('SELECT id FROM tenants WHERE id = ?', ['prestige-properties']);
  if (!existing) {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);
    await run(
      `INSERT INTO tenants (id, slug, name, industry, plan, status, trial_ends_at, settings, whatsapp_phone_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'prestige-properties',
        'prestige-properties',
        'Prestige Properties',
        'real-estate',
        'growth',
        'active',
        trialEnd.toISOString(),
        JSON.stringify({
          botName: 'PropBot',
          agentName: 'Priya',
          agentPhone: '+91 98400 00000',
          city: 'Hyderabad',
          emoji: '🏠',
        }),
        process.env.WHATSAPP_PHONE_NUMBER_ID || null,
      ],
    );
    await seedCatalogForTenant('prestige-properties', 'real-estate');
  }

  const adminUsername = (process.env.PLATFORM_ADMIN_USERNAME || 'Admin').trim() || 'Admin';
  const adminEmail = (process.env.PLATFORM_ADMIN_EMAIL || 'admin@kaana.ai').toLowerCase();
  const adminPassword = process.env.PLATFORM_ADMIN_PASSWORD || 'kaanaadmin';
  const hash = bcrypt.hashSync(adminPassword, 10);
  const adminUser = await getOne('SELECT id FROM users WHERE email = ?', [adminEmail]);
  if (!adminUser) {
    await run(
      `INSERT INTO users (id, tenant_id, username, email, password_hash, name, role, is_platform_admin)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
      ['user-admin', null, adminUsername, adminEmail, hash, 'Platform Admin', 'platform_admin'],
    );
  } else {
    await run(
      'UPDATE users SET password_hash = ?, is_platform_admin = TRUE, username = ? WHERE email = ?',
      [hash, adminUsername, adminEmail],
    );
  }
}

async function syncDentaCareDemo() {
  const tenantId = 'denta-care';
  const settings = {
    botName: 'Reception',
    agentName: 'Reception',
    agentPhone: '',
    city: 'Visakhapatnam',
    emoji: '🦷',
    doctorName: 'Dr. D. Ajit',
    doctorQualification: 'BDS, MDS — Oral Medicine & Radiology',
    experience: '18 years',
    address: '#39-11-70, 1st Floor, Shankar Plaza, Muralinagar, Visakhapatnam',
    hoursLabel: 'Mon–Sat · 10 AM – 1 PM · 5 PM – 9 PM',
    consultationFee: 100,
    clinicHours: { start: 10, end: 21, slotMin: 30 },
  };
  const tenantSlug = 'dentacare';

  const existing = await getOne('SELECT id FROM tenants WHERE id = ?', [tenantId]);
  if (!existing) {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);
    await run(
      `INSERT INTO tenants (id, slug, name, industry, plan, status, trial_ends_at, settings, whatsapp_phone_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tenantId,
        tenantSlug,
        'Denta Care Dental Clinic',
        'clinic',
        'growth',
        'active',
        trialEnd.toISOString(),
        JSON.stringify(settings),
        process.env.WHATSAPP_PHONE_NUMBER_ID || null,
      ],
    );
    await seedCatalogForTenant(tenantId, 'clinic');
  } else {
    await run(
      'UPDATE tenants SET slug = ?, name = ?, settings = ? WHERE id = ?',
      [tenantSlug, 'Denta Care Dental Clinic', JSON.stringify(settings), tenantId],
    );
  }

  const demoAccounts = [
    { id: 'user-dentacare-owner', email: 'ajitdentacare@gmail.com', username: 'Admin', name: 'Dr. D. Ajit', password: 'Dentacare@123' },
    { id: 'user-denta-care-admin', email: 'admin@dentacare.in', username: null, name: 'Dr. D. Ajit', password: 'Dentacare@2024' },
    { id: 'user-denta-care', email: 'demo@dentacare.in', username: null, name: 'Dr. D. Ajit', password: 'demo1234' },
    { id: 'user-denta-care-alt', email: 'clinic@demo.kaana.in', username: null, name: 'Dr. D. Ajit', password: 'demo1234' },
  ];

  await run('UPDATE users SET username = NULL WHERE tenant_id = ?', [tenantId]);
  for (const acct of demoAccounts) {
    const hash = bcrypt.hashSync(acct.password, 10);
    const user = await getOne('SELECT id FROM users WHERE email = ?', [acct.email]);
    if (!user) {
      await run(
        `INSERT INTO users (id, tenant_id, username, email, password_hash, name, role, is_platform_admin)
         VALUES (?, ?, ?, ?, ?, ?, 'owner', FALSE)`,
        [acct.id, tenantId, acct.username || null, acct.email, hash, acct.name],
      );
    } else {
      await run(
        'UPDATE users SET tenant_id = ?, username = ?, name = ?, password_hash = ? WHERE email = ?',
        [tenantId, acct.username || null, acct.name, hash, acct.email],
      );
    }
  }

  await seedDentaCareSampleData(tenantId);
}

async function seedDentaCareSampleData(tenantId) {
  const today = new Date().toISOString().slice(0, 10);
  const countRow = await getOne(
    `SELECT COUNT(*)::int AS c FROM appointments WHERE tenant_id = ? AND scheduled_at::date = ?::date`,
    [tenantId, today],
  );
  if ((countRow?.c ?? 0) >= 2) return;

  const samples = [
    { id: 'pat-demo-1', name: 'Lakshmi Reddy', phone: '9876543210', complaint: 'Tooth pain', service: 'Conservative Dentistry', hour: 10, min: 30, status: 'requested', source: 'WhatsApp' },
    { id: 'pat-demo-2', name: 'Rajesh Kumar', phone: '9876543211', complaint: 'Denture consult', service: 'Complete/Partial Dentures', hour: 11, min: 0, status: 'confirmed', source: 'Walk-in' },
    { id: 'pat-demo-3', name: 'Priya Sharma', phone: '9876543212', complaint: 'Smile makeover', service: 'Cosmetic Dentistry', hour: 17, min: 30, status: 'confirmed', source: 'WhatsApp' },
  ];

  for (const s of samples) {
    const pat = await getOne('SELECT id FROM patients WHERE id = ?', [s.id]);
    if (!pat) {
      await run(
        `INSERT INTO patients (id, tenant_id, name, phone, phone_digits, chief_complaint, source)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          s.id, tenantId, s.name,
          `+91 ${s.phone.slice(0, 5)} ${s.phone.slice(5)}`,
          s.phone, s.complaint, s.source,
        ],
      );
    }
    const apptExists = await getOne(
      `SELECT id FROM appointments WHERE patient_id = ? AND scheduled_at::date = ?::date`,
      [s.id, today],
    );
    if (!apptExists) {
      const scheduledAt = `${today}T${String(s.hour).padStart(2, '0')}:${String(s.min).padStart(2, '0')}:00`;
      await run(
        `INSERT INTO appointments (id, tenant_id, patient_id, service, scheduled_at, status, source)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (id) DO NOTHING`,
        [`appt-${s.id}`, tenantId, s.id, s.service, scheduledAt, s.status, s.source],
      );
    }
  }
}

async function migrateCatalogs() {
  const tenants = await getAll('SELECT id, industry FROM tenants');
  for (const t of tenants) {
    await seedCatalogForTenant(t.id, t.industry || 'other');
  }
}

export { slugify };

/** @deprecated Use query helpers directly. Kept for gradual migration. */
export function getDb() {
  throw new Error('getDb() is removed — use async query helpers from db/query.js');
}
