import { getPool } from '../db/index.js';
import { DISCUSSION_ENTITY_TYPES } from '../constants.js';
import { logActivity } from './activityService.js';
import { assertProjectAccess } from './authorizationService.js';

async function resolveProjectId(entityType, entityId) {
  if (entityType === 'cluster' && entityId) return Number(entityId);

  const pool = getPool();
  if (entityType === 'work_item' && entityId) {
    const [rows] = await pool.query('SELECT cluster_id FROM work_items WHERE id = ? LIMIT 1', [entityId]);
    return rows[0]?.cluster_id || null;
  }
  if (entityType === 'whiteboard' && entityId) {
    const [rows] = await pool.query('SELECT cluster_id FROM whiteboards WHERE id = ? LIMIT 1', [entityId]);
    return rows[0]?.cluster_id || null;
  }
  return null;
}

export async function assertDiscussionAccess(entityType, entityId, userId) {
  if (!DISCUSSION_ENTITY_TYPES.includes(entityType)) {
    return { error: 'Invalid entity type', status: 400 };
  }
  if (entityType === 'general') {
    return { ok: true, projectId: null };
  }
  if (!entityId) {
    return { error: 'Entity is required', status: 400 };
  }

  const projectId = await resolveProjectId(entityType, Number(entityId));
  if (!projectId) return { error: 'Not found', status: 404 };

  const access = await assertProjectAccess(projectId, userId, 'view');
  if (access.error) return { error: access.error, status: access.status };

  return { ok: true, projectId, role: access.role };
}

export async function listDiscussions(entityType = null, entityId = null, limit = 50, userId = null) {
  if (entityType && entityId != null && userId != null) {
    const access = await assertDiscussionAccess(entityType, entityId, userId);
    if (access.error) return { error: access.error, status: access.status };
  }

  const pool = getPool();
  let sql = `
    SELECT d.*, u.name AS created_by_name
    FROM discussions d
    JOIN users u ON d.created_by = u.id
  `;
  const params = [];

  if (entityType) {
    sql += ' WHERE d.entity_type = ?';
    params.push(entityType);
    if (entityId != null) {
      sql += ' AND d.entity_id = ?';
      params.push(entityId);
    } else if (entityType !== 'general') {
      sql += ' AND d.entity_id IS NULL';
    }
  }

  sql += ` ORDER BY d.created_at DESC LIMIT ${Number(limit)}`;
  const [rows] = await pool.query(sql, params);
  return { discussions: rows };
}

export async function addDiscussion(entityType, entityId, content, userId) {
  const access = await assertDiscussionAccess(entityType, entityId, userId);
  if (access.error) return { error: access.error, status: access.status };

  const text = String(content || '').trim();
  if (!text) return { error: 'Content required', status: 400 };

  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO discussions (entity_type, entity_id, content, created_by) VALUES (?, ?, ?, ?)',
    [entityType, entityId || null, text, userId],
  );
  const [rows] = await pool.query(`
    SELECT d.*, u.name AS created_by_name FROM discussions d
    JOIN users u ON d.created_by = u.id WHERE d.id = ?
  `, [result.insertId]);

  const discussion = rows[0];
  const projectId = access.projectId
    ?? (entityType === 'cluster' && entityId ? Number(entityId) : null);

  await logActivity({
    eventType: 'discussion_added',
    entityType: entityType === 'work_item' ? 'work_item' : entityType,
    entityId: entityId || null,
    projectId,
    actorId: userId,
    summary: `Comment: ${text.slice(0, 80)}`,
  });

  return { discussion };
}
