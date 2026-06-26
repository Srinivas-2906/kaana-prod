import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getCatalogTemplate } from '../data/catalogTemplates.js';
import { getSetupStatus } from '../services/setupStatus.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');
const DB_PATH = process.env.DATABASE_PATH || path.join(DATA_DIR, 'kaana.db');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      industry TEXT DEFAULT 'real-estate',
      plan TEXT DEFAULT 'trial',
      status TEXT DEFAULT 'active',
      trial_ends_at TEXT,
      settings TEXT DEFAULT '{}',
      whatsapp_phone_id TEXT,
      whatsapp_token TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      tenant_id TEXT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'owner',
      is_platform_admin INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      plan TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT,
      razorpay_sub_id TEXT,
      amount INTEGER DEFAULT 0,
      currency TEXT DEFAULT 'INR',
      current_period_end TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    );

    CREATE TABLE IF NOT EXISTS usage (
      tenant_id TEXT NOT NULL,
      month TEXT NOT NULL,
      messages_sent INTEGER DEFAULT 0,
      bot_replies INTEGER DEFAULT 0,
      ai_tokens INTEGER DEFAULT 0,
      PRIMARY KEY (tenant_id, month)
    );

    CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_subs_tenant ON subscriptions(tenant_id);

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      phone TEXT NOT NULL,
      name TEXT DEFAULT 'WhatsApp User',
      channel TEXT DEFAULT 'whatsapp',
      preview TEXT DEFAULT 'New conversation',
      status TEXT DEFAULT 'bot',
      unread INTEGER DEFAULT 0,
      lead_intent TEXT,
      lead_stage TEXT,
      lead_confidence INTEGER DEFAULT 70,
      assigned_agent TEXT,
      stats_resolution TEXT DEFAULT 'In progress',
      stats_messages INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(tenant_id, phone)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      text TEXT,
      extra TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT NOT NULL,
      name TEXT,
      phone TEXT,
      email TEXT DEFAULT '',
      prop TEXT DEFAULT '—',
      budget TEXT DEFAULT '—',
      budget_num REAL DEFAULT 0,
      stage TEXT DEFAULT 'new',
      score INTEGER DEFAULT 70,
      score_breakdown TEXT DEFAULT '{}',
      interest TEXT DEFAULT '—',
      source TEXT DEFAULT 'WhatsApp',
      followup TEXT DEFAULT 'Tomorrow',
      followup_date TEXT,
      last_contacted TEXT DEFAULT 'Just now',
      days_in_stage INTEGER DEFAULT 0,
      assigned_agent TEXT,
      note TEXT DEFAULT '',
      notes TEXT DEFAULT '[]',
      documents TEXT DEFAULT '[]',
      ai_next_action TEXT,
      stage_entered_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS catalog_items (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      price TEXT,
      price_num REAL DEFAULT 0,
      meta TEXT,
      image_url TEXT,
      category TEXT,
      bhk TEXT,
      location TEXT,
      sqft TEXT,
      status TEXT DEFAULT 'Available',
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS broadcasts (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      sent_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      lead_id INTEGER,
      message TEXT,
      remind_at TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      key_prefix TEXT NOT NULL,
      key_hash TEXT NOT NULL,
      label TEXT DEFAULT 'Default',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      user_id TEXT,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'agent',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_conv_tenant ON conversations(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_msg_conv ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_leads_tenant ON leads(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_catalog_tenant ON catalog_items(tenant_id);

    CREATE TABLE IF NOT EXISTS onboarding_intake (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL UNIQUE,
      status TEXT DEFAULT 'draft',
      step INTEGER DEFAULT 0,
      answers TEXT DEFAULT '{}',
      admin_notes TEXT,
      submitted_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    );

    CREATE TABLE IF NOT EXISTS site_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL DEFAULT 'pageview',
      path TEXT NOT NULL,
      referrer TEXT DEFAULT '',
      user_agent TEXT DEFAULT '',
      meta TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS platform_notifications (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT DEFAULT '',
      sent_email INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_site_events_created ON site_events(created_at);
    CREATE INDEX IF NOT EXISTS idx_site_events_path ON site_events(path);

    CREATE TABLE IF NOT EXISTS site_leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      source TEXT DEFAULT 'homepage',
      path TEXT DEFAULT '/',
      meta TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_site_leads_created ON site_leads(created_at);

    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      phone_digits TEXT NOT NULL,
      email TEXT DEFAULT '',
      age INTEGER,
      gender TEXT DEFAULT '',
      chief_complaint TEXT DEFAULT '',
      is_returning INTEGER DEFAULT 0,
      tags TEXT DEFAULT '[]',
      notes TEXT DEFAULT '[]',
      last_visit TEXT,
      source TEXT DEFAULT 'WhatsApp',
      conversation_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(tenant_id, phone_digits),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      patient_id TEXT NOT NULL,
      service TEXT DEFAULT '',
      service_id TEXT,
      scheduled_at TEXT NOT NULL,
      duration_min INTEGER DEFAULT 30,
      status TEXT DEFAULT 'requested',
      assigned_doctor TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      source TEXT DEFAULT 'WhatsApp',
      reminder_sent INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id),
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    CREATE INDEX IF NOT EXISTS idx_patients_tenant ON patients(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_tenant ON appointments(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(tenant_id, scheduled_at);
    CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
  `);

  migrateSiteLeadsColumns();
  migrateClinicExtensions();
  syncDentaCareDemo();
  seedDefaults();
  migrateCatalogs();
  return db;
}

function migrateClinicExtensions() {
  const reminderCols = db.prepare('PRAGMA table_info(reminders)').all().map((c) => c.name);
  if (!reminderCols.includes('appointment_id')) {
    db.exec(`ALTER TABLE reminders ADD COLUMN appointment_id TEXT`);
  }
  if (!reminderCols.includes('reminder_type')) {
    db.exec(`ALTER TABLE reminders ADD COLUMN reminder_type TEXT DEFAULT 'followup'`);
  }
  if (!reminderCols.includes('patient_id')) {
    db.exec(`ALTER TABLE reminders ADD COLUMN patient_id TEXT`);
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS patient_payments (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      patient_id TEXT NOT NULL,
      appointment_id TEXT,
      amount REAL NOT NULL DEFAULT 0,
      method TEXT DEFAULT 'cash',
      reference TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      status TEXT DEFAULT 'paid',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id),
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      user_id TEXT,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      detail TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_payments_tenant ON patient_payments(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_log(tenant_id);
  `);
}

function migrateSiteLeadsColumns() {
  const cols = db.prepare('PRAGMA table_info(site_leads)').all().map((c) => c.name);
  if (!cols.includes('status')) {
    db.exec(`ALTER TABLE site_leads ADD COLUMN status TEXT DEFAULT 'new'`);
  }
  if (!cols.includes('admin_notes')) {
    db.exec(`ALTER TABLE site_leads ADD COLUMN admin_notes TEXT DEFAULT ''`);
  }
  if (!cols.includes('contacted_at')) {
    db.exec(`ALTER TABLE site_leads ADD COLUMN contacted_at TEXT`);
  }
}

function migrateCatalogs() {
  const tenants = db.prepare('SELECT id, industry FROM tenants').all();
  for (const t of tenants) {
    seedCatalogForTenant(t.id, t.industry || 'other');
  }
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'business';
}

function syncDentaCareDemo() {
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

  const existing = db.prepare('SELECT id FROM tenants WHERE id = ?').get(tenantId);
  if (!existing) {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);
    db.prepare(`
      INSERT INTO tenants (id, slug, name, industry, plan, status, trial_ends_at, settings, whatsapp_phone_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      tenantId,
      'denta-care',
      'Denta Care Dental Clinic',
      'clinic',
      'growth',
      'active',
      trialEnd.toISOString(),
      JSON.stringify(settings),
      process.env.WHATSAPP_PHONE_NUMBER_ID || null,
    );
    seedCatalogForTenant(tenantId, 'clinic');
  } else {
    db.prepare('UPDATE tenants SET name = ?, settings = ? WHERE id = ?').run(
      'Denta Care Dental Clinic',
      JSON.stringify(settings),
      tenantId,
    );
  }

  const demoAccounts = [
    { id: 'user-denta-care', email: 'demo@dentacare.in', name: 'Dr. D. Ajit' },
    { id: 'user-denta-care-alt', email: 'clinic@demo.kaana.in', name: 'Dr. D. Ajit' },
  ];
  const hash = bcrypt.hashSync('demo1234', 10);
  for (const acct of demoAccounts) {
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(acct.email);
    if (!user) {
      db.prepare(`
        INSERT INTO users (id, tenant_id, email, password_hash, name, role, is_platform_admin)
        VALUES (?, ?, ?, ?, ?, 'owner', 0)
      `).run(acct.id, tenantId, acct.email, hash, acct.name);
    } else {
      db.prepare('UPDATE users SET tenant_id = ?, name = ?, password_hash = ? WHERE email = ?').run(
        tenantId, acct.name, hash, acct.email,
      );
    }
  }

  seedDentaCareSampleData(tenantId);
}

function seedDentaCareSampleData(tenantId) {
  const today = new Date().toISOString().slice(0, 10);
  const existing = db.prepare(`
    SELECT COUNT(*) AS c FROM appointments WHERE tenant_id = ? AND date(scheduled_at) = date(?)
  `).get(tenantId, today)?.c ?? 0;
  if (existing >= 2) return;

  const samples = [
    { id: 'pat-demo-1', name: 'Lakshmi Reddy', phone: '9876543210', complaint: 'Tooth pain', service: 'Conservative Dentistry', hour: 10, min: 30, status: 'requested', source: 'WhatsApp' },
    { id: 'pat-demo-2', name: 'Rajesh Kumar', phone: '9876543211', complaint: 'Denture consult', service: 'Complete/Partial Dentures', hour: 11, min: 0, status: 'confirmed', source: 'Walk-in' },
    { id: 'pat-demo-3', name: 'Priya Sharma', phone: '9876543212', complaint: 'Smile makeover', service: 'Cosmetic Dentistry', hour: 17, min: 30, status: 'confirmed', source: 'WhatsApp' },
  ];

  for (const s of samples) {
    const pat = db.prepare('SELECT id FROM patients WHERE id = ?').get(s.id);
    if (!pat) {
      db.prepare(`
        INSERT INTO patients (id, tenant_id, name, phone, phone_digits, chief_complaint, source)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        s.id, tenantId, s.name,
        `+91 ${s.phone.slice(0, 5)} ${s.phone.slice(5)}`,
        s.phone, s.complaint, s.source,
      );
    }
    const apptExists = db.prepare('SELECT id FROM appointments WHERE patient_id = ? AND date(scheduled_at) = date(?)').get(s.id, today);
    if (!apptExists) {
      const scheduledAt = `${today}T${String(s.hour).padStart(2, '0')}:${String(s.min).padStart(2, '0')}:00`;
      db.prepare(`
        INSERT INTO appointments (id, tenant_id, patient_id, service, scheduled_at, status, source)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(`appt-${s.id}`, tenantId, s.id, s.service, scheduledAt, s.status, s.source);
    }
  }
}

function seedDefaults() {
  const existing = db.prepare('SELECT id FROM tenants WHERE id = ?').get('prestige-properties');
  if (!existing) {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);
    db.prepare(`
      INSERT INTO tenants (id, slug, name, industry, plan, status, trial_ends_at, settings, whatsapp_phone_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
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
    );
    seedCatalogForTenant('prestige-properties', 'real-estate');
  }

  const adminEmail = (process.env.PLATFORM_ADMIN_EMAIL || 'admin@kaana.ai').toLowerCase();
  const adminPassword = process.env.PLATFORM_ADMIN_PASSWORD || 'kaanaadmin';
  const hash = bcrypt.hashSync(adminPassword, 10);
  const adminUser = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (!adminUser) {
    db.prepare(`
      INSERT INTO users (id, tenant_id, email, password_hash, name, role, is_platform_admin)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run('user-admin', null, adminEmail, hash, 'Platform Admin', 'platform_admin');
  } else {
    db.prepare('UPDATE users SET password_hash = ?, is_platform_admin = 1 WHERE email = ?').run(hash, adminEmail);
  }
}

export function getDb() {
  return db;
}

export { slugify };

export function parseSettings(raw) {
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw ?? {};
  } catch {
    return {};
  }
}

export function tenantToClient(row) {
  const s = parseSettings(row.settings);
  const intake = getDb().prepare('SELECT status, submitted_at FROM onboarding_intake WHERE tenant_id = ?').get(row.id);
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
  };
}

export function seedCatalogForTenant(tenantId, industry) {
  const existing = db.prepare('SELECT id FROM catalog_items WHERE tenant_id = ? LIMIT 1').get(tenantId);
  if (existing) return;
  const items = getCatalogTemplate(industry);
  const insert = db.prepare(`
    INSERT INTO catalog_items (id, tenant_id, title, subtitle, price, price_num, meta, image_url, category, bhk, location, status, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Available', ?)
  `);
  items.forEach((item, i) => {
    insert.run(
      nanoid(10), tenantId, item.title, item.subtitle, item.price, item.priceNum ?? 0,
      item.meta, item.image, item.category, item.bhk || null, item.location || null, i,
    );
  });
}

export function getCatalogItems(tenantId, filters = {}) {
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
  return db.prepare(sql).all(...params);
}
