import { nanoid } from 'nanoid';
import { getDb } from './db/index.js';
import { getRequestTenantId, getClient } from './tenantContext.js';

function formatPhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  return `+${digits}`;
}

function relativeTime(iso) {
  const date = iso ? new Date(iso) : new Date();
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}hr`;
  return 'Yesterday';
}

function nowTime() {
  return new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function convId(tenantId, phone) {
  return `wa-${String(phone).replace(/\D/g, '')}`;
}

function rowToLead(row) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    phone: row.phone,
    email: row.email || '',
    prop: row.prop,
    budget: row.budget,
    budgetNum: row.budget_num,
    stage: row.stage,
    score: row.score,
    scoreBreakdown: JSON.parse(row.score_breakdown || '{}'),
    interest: row.interest,
    source: row.source,
    followup: row.followup,
    followupDate: row.followup_date,
    lastContacted: row.last_contacted,
    daysInStage: row.days_in_stage,
    assignedAgent: row.assigned_agent,
    note: row.note,
    notes: JSON.parse(row.notes || '[]'),
    documents: JSON.parse(row.documents || '[]'),
    aiNextAction: row.ai_next_action,
    stageEnteredAt: row.stage_entered_at,
  };
}

function loadMessages(conversationId) {
  return getDb().prepare(`
    SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC
  `).all(conversationId).map((m) => ({
    id: m.id,
    role: m.role,
    text: m.text,
    timestamp: new Date(m.created_at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }),
    ...JSON.parse(m.extra || '{}'),
  }));
}

function rowToConversation(row) {
  const messages = loadMessages(row.id);
  return {
    id: row.id,
    tenantId: row.tenant_id,
    phone: formatPhone(row.phone),
    name: row.name,
    channel: row.channel,
    preview: row.preview,
    time: relativeTime(row.updated_at),
    status: row.status,
    unread: row.unread,
    messages,
    lead: {
      intent: row.lead_intent || '—',
      stage: row.lead_stage || 'New enquiry',
      confidence: row.lead_confidence ?? 70,
    },
    stats: {
      messages: row.stats_messages,
      resolution: row.stats_resolution || 'In progress',
      timeToBook: '—',
    },
    updatedAt: new Date(row.updated_at),
    assignedAgent: row.assigned_agent,
  };
}

export function getOrCreateConversation(phone, tenantId = getRequestTenantId()) {
  const db = getDb();
  const digits = String(phone).replace(/\D/g, '');
  const id = convId(tenantId, digits);
  let row = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id);
  if (!row) {
    db.prepare(`
      INSERT INTO conversations (id, tenant_id, phone, name, preview, status, unread, stats_messages)
      VALUES (?, ?, ?, 'WhatsApp User', 'New conversation', 'bot', 0, 0)
    `).run(id, tenantId, digits);
    row = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id);
  }
  return rowToConversation(row);
}

export function addMessage(phone, role, text, extra = {}, tenantId = getRequestTenantId()) {
  const db = getDb();
  const conv = getOrCreateConversation(phone, tenantId);
  const msgId = `m-${Date.now()}-${nanoid(4)}`;
  db.prepare(`
    INSERT INTO messages (id, conversation_id, role, text, extra) VALUES (?, ?, ?, ?, ?)
  `).run(msgId, conv.id, role, text, JSON.stringify(extra));

  const unreadDelta = role === 'user' ? 1 : 0;
  db.prepare(`
    UPDATE conversations SET
      preview = ?, updated_at = datetime('now'), stats_messages = stats_messages + 1,
      unread = unread + ?
    WHERE id = ?
  `).run(text?.slice(0, 60) ?? conv.preview, unreadDelta, conv.id);

  return {
    id: msgId,
    role,
    text,
    timestamp: nowTime(),
    ...extra,
  };
}

export function updateConversation(phone, patch, tenantId = getRequestTenantId()) {
  const db = getDb();
  const digits = String(phone).replace(/\D/g, '');
  const id = convId(tenantId, digits);
  const fields = [];
  const values = [];

  if (patch.name != null) { fields.push('name = ?'); values.push(patch.name); }
  if (patch.preview != null) { fields.push('preview = ?'); values.push(patch.preview); }
  if (patch.status != null) { fields.push('status = ?'); values.push(patch.status); }
  if (patch.unread != null) { fields.push('unread = ?'); values.push(patch.unread); }
  if (patch.assignedAgent != null) { fields.push('assigned_agent = ?'); values.push(patch.assignedAgent); }
  if (patch.lead) {
    if (patch.lead.intent != null) { fields.push('lead_intent = ?'); values.push(patch.lead.intent); }
    if (patch.lead.stage != null) { fields.push('lead_stage = ?'); values.push(patch.lead.stage); }
    if (patch.lead.confidence != null) { fields.push('lead_confidence = ?'); values.push(patch.lead.confidence); }
  }
  if (patch.stats?.resolution != null) { fields.push('stats_resolution = ?'); values.push(patch.stats.resolution); }

  if (fields.length) {
    fields.push("updated_at = datetime('now')");
    values.push(id);
    db.prepare(`UPDATE conversations SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }
}

export function setConversationName(phone, name, tenantId = getRequestTenantId()) {
  updateConversation(phone, { name }, tenantId);
}

export function createLead({ phone, name, property, budget, bhk, stage = 'new', note, tenantId = getRequestTenantId() }) {
  const client = getClient();
  const crmStage = stage === 'site' ? 'site' : stage === 'agent' ? 'contacted' : 'new';
  const score = stage === 'site' ? 88 : stage === 'agent' ? 75 : 72;

  const result = getDb().prepare(`
    INSERT INTO leads (
      tenant_id, name, phone, prop, budget, budget_num, stage, score, score_breakdown,
      interest, source, followup, followup_date, last_contacted, assigned_agent, note, notes,
      ai_next_action, stage_entered_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Just now', ?, ?, '[]', ?, datetime('now'))
  `).run(
    tenantId,
    name || 'WhatsApp Lead',
    formatPhone(phone),
    property?.title ?? property ?? '—',
    budget ?? '—',
    property?.priceNum ?? property?.price_num ?? 0,
    crmStage,
    score,
    JSON.stringify({ engagement: 80, budgetFit: 75, timeline: stage === 'site' ? 90 : 60 }),
    bhk ?? '—',
    `WhatsApp / ${client.botName}`,
    stage === 'site' ? 'Today' : 'Tomorrow',
    new Date().toISOString().slice(0, 10),
    client.agentName,
    note ?? '',
    stage === 'site' ? 'Confirm appointment 1 day before' : 'Qualify and follow up',
  );

  const lead = getDb().prepare('SELECT * FROM leads WHERE id = ?').get(result.lastInsertRowid);

  updateConversation(phone, {
    lead: {
      intent: `${bhk ?? '—'} · ${budget ?? '—'}`,
      stage: stage === 'site' ? 'Booking confirmed' : stage === 'agent' ? 'Needs agent' : 'Qualifying',
      confidence: stage === 'site' ? 94 : 72,
    },
  }, tenantId);

  return rowToLead(lead);
}

export function getConversations(tenantId) {
  const rows = getDb().prepare(`
    SELECT * FROM conversations WHERE tenant_id = ? ORDER BY updated_at DESC
  `).all(tenantId);
  return rows.map(rowToConversation);
}

export function getLeads(tenantId) {
  const rows = getDb().prepare(`
    SELECT * FROM leads WHERE tenant_id = ? ORDER BY created_at DESC
  `).all(tenantId);
  return rows.map(rowToLead);
}

export function getLeadById(id, tenantId) {
  const row = getDb().prepare('SELECT * FROM leads WHERE id = ? AND tenant_id = ?').get(id, tenantId);
  return row ? rowToLead(row) : null;
}

export function updateLead(id, tenantId, patch) {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM leads WHERE id = ? AND tenant_id = ?').get(id, tenantId);
  if (!existing) return null;

  const fields = [];
  const values = [];
  const map = {
    name: 'name', phone: 'phone', email: 'email', prop: 'prop', budget: 'budget',
    budgetNum: 'budget_num', stage: 'stage', score: 'score', interest: 'interest',
    followup: 'followup', followupDate: 'followup_date', lastContacted: 'last_contacted',
    assignedAgent: 'assigned_agent', note: 'note', aiNextAction: 'ai_next_action',
  };
  for (const [key, col] of Object.entries(map)) {
    if (patch[key] != null) { fields.push(`${col} = ?`); values.push(patch[key]); }
  }
  if (patch.notes != null) { fields.push('notes = ?'); values.push(JSON.stringify(patch.notes)); }
  if (patch.scoreBreakdown != null) { fields.push('score_breakdown = ?'); values.push(JSON.stringify(patch.scoreBreakdown)); }

  if (fields.length) {
    fields.push("updated_at = datetime('now')");
    if (patch.stage && patch.stage !== existing.stage) {
      fields.push("stage_entered_at = datetime('now')");
    }
    values.push(id, tenantId);
    db.prepare(`UPDATE leads SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`).run(...values);
  }
  return getLeadById(id, tenantId);
}

export function getConversationByPhone(phone, tenantId) {
  const id = convId(tenantId, phone);
  const row = getDb().prepare('SELECT * FROM conversations WHERE id = ?').get(id);
  return row ? rowToConversation(row) : null;
}

export function summarizeConversation(conversationId, tenantId) {
  const row = getDb().prepare('SELECT * FROM conversations WHERE id = ? AND tenant_id = ?').get(conversationId, tenantId);
  if (!row) return null;
  const messages = loadMessages(conversationId).slice(-12);
  const userMsgs = messages.filter((m) => m.role === 'user').map((m) => m.text);
  const botMsgs = messages.filter((m) => m.role === 'bot' || m.role === 'agent').map((m) => m.text);
  const summary = userMsgs.length
    ? `Customer asked about: ${userMsgs.slice(-3).join('; ')}. Bot/agent responded with booking and qualification steps.`
    : 'New conversation — no customer messages yet.';
  const suggestions = [
    row.lead_stage?.includes('agent') ? 'Call the customer within 10 minutes' : 'Send a follow-up with catalog link',
    row.lead_intent && row.lead_intent !== '—' ? `Reference their interest: ${row.lead_intent}` : 'Ask about budget and timeline',
    'Share mini-site link if not sent yet',
  ];
  return { summary, suggestions, messageCount: messages.length, status: row.status };
}

export function getAnalytics(tenantId) {
  const db = getDb();
  const month = new Date().toISOString().slice(0, 7);
  const usage = db.prepare('SELECT * FROM usage WHERE tenant_id = ? AND month = ?').get(tenantId, month);
  const leadCount = db.prepare('SELECT COUNT(*) as c FROM leads WHERE tenant_id = ?').get(tenantId).c;
  const convCount = db.prepare('SELECT COUNT(*) as c FROM conversations WHERE tenant_id = ?').get(tenantId).c;
  const siteLeads = db.prepare("SELECT COUNT(*) as c FROM leads WHERE tenant_id = ? AND stage = 'site'").get(tenantId).c;
  const avgReply = usage?.bot_replies && convCount ? Math.max(3, Math.round(480 / Math.max(usage.bot_replies, 1))) : 8;

  return {
    month,
    leadsTotal: leadCount,
    conversationsTotal: convCount,
    siteVisitsBooked: siteLeads,
    botReplies: usage?.bot_replies ?? 0,
    messagesSent: usage?.messages_sent ?? 0,
    avgReplySeconds: avgReply,
    conversionRate: convCount ? Math.round((leadCount / convCount) * 100) : 0,
  };
}

export function assignConversation(conversationId, tenantId, agentName) {
  getDb().prepare(`
    UPDATE conversations SET assigned_agent = ?, status = 'agent', updated_at = datetime('now') WHERE id = ? AND tenant_id = ?
  `).run(agentName, conversationId, tenantId);
}

export function createBroadcast(tenantId, message) {
  const id = nanoid();
  getDb().prepare('INSERT INTO broadcasts (id, tenant_id, message, status) VALUES (?, ?, ?, ?)').run(id, tenantId, message, 'sent');
  const leads = getLeads(tenantId);
  getDb().prepare('UPDATE broadcasts SET sent_count = ?, status = ? WHERE id = ?').run(leads.length, 'sent', id);
  return { id, sentCount: leads.length, status: 'sent' };
}

export function createReminder(tenantId, { leadId, message, remindAt }) {
  const id = nanoid();
  getDb().prepare(`
    INSERT INTO reminders (id, tenant_id, lead_id, message, remind_at, status) VALUES (?, ?, ?, ?, ?, 'pending')
  `).run(id, tenantId, leadId ?? null, message, remindAt);
  return { id, status: 'pending' };
}

export function getReminders(tenantId) {
  return getDb().prepare('SELECT * FROM reminders WHERE tenant_id = ? ORDER BY remind_at ASC').all(tenantId);
}
