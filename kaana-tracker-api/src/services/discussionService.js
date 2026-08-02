import { getPool } from '../db/index.js';
import { DISCUSSION_ENTITY_TYPES } from '../constants.js';
import { logActivity } from './activityService.js';

export async function listDiscussions(entityType = null, entityId = null, limit = 50) {
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
  return rows;
}

export async function addDiscussion(entityType, entityId, content, userId) {
  if (!DISCUSSION_ENTITY_TYPES.includes(entityType)) return { error: 'Invalid entity type' };
  const text = String(content || '').trim();
  if (!text) return { error: 'Content required' };

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
  let projectId = null;
  if (entityType === 'cluster' && entityId) projectId = entityId;
  if (entityType === 'work_item' && entityId) {
    const [wi] = await pool.query('SELECT cluster_id FROM work_items WHERE id = ?', [entityId]);
    projectId = wi[0]?.cluster_id || null;
  }

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
