import { getDb, tenantToClient, parseSettings } from '../db/index.js';
import { getIntakeForTenant } from '../services/onboarding.js';
import { getAnalytics } from '../store.js';
import { getPlatformConfig } from '../platformConfig.js';

const STAGES = ['signed_up', 'intake_pending', 'ready_to_activate', 'live', 'whatsapp_pending', 'paying'];

export function deriveTenantStage(row, intake, subscription) {
  if (subscription?.status === 'active') return 'paying';
  if (row.status === 'pending_onboarding') {
    if (intake?.status === 'submitted' || intake?.status === 'reviewed') return 'ready_to_activate';
    if (intake?.status === 'draft' && intake?.step > 0) return 'intake_pending';
    return 'signed_up';
  }
  if (row.status === 'active') {
    const connected = !!(row.whatsapp_phone_id && row.whatsapp_token);
    if (!connected) return 'whatsapp_pending';
    return 'live';
  }
  return row.status;
}

function stageLabel(stage) {
  const labels = {
    signed_up: 'Signed up',
    intake_pending: 'Questionnaire in progress',
    ready_to_activate: 'Ready to activate',
    live: 'Live',
    whatsapp_pending: 'WhatsApp not connected',
    paying: 'Paying',
  };
  return labels[stage] || stage;
}

function daysUntil(iso) {
  if (!iso) return null;
  const end = new Date(iso);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function daysSince(iso) {
  if (!iso) return 0;
  const start = new Date(iso);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function getTenantUsage7d(tenantId) {
  const db = getDb();
  const conv = db.prepare(`
    SELECT COUNT(*) as c FROM conversations
    WHERE tenant_id = ? AND updated_at >= datetime('now', '-7 days')
  `).get(tenantId).c;
  const msgs = db.prepare(`
    SELECT COUNT(*) as c FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE c.tenant_id = ? AND m.created_at >= datetime('now', '-7 days')
  `).get(tenantId).c;
  return { conversations7d: conv, messages7d: msgs };
}

function enrichTenant(row) {
  const db = getDb();
  const owner = db.prepare(`SELECT email, name FROM users WHERE tenant_id = ? AND role = 'owner' LIMIT 1`).get(row.id);
  const intake = getIntakeForTenant(row.id);
  const subscription = db.prepare(`
    SELECT plan, status, amount, current_period_end, created_at
    FROM subscriptions WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 1
  `).get(row.id);
  const client = tenantToClient(row);
  const stage = deriveTenantStage(row, intake, subscription);
  const trialDaysLeft = daysUntil(row.trial_ends_at);

  return {
    ...client,
    ownerEmail: owner?.email ?? '',
    ownerName: owner?.name ?? '',
    createdAt: row.created_at,
    trialEndsAt: row.trial_ends_at,
    trialDaysLeft,
    stage,
    stageLabel: stageLabel(stage),
    intake,
    subscription: subscription ? {
      plan: subscription.plan,
      status: subscription.status,
      amountInr: Math.round((subscription.amount || 0) / 100),
      periodEnd: subscription.current_period_end,
    } : null,
  };
}

export function getSetupQueue() {
  const db = getDb();
  const actions = [];
  const pipeline = { signed_up: 0, intake_pending: 0, ready_to_activate: 0, live: 0, whatsapp_pending: 0, paying: 0 };

  const tenants = db.prepare('SELECT * FROM tenants ORDER BY created_at DESC').all();
  for (const row of tenants) {
    const t = enrichTenant(row);
    if (pipeline[t.stage] !== undefined) pipeline[t.stage] += 1;

    if (t.stage === 'ready_to_activate') {
      actions.push({
        kind: 'activate',
        priority: 1,
        tenantId: t.id,
        title: `${t.name} — questionnaire done`,
        detail: 'Activate and seed catalog',
        href: `/admin/tenants/${t.id}`,
      });
    }

    if (t.stage === 'signed_up' || t.stage === 'intake_pending') {
      const since = daysSince(t.createdAt);
      if (since >= 3) {
        actions.push({
          kind: 'followup_signup',
          priority: 2,
          tenantId: t.id,
          title: `${t.name} — no questionnaire yet`,
          detail: `Signed up ${since} days ago`,
          href: `/admin/tenants/${t.id}`,
        });
      }
    }

    if (t.stage === 'whatsapp_pending') {
      actions.push({
        kind: 'whatsapp',
        priority: 2,
        tenantId: t.id,
        title: `${t.name} — WhatsApp not connected`,
        detail: 'Help them connect their number',
        href: `/admin/tenants/${t.id}`,
      });
    }

    if (t.trialDaysLeft !== null && t.trialDaysLeft <= 7 && t.trialDaysLeft >= 0 && t.stage !== 'paying') {
      actions.push({
        kind: 'trial_expiring',
        priority: 3,
        tenantId: t.id,
        title: `${t.name} — trial ends in ${t.trialDaysLeft} days`,
        detail: t.ownerEmail || t.agentPhone || '',
        href: `/admin/tenants/${t.id}`,
      });
    }
  }

  const newLeads = db.prepare(`
    SELECT id, name, phone, source, created_at FROM site_leads
    WHERE status = 'new' OR status IS NULL
    ORDER BY created_at DESC LIMIT 20
  `).all();

  for (const lead of newLeads) {
    actions.push({
      kind: 'new_lead',
      priority: 1,
      leadId: lead.id,
      title: `${lead.name} — new homepage lead`,
      detail: lead.phone,
      href: '/admin?tab=leads',
    });
  }

  actions.sort((a, b) => a.priority - b.priority);

  return {
    pipeline,
    stages: STAGES.map((id) => ({ id, label: stageLabel(id), count: pipeline[id] || 0 })),
    actions,
    platform: getPlatformConfig(),
  };
}

export function getTenantAdminDetail(tenantId) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantId);
  if (!row) return null;

  const tenant = enrichTenant(row);
  const usage = getAnalytics(tenantId);
  const activity = getTenantUsage7d(tenantId);
  const settings = parseSettings(row.settings);

  return {
    tenant,
    usage,
    activity,
    links: {
      botiq: `${process.env.BOTIQ_URL || 'http://localhost:5174'}`,
      crm: `${process.env.CRM_URL || 'http://localhost:5175'}`,
      listings: `${process.env.LISTINGS_BASE_URL || process.env.PUBLIC_URL || 'http://localhost:3002/listings'}?tenant=${row.slug}`,
    },
    settings,
  };
}

export function listTenantsWithStage() {
  const db = getDb();
  return db.prepare('SELECT * FROM tenants ORDER BY created_at DESC').all().map(enrichTenant);
}
