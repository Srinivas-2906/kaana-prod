import { getPool } from '../db/index.js';

export async function logActivity({
  eventType,
  entityType,
  entityId = null,
  projectId = null,
  actorId,
  summary,
  payload = null,
}) {
  const pool = getPool();
  const [result] = await pool.query(`
    INSERT INTO activity_events (event_type, entity_type, entity_id, project_id, actor_id, summary, payload)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    eventType,
    entityType,
    entityId,
    projectId,
    actorId,
    summary.slice(0, 500),
    payload ? JSON.stringify(payload) : null,
  ]);
  return result.insertId;
}

export async function logFieldChange(entityType, entityId, fieldName, oldVal, newVal, actorId) {
  if (String(oldVal ?? '') === String(newVal ?? '')) return;
  const pool = getPool();
  await pool.query(`
    INSERT INTO entity_versions (entity_type, entity_id, field_name, old_value, new_value, actor_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [entityType, entityId, fieldName, oldVal != null ? String(oldVal) : null, newVal != null ? String(newVal) : null, actorId]);
}

export async function listActivity(filters = {}) {
  const pool = getPool();
  const where = [];
  const params = [];

  if (filters.projectId) {
    where.push('(a.project_id = ? OR (a.entity_type = \'cluster\' AND a.entity_id = ?))');
    params.push(filters.projectId, filters.projectId);
  }
  if (filters.entityType) {
    where.push('a.entity_type = ?');
    params.push(filters.entityType);
  }
  if (filters.entityId) {
    where.push('a.entity_id = ?');
    params.push(filters.entityId);
  }
  if (filters.dateFrom) {
    where.push('DATE(a.created_at) >= ?');
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    where.push('DATE(a.created_at) <= ?');
    params.push(filters.dateTo);
  }
  if (filters.date) {
    where.push('DATE(a.created_at) = ?');
    params.push(filters.date);
  }
  if (filters.eventType) {
    where.push('a.event_type = ?');
    params.push(filters.eventType);
  }

  const limit = Math.min(Number(filters.limit) || 50, 200);
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [rows] = await pool.query(`
    SELECT a.*, u.name AS actor_name
    FROM activity_events a
    JOIN users u ON a.actor_id = u.id
    ${whereClause}
    ORDER BY a.created_at DESC
    LIMIT ?
  `, [...params, limit]);

  return rows.map((r) => ({
    ...r,
    payload: r.payload ? (typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload) : null,
  }));
}

export async function getEntityStateAt(entityType, entityId, asOfDate) {
  const pool = getPool();
  const [versions] = await pool.query(`
    SELECT field_name, new_value, created_at
    FROM entity_versions
    WHERE entity_type = ? AND entity_id = ? AND DATE(created_at) <= ?
    ORDER BY created_at ASC
  `, [entityType, entityId, asOfDate]);

  const state = {};
  for (const v of versions) {
    state[v.field_name] = v.new_value;
  }
  return state;
}

export async function listEntityVersions(entityType, entityId, limit = 100) {
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT v.*, u.name AS actor_name
    FROM entity_versions v
    JOIN users u ON v.actor_id = u.id
    WHERE v.entity_type = ? AND v.entity_id = ?
    ORDER BY v.created_at DESC
    LIMIT ?
  `, [entityType, entityId, Math.min(Number(limit) || 100, 200)]);
  return rows;
}
