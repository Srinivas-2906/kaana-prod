import { getPool } from '../db/index.js';
import { WORK_ITEM_TYPES, WORK_STATUSES, WORK_PRIORITIES } from '../constants.js';
import { ensureBaseSchema, ensureM4Schema } from './schemaService.js';
import { logActivity, logFieldChange } from './activityService.js';
import { linkWorkItems } from './entityLinkService.js';

const SELECT = `
  SELECT w.*, c.name AS cluster_name, c.color AS cluster_color,
    u.name AS created_by_name, o.name AS owner_name
  FROM work_items w
  LEFT JOIN clusters c ON w.cluster_id = c.id
  JOIN users u ON w.created_by = u.id
  LEFT JOIN users o ON w.owner_id = o.id
`;

const IDEA_STAGES = ['captured', 'refining', 'needs_input', 'approved', 'rejected', 'paused'];

function toDateOnly(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const s = String(value);
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : s;
}

function normalizeStoryPoints(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function serializeContentSections(value) {
  if (value == null) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
}

function bindContentSections(value) {
  const parsed = serializeContentSections(value);
  if (parsed == null) return null;
  return JSON.stringify(parsed);
}

function normalizeWorkItemPayload(data) {
  const payload = { ...data };
  delete payload.cluster_name;
  delete payload.cluster_color;
  delete payload.created_by_name;
  delete payload.owner_name;
  delete payload.custom_sections;
  payload.story_points = normalizeStoryPoints(payload.story_points);
  payload.due_date = toDateOnly(payload.due_date);
  payload.start_date = toDateOnly(payload.start_date);
  return payload;
}

function syncLegacySectionFields(data) {
  const sections = data.content_sections;
  if (!sections) return data;

  let parsed = sections;
  if (typeof sections === 'string') {
    try {
      parsed = JSON.parse(sections);
    } catch {
      return data;
    }
  }
  if (!Array.isArray(parsed)) return data;

  const description = parsed.find((s) => s.builtin === 'description')?.content ?? data.description;
  const implementation_notes = parsed.find((s) => s.builtin === 'implementation_notes')?.content ?? data.implementation_notes;

  return {
    ...data,
    description: description ?? null,
    implementation_notes: implementation_notes ?? null,
    content_sections: serializeContentSections(parsed),
  };
}

function validateWorkItem(data) {
  const errors = [];
  if (!String(data.title || '').trim()) errors.push('Title is required');
  if (!WORK_ITEM_TYPES.includes(data.item_type)) errors.push('Invalid item type');
  if (!WORK_STATUSES.includes(data.status)) errors.push('Invalid status');
  if (!WORK_PRIORITIES.includes(data.priority)) errors.push('Invalid priority');
  if (data.idea_stage && !IDEA_STAGES.includes(data.idea_stage)) errors.push('Invalid idea stage');
  return errors;
}

export async function listWorkItems(filters = {}) {
  const pool = getPool();
  const where = [];
  const params = [];

  if (filters.projectId) { where.push('w.cluster_id = ?'); params.push(filters.projectId); }
  else if (filters.accessibleProjectIds) {
    if (!filters.accessibleProjectIds.length) return [];
    where.push(`w.cluster_id IN (${filters.accessibleProjectIds.map(() => '?').join(',')})`);
    params.push(...filters.accessibleProjectIds);
  }
  if (filters.itemType) { where.push('w.item_type = ?'); params.push(filters.itemType); }
  if (filters.parentId != null) { where.push('w.parent_id = ?'); params.push(filters.parentId); }
  if (filters.ideaStage) { where.push('w.idea_stage = ?'); params.push(filters.ideaStage); }
  if (filters.status) { where.push('w.status = ?'); params.push(filters.status); }
  if (filters.excludeDone) where.push("w.status != 'done'");
  if (filters.createdBy) { where.push('w.created_by = ?'); params.push(filters.createdBy); }
  if (filters.ownerId) { where.push('w.owner_id = ?'); params.push(filters.ownerId); }
  if (filters.dateFrom && filters.dateTo) {
    where.push('(w.due_date BETWEEN ? AND ? OR w.start_date BETWEEN ? AND ?)');
    params.push(filters.dateFrom, filters.dateTo, filters.dateFrom, filters.dateTo);
  }
  if (filters.date) {
    where.push('(w.due_date = ? OR w.start_date = ?)');
    params.push(filters.date, filters.date);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await pool.query(`
    ${SELECT}
    ${whereClause}
    ORDER BY FIELD(w.priority, 'urgent', 'high', 'medium', 'low'),
      w.due_date IS NULL, w.due_date ASC, w.updated_at DESC
  `, params);
  return rows;
}

export async function getWorkItemById(id) {
  const pool = getPool();
  const [rows] = await pool.query(`${SELECT} WHERE w.id = ?`, [id]);
  return rows[0] || null;
}

export async function createWorkItem(data, userId) {
  const errors = validateWorkItem(data);
  if (errors.length) return { errors };

  await ensureM4Schema();
  const pool = getPool();
  const ideaStage = data.item_type === 'idea' ? (data.idea_stage || 'captured') : null;
  const payload = syncLegacySectionFields(normalizeWorkItemPayload(data));

  const [result] = await pool.query(`
    INSERT INTO work_items (cluster_id, parent_id, title, description, acceptance_criteria, implementation_notes, content_sections, item_type, idea_stage, status, priority, story_points, due_date, start_date, source_note_id, owner_id, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    payload.cluster_id || null,
    payload.parent_id || null,
    payload.title.trim(),
    payload.description || null,
    payload.acceptance_criteria || null,
    payload.implementation_notes || null,
    bindContentSections(payload.content_sections),
    payload.item_type,
    ideaStage,
    payload.status,
    payload.priority,
    payload.story_points ?? null,
    payload.due_date || null,
    payload.start_date || null,
    payload.source_note_id || null,
    payload.owner_id || userId,
    userId,
  ]);

  const item = await getWorkItemById(result.insertId);

  await logActivity({
    eventType: 'work_item_created',
    entityType: 'work_item',
    entityId: item.id,
    projectId: item.cluster_id,
    actorId: userId,
    summary: `Created ${item.item_type}: ${item.title}`,
    payload: { item_type: item.item_type, status: item.status },
  });

  if (data.parent_id) {
    await linkWorkItems(item.id, data.parent_id, 'belongs_to', userId);
  }

  return { item };
}

export async function updateWorkItem(id, data, userId) {
  const errors = validateWorkItem(data);
  if (errors.length) return { errors };

  const existing = await getWorkItemById(id);
  if (!existing) return { error: 'Not found' };

  await ensureM4Schema();
  const pool = getPool();
  const ideaStage = data.item_type === 'idea' ? (data.idea_stage || existing.idea_stage || 'captured') : null;
  const payload = syncLegacySectionFields(normalizeWorkItemPayload(data));

  await pool.query(`
    UPDATE work_items
    SET cluster_id = ?, parent_id = ?, title = ?, description = ?, acceptance_criteria = ?, implementation_notes = ?, content_sections = ?,
        item_type = ?, idea_stage = ?, status = ?, priority = ?, story_points = ?,
        due_date = ?, start_date = ?, owner_id = ?
    WHERE id = ?
  `, [
    payload.cluster_id || null,
    payload.parent_id || null,
    payload.title.trim(),
    payload.description || null,
    payload.acceptance_criteria || null,
    payload.implementation_notes || null,
    bindContentSections(payload.content_sections ?? existing.content_sections),
    payload.item_type,
    ideaStage,
    payload.status,
    payload.priority,
    payload.story_points ?? null,
    payload.due_date || null,
    payload.start_date || null,
    payload.owner_id ?? existing.owner_id,
    id,
  ]);

  const fields = ['title', 'status', 'priority', 'due_date', 'start_date', 'idea_stage', 'owner_id', 'story_points', 'acceptance_criteria', 'implementation_notes', 'parent_id'];
  for (const f of fields) {
    const newVal = f === 'idea_stage' ? ideaStage : data[f] ?? existing[f];
    const oldVal = existing[f];
    if (String(oldVal ?? '') !== String(newVal ?? '')) {
      await logFieldChange('work_item', id, f, oldVal, newVal, userId);
    }
  }

  if (data.parent_id && data.parent_id !== existing.parent_id) {
    await linkWorkItems(id, data.parent_id, 'belongs_to', userId);
  }

  const item = await getWorkItemById(id);
  await logActivity({
    eventType: 'work_item_updated',
    entityType: 'work_item',
    entityId: id,
    projectId: item.cluster_id,
    actorId: userId,
    summary: `Updated: ${item.title}`,
  });

  return { item };
}

export async function updateWorkItemStatus(id, status, userId) {
  if (!WORK_STATUSES.includes(status)) return { error: 'Invalid status' };
  const existing = await getWorkItemById(id);
  if (!existing) return { error: 'Not found' };
  if (existing.status === status) return { item: existing };

  const pool = getPool();
  await pool.query('UPDATE work_items SET status = ? WHERE id = ?', [status, id]);

  await logFieldChange('work_item', id, 'status', existing.status, status, userId);
  await logActivity({
    eventType: 'status_changed',
    entityType: 'work_item',
    entityId: id,
    projectId: existing.cluster_id,
    actorId: userId,
    summary: `${existing.title}: ${existing.status} → ${status}`,
    payload: { from: existing.status, to: status },
  });

  return { item: await getWorkItemById(id) };
}

export async function promoteIdeaToStory(ideaId, userId, options = {}) {
  const idea = await getWorkItemById(ideaId);
  if (!idea || idea.item_type !== 'idea') return { error: 'Not an idea' };

  const result = await createWorkItem({
    title: options.title || idea.title,
    description: options.description || idea.description,
    item_type: 'story',
    status: 'backlog',
    priority: idea.priority,
    cluster_id: idea.cluster_id,
    parent_id: ideaId,
    due_date: options.due_date || idea.due_date,
    start_date: options.start_date || idea.start_date,
  }, userId);

  if (result.errors) return result;

  await linkWorkItems(result.item.id, ideaId, 'derived_from', userId);
  await logActivity({
    eventType: 'idea_promoted',
    entityType: 'work_item',
    entityId: ideaId,
    projectId: idea.cluster_id,
    actorId: userId,
    summary: `Idea promoted to story: ${result.item.title}`,
    payload: { story_id: result.item.id },
  });

  return result;
}

export async function deleteWorkItem(id, userId) {
  const existing = await getWorkItemById(id);
  if (!existing) return;

  const pool = getPool();
  await pool.query("DELETE FROM discussions WHERE entity_type = 'work_item' AND entity_id = ?", [id]);
  await pool.query('DELETE FROM work_items WHERE id = ?', [id]);

  if (userId) {
    await logActivity({
      eventType: 'work_item_deleted',
      entityType: 'work_item',
      entityId: id,
      projectId: existing.cluster_id,
      actorId: userId,
      summary: `Deleted: ${existing.title}`,
    });
  }
}

export async function getWorkStats() {
  await ensureBaseSchema();
  await ensureM4Schema();
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status != 'done' THEN 1 ELSE 0 END) AS open_count,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
      SUM(CASE WHEN due_date = CURDATE() AND status != 'done' THEN 1 ELSE 0 END) AS due_today,
      SUM(CASE WHEN due_date < CURDATE() AND status != 'done' AND due_date IS NOT NULL THEN 1 ELSE 0 END) AS overdue
    FROM work_items
  `);
  return rows[0] || { total: 0, open_count: 0, in_progress: 0, due_today: 0, overdue: 0 };
}

export { IDEA_STAGES };
