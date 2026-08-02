-- BotIQ initial schema (Postgres)

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  industry TEXT DEFAULT 'real-estate',
  plan TEXT DEFAULT 'trial',
  status TEXT DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}'::jsonb,
  products JSONB DEFAULT '["platform","inbox","crm","clinic"]'::jsonb,
  whatsapp_phone_id TEXT,
  whatsapp_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES tenants(id),
  username TEXT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'owner',
  is_platform_admin BOOLEAN DEFAULT FALSE,
  must_change_password BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_tenant_username ON users(tenant_id, username);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_sub_id TEXT,
  amount INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage (
  tenant_id TEXT NOT NULL,
  month TEXT NOT NULL,
  messages_sent INTEGER DEFAULT 0,
  bot_replies INTEGER DEFAULT 0,
  ai_tokens INTEGER DEFAULT 0,
  PRIMARY KEY (tenant_id, month)
);

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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, phone)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id),
  role TEXT NOT NULL,
  text TEXT,
  extra JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  email TEXT DEFAULT '',
  prop TEXT DEFAULT '—',
  budget TEXT DEFAULT '—',
  budget_num DOUBLE PRECISION DEFAULT 0,
  stage TEXT DEFAULT 'new',
  score INTEGER DEFAULT 70,
  score_breakdown JSONB DEFAULT '{}'::jsonb,
  interest TEXT DEFAULT '—',
  source TEXT DEFAULT 'WhatsApp',
  followup TEXT DEFAULT 'Tomorrow',
  followup_date TEXT,
  last_contacted TEXT DEFAULT 'Just now',
  days_in_stage INTEGER DEFAULT 0,
  assigned_agent TEXT,
  note TEXT DEFAULT '',
  notes JSONB DEFAULT '[]'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  ai_next_action TEXT,
  stage_entered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS catalog_items (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  price TEXT,
  price_num DOUBLE PRECISION DEFAULT 0,
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  lead_id INTEGER,
  message TEXT,
  remind_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  appointment_id TEXT,
  reminder_type TEXT DEFAULT 'followup',
  patient_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  label TEXT DEFAULT 'Default',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'agent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS onboarding_intake (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL UNIQUE REFERENCES tenants(id),
  status TEXT DEFAULT 'draft',
  step INTEGER DEFAULT 0,
  answers JSONB DEFAULT '{}'::jsonb,
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL DEFAULT 'pageview',
  path TEXT NOT NULL,
  referrer TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS platform_notifications (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT DEFAULT '',
  sent_email BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  source TEXT DEFAULT 'homepage',
  path TEXT DEFAULT '/',
  meta JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'new',
  admin_notes TEXT DEFAULT '',
  contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_digits TEXT NOT NULL,
  email TEXT DEFAULT '',
  age INTEGER,
  gender TEXT DEFAULT '',
  chief_complaint TEXT DEFAULT '',
  is_returning BOOLEAN DEFAULT FALSE,
  tags JSONB DEFAULT '[]'::jsonb,
  notes JSONB DEFAULT '[]'::jsonb,
  last_visit TIMESTAMPTZ,
  source TEXT DEFAULT 'WhatsApp',
  conversation_id TEXT,
  photo_url TEXT DEFAULT '',
  prescription_url TEXT DEFAULT '',
  record_urls JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, phone_digits)
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  patient_id TEXT NOT NULL REFERENCES patients(id),
  service TEXT DEFAULT '',
  service_id TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_min INTEGER DEFAULT 30,
  status TEXT DEFAULT 'requested',
  assigned_doctor TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  source TEXT DEFAULT 'WhatsApp',
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_payments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  patient_id TEXT NOT NULL REFERENCES patients(id),
  appointment_id TEXT,
  amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  method TEXT DEFAULT 'cash',
  reference TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'paid',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  detail JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subs_tenant ON subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conv_tenant ON conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_msg_conv ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_leads_tenant ON leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_catalog_tenant ON catalog_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_site_events_created ON site_events(created_at);
CREATE INDEX IF NOT EXISTS idx_site_events_path ON site_events(path);
CREATE INDEX IF NOT EXISTS idx_site_leads_created ON site_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_patients_tenant ON patients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_tenant ON appointments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(tenant_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON patient_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_log(tenant_id);
