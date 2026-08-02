import { getPool } from '../db/index.js';
import { WORK_ITEM_TYPES, workTypeColor } from '../constants.js';
import { listWorkItems, createWorkItem } from './workItemService.js';
import { ensurePlanSchema } from './schemaService.js';
import { listTransactions } from './transactionService.js';
import { listDiscussions } from './discussionService.js';
import { listJournalEntries } from './journalService.js';
import { listDecisions } from './decisionService.js';
import { listActivity } from './activityService.js';
import { listReminders, getReminderCountsByDate } from './reminderService.js';

function workEntry(item, role, color) {
  return {
    kind: 'work',
    role,
    id: item.id,
    title: item.title,
    item_type: item.item_type,
    status: item.status,
    priority: item.priority,
    color,
    cluster_name: item.cluster_name,
    link: `/work/${item.id}`,
  };
}

export async function getScheduledNotesInRange(from, to) {
  await ensurePlanSchema();
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT n.*, wb.title AS board_title
    FROM whiteboard_notes n
    JOIN whiteboards wb ON n.whiteboard_id = wb.id
    WHERE n.scheduled_date BETWEEN ? AND ?
    ORDER BY n.scheduled_date ASC, n.id ASC
  `, [from, to]);
  return rows;
}

export async function getScheduledNotesForDate(date) {
  await ensurePlanSchema();
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT n.*, wb.title AS board_title
    FROM whiteboard_notes n
    JOIN whiteboards wb ON n.whiteboard_id = wb.id
    WHERE n.scheduled_date = ?
    ORDER BY n.id ASC
  `, [date]);
  return rows;
}

export async function buildCalendarMap(from, to, projectId = null, itemType = '') {
  const filters = { dateFrom: from, dateTo: to };
  if (projectId) filters.projectId = projectId;
  if (itemType && WORK_ITEM_TYPES.includes(itemType)) filters.itemType = itemType;

  const items = await listWorkItems(filters);
  const map = {};

  const add = (date, entry) => {
    if (!map[date]) map[date] = [];
    map[date].push(entry);
  };

  for (const item of items) {
    const color = item.cluster_color || workTypeColor(item.item_type);
    if (item.start_date && item.start_date >= from && item.start_date <= to) {
      add(item.start_date, workEntry(item, 'start', color));
    }
    if (item.due_date && item.due_date >= from && item.due_date <= to && item.due_date !== item.start_date) {
      add(item.due_date, workEntry(item, 'due', color));
    }
  }

  if (!itemType || itemType === 'idea') {
    const notes = await getScheduledNotesInRange(from, to);
    for (const note of notes) {
      add(note.scheduled_date, {
        kind: 'idea',
        role: 'scheduled',
        id: note.id,
        title: note.content.slice(0, 80),
        item_type: 'idea',
        status: 'backlog',
        priority: 'medium',
        color: note.color,
        cluster_name: note.board_title,
        link: `/whiteboards/${note.whiteboard_id}`,
      });
    }
  }

  return map;
}

export async function getDayAgenda(date, projectId = null, itemType = '') {
  const filters = { date };
  if (projectId) filters.projectId = projectId;
  if (itemType && WORK_ITEM_TYPES.includes(itemType)) filters.itemType = itemType;

  const items = await listWorkItems(filters);
  const groups = { ideas: [], stories: [], tasks: [], work: [], board_ideas: [] };

  for (const item of items) {
    const key = { idea: 'ideas', story: 'stories', task: 'tasks' }[item.item_type] || 'work';
    groups[key].push(item);
  }

  if (!itemType || itemType === 'idea') {
    groups.board_ideas = await getScheduledNotesForDate(date);
  }

  return groups;
}

export async function getIdeaPool(limit = 12) {
  await ensurePlanSchema();
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT n.*, wb.title AS board_title
    FROM whiteboard_notes n
    JOIN whiteboards wb ON n.whiteboard_id = wb.id
    LEFT JOIN work_items w ON w.source_note_id = n.id
    WHERE w.id IS NULL AND (n.scheduled_date IS NULL OR n.scheduled_date >= CURDATE())
    ORDER BY n.updated_at DESC
    LIMIT ?
  `, [Number(limit)]);
  return rows;
}

export async function scheduleWhiteboardNote(noteId, date) {
  await ensurePlanSchema();
  const pool = getPool();
  await pool.query('UPDATE whiteboard_notes SET scheduled_date = ? WHERE id = ?', [date || null, noteId]);
  const [rows] = await pool.query('SELECT * FROM whiteboard_notes WHERE id = ?', [noteId]);
  return rows[0] || null;
}

export async function promoteNoteToWork(noteId, userId, options = {}) {
  await ensurePlanSchema();
  const pool = getPool();
  const [notes] = await pool.query('SELECT * FROM whiteboard_notes WHERE id = ?', [noteId]);
  const note = notes[0];
  if (!note) return { error: 'Note not found' };

  const [boards] = await pool.query('SELECT title FROM whiteboards WHERE id = ?', [note.whiteboard_id]);
  const boardTitle = boards[0]?.title || 'Board';

  let title = String(options.title || note.content).trim();
  if (!title) return { error: 'Title required' };
  if (title.length > 200) title = `${title.slice(0, 197)}...`;

  const dueDate = options.due_date || note.scheduled_date || new Date().toISOString().slice(0, 10);
  const result = await createWorkItem({
    title,
    description: `From whiteboard: ${boardTitle}\n\n${note.content}`,
    item_type: options.item_type || 'task',
    status: options.status || 'todo',
    priority: options.priority || 'medium',
    cluster_id: options.cluster_id || null,
    due_date: dueDate,
    start_date: options.start_date || dueDate,
    source_note_id: noteId,
  }, userId);

  if (result.errors) return { errors: result.errors };

  await scheduleWhiteboardNote(noteId, dueDate);
  return { item: result.item };
}

export async function getDayMetaMap(from, to, projectId = null) {
  const pool = getPool();
  const meta = {};

  const add = (date, key) => {
    if (!meta[date]) meta[date] = { work: 0, finance: 0, reminders: 0, discussions: 0, activity: 0 };
    meta[date][key] += 1;
  };

  const calMap = await buildCalendarMap(from, to, projectId);
  for (const [date, entries] of Object.entries(calMap)) {
    if (!meta[date]) meta[date] = { work: 0, finance: 0, reminders: 0, discussions: 0, activity: 0 };
    meta[date].work = entries.length;
  }

  const [txRows] = await pool.query(`
    SELECT transaction_date AS date, COUNT(*) AS count
    FROM transactions
    WHERE transaction_date BETWEEN ? AND ?
    GROUP BY transaction_date
  `, [from, to]);
  for (const row of txRows) {
    if (!meta[row.date]) meta[row.date] = { work: 0, finance: 0, reminders: 0, discussions: 0, activity: 0 };
    meta[row.date].finance = Number(row.count);
  }

  const reminderMap = await getReminderCountsByDate(from, to, projectId);
  for (const [date, count] of Object.entries(reminderMap)) {
    if (!meta[date]) meta[date] = { work: 0, finance: 0, reminders: 0, discussions: 0, activity: 0 };
    meta[date].reminders = count;
  }

  const [discRows] = await pool.query(`
    SELECT DATE(created_at) AS date, COUNT(*) AS count
    FROM discussions
    WHERE DATE(created_at) BETWEEN ? AND ?
    GROUP BY DATE(created_at)
  `, [from, to]);
  for (const row of discRows) {
    if (!meta[row.date]) meta[row.date] = { work: 0, finance: 0, reminders: 0, discussions: 0, activity: 0 };
    meta[row.date].discussions = Number(row.count);
  }

  const actWhere = ['DATE(a.created_at) BETWEEN ? AND ?'];
  const actParams = [from, to];
  if (projectId) {
    actWhere.push('a.project_id = ?');
    actParams.push(projectId);
  }
  const [actRows] = await pool.query(`
    SELECT DATE(a.created_at) AS date, COUNT(*) AS count
    FROM activity_events a
    WHERE ${actWhere.join(' AND ')}
    GROUP BY DATE(a.created_at)
  `, actParams);
  for (const row of actRows) {
    if (!meta[row.date]) meta[row.date] = { work: 0, finance: 0, reminders: 0, discussions: 0, activity: 0 };
    meta[row.date].activity = Number(row.count);
  }

  return meta;
}

function glimpseLabel(text, max = 32) {
  const t = String(text || '').trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

function isoDate(val) {
  if (!val) return null;
  if (typeof val === 'string') return val.slice(0, 10);
  return new Date(val).toISOString().slice(0, 10);
}

export async function getCalendarGlimpses(from, to, projectId = null, itemType = '') {
  const glimpses = {};

  const push = (date, item) => {
    const d = isoDate(date);
    if (!d || d < from || d > to) return;
    if (!glimpses[d]) glimpses[d] = [];
    glimpses[d].push(item);
  };

  const calMap = await buildCalendarMap(from, to, projectId, itemType);
  for (const [date, entries] of Object.entries(calMap)) {
    for (const e of entries) {
      push(date, {
        type: e.kind === 'idea' ? 'idea' : 'work',
        label: glimpseLabel(e.title, 28),
        sub: e.role === 'due' ? 'Due' : e.role === 'start' ? 'Start' : e.cluster_name || undefined,
        color: e.color,
        link: e.link,
      });
    }
  }

  if (itemType) {
    const result = {};
    for (const [date, items] of Object.entries(glimpses)) {
      result[date] = {
        items: items.slice(0, 5),
        total: items.length,
        overflow: Math.max(0, items.length - 5),
        activityCount: 0,
      };
    }
    return { glimpses: result, heat: {} };
  }

  const pool = getPool();

  const [txRows] = await pool.query(`
    SELECT type, amount, category, transaction_date
    FROM transactions
    WHERE transaction_date BETWEEN ? AND ?
    ORDER BY transaction_date ASC, amount DESC
  `, [from, to]);
  for (const tx of txRows) {
    push(tx.transaction_date, {
      type: 'finance',
      label: `${tx.type === 'income' ? '+' : '-'}₹${Number(tx.amount).toLocaleString('en-IN')}`,
      sub: tx.category,
      color: tx.type === 'income' ? '#16a34a' : '#dc2626',
    });
  }

  const remWhere = ['r.reminder_date BETWEEN ? AND ?', 'r.completed_at IS NULL'];
  const remParams = [from, to];
  if (projectId) {
    remWhere.push('(r.project_id = ? OR r.project_id IS NULL)');
    remParams.push(projectId);
  }
  const [remRows] = await pool.query(`
    SELECT r.title, r.reminder_date, r.reminder_time
    FROM reminders r
    WHERE ${remWhere.join(' AND ')}
    ORDER BY r.reminder_date, r.reminder_time
  `, remParams);
  for (const r of remRows) {
    push(r.reminder_date, {
      type: 'reminder',
      label: glimpseLabel(r.title, 26),
      sub: r.reminder_time ? String(r.reminder_time).slice(0, 5) : 'Reminder',
      color: '#fef3c7',
    });
  }

  const [discRows] = await pool.query(`
    SELECT d.content, d.entity_type, d.entity_id, DATE(d.created_at) AS d
    FROM discussions d
    WHERE DATE(d.created_at) BETWEEN ? AND ?
    ORDER BY d.created_at DESC
    LIMIT 300
  `, [from, to]);
  for (const d of discRows) {
    push(d.d, {
      type: 'discussion',
      label: glimpseLabel(d.content, 30),
      sub: 'Comment',
      color: '#e0e7ff',
      link: d.entity_type === 'work_item' && d.entity_id ? `/work/${d.entity_id}` : undefined,
    });
  }

  const decWhere = ['(d.decided_at BETWEEN ? AND ? OR DATE(d.created_at) BETWEEN ? AND ?)'];
  const decParams = [from, to, from, to];
  if (projectId) {
    decWhere.push('d.project_id = ?');
    decParams.push(projectId);
  }
  const [decRows] = await pool.query(`
    SELECT d.title, d.status, COALESCE(d.decided_at, DATE(d.created_at)) AS d
    FROM decisions d
    WHERE ${decWhere.join(' AND ')}
  `, decParams);
  for (const d of decRows) {
    push(d.d, {
      type: 'decision',
      label: glimpseLabel(d.title, 28),
      sub: d.status,
      color: '#f3e8ff',
    });
  }

  const actWhere = ['DATE(a.created_at) BETWEEN ? AND ?'];
  const actParams = [from, to];
  if (projectId) {
    actWhere.push('(a.project_id = ? OR a.project_id IS NULL)');
    actParams.push(projectId);
  }
  const [actRows] = await pool.query(`
    SELECT a.event_type, a.summary, a.entity_type, a.entity_id, DATE(a.created_at) AS d
    FROM activity_events a
    WHERE ${actWhere.join(' AND ')}
    ORDER BY a.created_at DESC
    LIMIT 500
  `, actParams);

  const heat = {};
  for (const a of actRows) {
    const date = isoDate(a.d);
    if (!date) continue;
    heat[date] = (heat[date] || 0) + 1;

    const actType = {
      work_item_created: 'created',
      status_changed: 'status',
      work_item_updated: 'updated',
      discussion_added: 'discussion',
      transaction_created: 'finance',
      attachment_added: 'attachment',
      idea_promoted: 'created',
    }[a.event_type] || 'activity';

    let link;
    if (a.entity_type === 'work_item' && a.entity_id) link = `/work/${a.entity_id}`;

    push(date, {
      type: actType,
      label: glimpseLabel(a.summary, 30),
      sub: a.event_type.replace(/_/g, ' '),
      color: actType === 'status' ? '#dbeafe' : actType === 'attachment' ? '#fce7f3' : undefined,
      link,
    });
  }

  // Cap per day: activity-first sort, keep first 5, track overflow
  const result = {};
  for (const [date, items] of Object.entries(glimpses)) {
    const sorted = [...items].sort((a, b) => {
      const actTypes = new Set(['created', 'status', 'updated', 'activity', 'attachment']);
      const aAct = actTypes.has(a.type) ? 0 : 1;
      const bAct = actTypes.has(b.type) ? 0 : 1;
      return aAct - bAct;
    });
    result[date] = {
      items: sorted.slice(0, 5),
      total: items.length,
      overflow: Math.max(0, items.length - 5),
      activityCount: heat[date] || 0,
    };
  }

  // Days with activity but no other items
  for (const [date, count] of Object.entries(heat)) {
    if (!result[date]) {
      result[date] = { items: [], total: 0, overflow: 0, activityCount: count };
    }
  }

  return { glimpses: result, heat };
}

export async function getDaybookSummary(date, projectId = null) {
  const [agenda, transactions, journalEntries, decisions, activity, reminders] = await Promise.all([
    getDayAgenda(date, projectId),
    listTransactions({ date }),
    listJournalEntries({ date, projectId: projectId || undefined }),
    listDecisions({ date, projectId: projectId || undefined }),
    listActivity({ date, projectId: projectId || undefined, limit: 50 }),
    listReminders({ date, projectId: projectId || undefined, includeCompleted: true }),
  ]);

  const discussions = await listDiscussions(null, null, 200);
  const dayDiscussions = discussions.filter(
    (d) => d.created_at && String(d.created_at).slice(0, 10) === date,
  );

  const pool = getPool();
  let overdueWhere = "w.due_date < ? AND w.status != 'done' AND w.due_date IS NOT NULL";
  const overdueParams = [date];
  if (projectId) {
    overdueWhere += ' AND w.cluster_id = ?';
    overdueParams.push(projectId);
  }
  const [overdue] = await pool.query(`
    SELECT w.*, c.name AS cluster_name, c.color AS cluster_color, u.name AS created_by_name
    FROM work_items w
    LEFT JOIN clusters c ON w.cluster_id = c.id
    JOIN users u ON w.created_by = u.id
    WHERE ${overdueWhere}
    ORDER BY w.due_date ASC LIMIT 20
  `, overdueParams);

  const workCount = agenda.ideas.length + agenda.stories.length + agenda.tasks.length + agenda.work.length;

  return {
    date,
    agenda,
    transactions,
    discussions: dayDiscussions,
    journal: journalEntries,
    decisions,
    activity,
    reminders,
    overdue: overdue,
    counts: {
      work: workCount,
      board_ideas: agenda.board_ideas.length,
      transactions: transactions.length,
      discussions: dayDiscussions.length,
      journal: journalEntries.length,
      decisions: decisions.length,
      activity: activity.length,
      reminders: reminders.filter((r) => !r.completed_at).length,
      overdue: overdue.length,
    },
  };
}
