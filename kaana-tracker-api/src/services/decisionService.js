import { getPool } from '../db/index.js';
import { logActivity } from './activityService.js';

const STATUSES = ['proposed', 'approved', 'superseded', 'rejected'];

export async function listDecisions(filters = {}) {
  const pool = getPool();
  const where = [];
  const params = [];

  if (filters.projectId) {
    where.push('d.project_id = ?');
    params.push(filters.projectId);
  }
  if (filters.status) {
    where.push('d.status = ?');
    params.push(filters.status);
  }
  if (filters.date) {
    where.push('(d.decided_at = ? OR DATE(d.created_at) = ?)');
    params.push(filters.date, filters.date);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await pool.query(`
    SELECT d.*, u.name AS created_by_name, c.name AS project_name
    FROM decisions d
    JOIN users u ON d.created_by = u.id
    LEFT JOIN clusters c ON d.project_id = c.id
    ${whereClause}
    ORDER BY d.created_at DESC
    LIMIT 100
  `, params);
  return rows;
}

export async function createDecision(data, userId) {
  const title = String(data.title || '').trim();
  if (!title) return { error: 'Title required' };
  if (data.status && !STATUSES.includes(data.status)) return { error: 'Invalid status' };

  const pool = getPool();
  const [result] = await pool.query(`
    INSERT INTO decisions (project_id, title, rationale, status, decided_at, work_item_id, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    data.project_id || null,
    title,
    data.rationale || null,
    data.status || 'proposed',
    data.decided_at || null,
    data.work_item_id || null,
    userId,
  ]);

  await logActivity({
    eventType: 'decision_created',
    entityType: 'decision',
    entityId: result.insertId,
    projectId: data.project_id || null,
    actorId: userId,
    summary: `Decision: ${title}`,
    payload: { status: data.status || 'proposed' },
  });

  const [rows] = await pool.query(`
    SELECT d.*, u.name AS created_by_name FROM decisions d
    JOIN users u ON d.created_by = u.id WHERE d.id = ?
  `, [result.insertId]);
  return { decision: rows[0] };
}

export async function updateDecisionStatus(id, status, userId) {
  if (!STATUSES.includes(status)) return { error: 'Invalid status' };
  const pool = getPool();
  const [existing] = await pool.query('SELECT * FROM decisions WHERE id = ?', [id]);
  if (!existing[0]) return { error: 'Not found' };

  await pool.query('UPDATE decisions SET status = ?, decided_at = COALESCE(decided_at, CURDATE()) WHERE id = ?', [status, id]);

  await logActivity({
    eventType: 'decision_status_changed',
    entityType: 'decision',
    entityId: id,
    projectId: existing[0].project_id,
    actorId: userId,
    summary: `Decision "${existing[0].title}" → ${status}`,
    payload: { from: existing[0].status, to: status },
  });

  const [rows] = await pool.query(`
    SELECT d.*, u.name AS created_by_name FROM decisions d
    JOIN users u ON d.created_by = u.id WHERE d.id = ?
  `, [id]);
  return { decision: rows[0] };
}
