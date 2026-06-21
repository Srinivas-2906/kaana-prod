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
  `);

  migrateSiteLeadsColumns();
  seedDefaults();
  migrateCatalogs();
  return db;
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
