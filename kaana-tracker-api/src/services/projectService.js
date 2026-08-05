import { getPool } from '../db/index.js';
import { ensureBaseSchema } from './schemaService.js';
import { ensureProjectOwnerMembership, listAccessibleProjectIds } from './authorizationService.js';

export async function listProjects(userId) {
  await ensureBaseSchema();
  const pool = getPool();
  const projectIds = await listAccessibleProjectIds(userId);
  if (!projectIds.length) return [];

  const placeholders = projectIds.map(() => '?').join(',');
  const [rows] = await pool.query(`
    SELECT c.*, u.name AS created_by_name,
      pm.role AS my_role,
      (SELECT COUNT(*) FROM work_items w WHERE w.cluster_id = c.id) AS item_count,
      (SELECT COUNT(*) FROM work_items w WHERE w.cluster_id = c.id AND w.status != 'done') AS open_count
    FROM clusters c
    JOIN users u ON c.created_by = u.id
    LEFT JOIN project_members pm ON pm.project_id = c.id AND pm.user_id = ?
    WHERE c.id IN (${placeholders})
    ORDER BY c.name ASC
  `, [userId, ...projectIds]);
  return rows;
}

export async function getProjectById(id, userId) {
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT c.*, u.name AS created_by_name,
      pm.role AS my_role
    FROM clusters c
    JOIN users u ON c.created_by = u.id
    LEFT JOIN project_members pm ON pm.project_id = c.id AND pm.user_id = ?
    WHERE c.id = ?
  `, [userId, id]);
  return rows[0] || null;
}

export async function createProject(data, userId) {
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO clusters (name, description, color, created_by) VALUES (?, ?, ?, ?)',
    [data.name, data.description || null, data.color || '#3b82f6', userId],
  );
  await ensureProjectOwnerMembership(result.insertId, userId);
  return getProjectById(result.insertId, userId);
}

export async function updateProject(id, data, userId) {
  const pool = getPool();
  await pool.query(
    'UPDATE clusters SET name = ?, description = ?, color = ? WHERE id = ?',
    [data.name, data.description || null, data.color || '#3b82f6', id],
  );
  return getProjectById(id, userId);
}

export async function deleteProject(id) {
  const pool = getPool();
  await pool.query('DELETE FROM clusters WHERE id = ?', [id]);
}
