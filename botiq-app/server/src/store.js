import { nanoid } from 'nanoid';
import { getOne, getAll, run } from './db/query.js';
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

function parseJson(raw, fallback) {
  if (raw == null) return fallback;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
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
    scoreBreakdown: parseJson(row.score_breakdown, {}),
    interest: row.interest,
    source: row.source,
    followup: row.followup,
    followupDate: row.followup_date,
    lastContacted: row.last_contacted,
    daysInStage: row.days_in_stage,
    assignedAgent: row.assigned_agent,
    note: row.note,
    notes: parseJson(row.notes, []),
    documents: parseJson(row.documents, []),
    aiNextAction: row.ai_next_action,
    stageEnteredAt: row.stage_entered_at,
  };
}

async function loadMessages(conversationId) {
  const rows = await getAll(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
    [conversationId],
  );
  return rows.map((m) => ({
    id: m.id,
    role: m.role,
    text: m.text,
    timestamp: new Date(m.created_at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }),
    ...parseJson(m.extra, {}),
  }));
}

async function rowToConversation(row) {
  const messages = await loadMessages(row.id);
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

export async function getOrCreateConversation(phone, tenantId = getRequestTenantId()) {
  const digits = String(phone).replace(/\D/g, '');
  const id = convId(tenantId, digits);
  let row = await getOne('SELECT * FROM conversations WHERE id = ?', [id]);
  if (!row) {
    await run(
      `INSERT INTO conversations (id, tenant_id, phone, name, preview, status, unread, stats_messages)
       VALUES (?, ?, ?, 'WhatsApp User', 'New conversation', 'bot', 0, 0)`,
      [id, tenantId, digits],
    );
    row = await getOne('SELECT * FROM conversations WHERE id = ?', [id]);
  }
  return rowToConversation(row);
}

export async function addMessage(phone, role, text, extra = {}, tenantId = getRequestTenantId()) {
  const conv = await getOrCreateConversation(phone, tenantId);
  const msgId = `m-${Date.now()}-${nanoid(4)}`;
  await run(
    'INSERT INTO messages (id, conversation_id, role, text, extra) VALUES (?, ?, ?, ?, ?)',
    [msgId, conv.id, role, text, JSON.stringify(extra)],
  );

  const unreadDelta = role === 'user' ? 1 : 0;
  await run(
    `UPDATE conversations SET
      preview = ?, updated_at = NOW(), stats_messages = stats_messages + 1,
      unread = unread + ?
     WHERE id = ?`,
    [text?.slice(0, 60) ?? conv.preview, unreadDelta, conv.id],
  );

  return {
    id: msgId,
    role,
    text,
    timestamp: nowTime(),
    ...extra,
  };
}

export async function updateConversation(phone, patch, tenantId = getRequestTenantId()) {
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
    fields.push('updated_at = NOW()');
    values.push(id);
    await run(`UPDATE conversations SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export async function setConversationName(phone, name, tenantId = getRequestTenantId()) {
  await updateConversation(phone, { name }, tenantId);
}

export async function createLead({ phone, name, property, budget, bhk, stage = 'new', note, tenantId = getRequestTenantId() }) {
  const client = getClient();
  const crmStage = stage === 'site' ? 'site' : stage === 'agent' ? 'contacted' : 'new';
  const score = stage === 'site' ? 88 : stage === 'agent' ? 75 : 72;

  const result = await run(
    `INSERT INTO leads (
      tenant_id, name, phone, prop, budget, budget_num, stage, score, score_breakdown,
      interest, source, followup, followup_date, last_contacted, assigned_agent, note, notes,
      ai_next_action, stage_entered_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Just now', ?, ?, '[]', ?, NOW())
    RETURNING id`,
    [
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
    ],
  );

  const lead = await getOne('SELECT * FROM leads WHERE id = ?', [result.lastInsertRowid]);

  await updateConversation(phone, {
    lead: {
      intent: `${bhk ?? '—'} · ${budget ?? '—'}`,
      stage: stage === 'site' ? 'Booking confirmed' : stage === 'agent' ? 'Needs agent' : 'Qualifying',
      confidence: stage === 'site' ? 94 : 72,
    },
  }, tenantId);

  return rowToLead(lead);
}

export async function getConversations(tenantId) {
  const rows = await getAll(
    'SELECT * FROM conversations WHERE tenant_id = ? ORDER BY updated_at DESC',
    [tenantId],
  );
  return Promise.all(rows.map(rowToConversation));
}

export async function getLeads(tenantId) {
  const rows = await getAll(
    'SELECT * FROM leads WHERE tenant_id = ? ORDER BY created_at DESC',
    [tenantId],
  );
  return rows.map(rowToLead);
}

export async function getLeadById(id, tenantId) {
  const row = await getOne('SELECT * FROM leads WHERE id = ? AND tenant_id = ?', [id, tenantId]);
  return row ? rowToLead(row) : null;
}

export async function updateLead(id, tenantId, patch) {
  const existing = await getOne('SELECT * FROM leads WHERE id = ? AND tenant_id = ?', [id, tenantId]);
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
    fields.push('updated_at = NOW()');
    if (patch.stage && patch.stage !== existing.stage) {
      fields.push('stage_entered_at = NOW()');
    }
    values.push(id, tenantId);
    await run(`UPDATE leads SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`, values);
  }
  return getLeadById(id, tenantId);
}

export async function getConversationByPhone(phone, tenantId) {
  const id = convId(tenantId, phone);
  const row = await getOne('SELECT * FROM conversations WHERE id = ?', [id]);
  return row ? rowToConversation(row) : null;
}

export async function summarizeConversation(conversationId, tenantId) {
  const row = await getOne('SELECT * FROM conversations WHERE id = ? AND tenant_id = ?', [conversationId, tenantId]);
  if (!row) return null;
  const messages = (await loadMessages(conversationId)).slice(-12);
  const userMsgs = messages.filter((m) => m.role === 'user').map((m) => m.text);
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

export async function getAnalytics(tenantId) {
  const month = new Date().toISOString().slice(0, 7);
  const usage = await getOne('SELECT * FROM usage WHERE tenant_id = ? AND month = ?', [tenantId, month]);
  const leadCount = (await getOne('SELECT COUNT(*)::int AS c FROM leads WHERE tenant_id = ?', [tenantId]))?.c ?? 0;
  const convCount = (await getOne('SELECT COUNT(*)::int AS c FROM conversations WHERE tenant_id = ?', [tenantId]))?.c ?? 0;
  const siteLeads = (await getOne("SELECT COUNT(*)::int AS c FROM leads WHERE tenant_id = ? AND stage = 'site'", [tenantId]))?.c ?? 0;
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

export async function assignConversation(conversationId, tenantId, agentName) {
  await run(
    `UPDATE conversations SET assigned_agent = ?, status = 'agent', updated_at = NOW() WHERE id = ? AND tenant_id = ?`,
    [agentName, conversationId, tenantId],
  );
}

export async function createBroadcast(tenantId, message) {
  const id = nanoid();
  await run('INSERT INTO broadcasts (id, tenant_id, message, status) VALUES (?, ?, ?, ?)', [id, tenantId, message, 'sent']);
  const leads = await getLeads(tenantId);
  await run('UPDATE broadcasts SET sent_count = ?, status = ? WHERE id = ?', [leads.length, 'sent', id]);
  return { id, sentCount: leads.length, status: 'sent' };
}

export async function createReminder(tenantId, { leadId, message, remindAt }) {
  const id = nanoid();
  await run(
    `INSERT INTO reminders (id, tenant_id, lead_id, message, remind_at, status) VALUES (?, ?, ?, ?, ?, 'pending')`,
    [id, tenantId, leadId ?? null, message, remindAt],
  );
  return { id, status: 'pending' };
}

export async function getReminders(tenantId) {
  return getAll('SELECT * FROM reminders WHERE tenant_id = ? ORDER BY remind_at ASC', [tenantId]);
}
