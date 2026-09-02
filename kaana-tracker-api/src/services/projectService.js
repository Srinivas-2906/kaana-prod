import { getPool } from '../db/index.js';
import { ensureBaseSchema, ensurePhase2Schema } from './schemaService.js';
import { ensureProjectOwnerMembership, listAccessibleProjectIds } from './authorizationService.js';
import { deriveProjectKey } from './issueKeyService.js';
import { ensureDefaultLabels } from './labelService.js';

async function ensureUniqueProjectKey(baseKey, excludeId = null) {
  await ensurePhase2Schema();
  const pool = getPool();
  let key = baseKey;
  let suffix = 1;
  for (;;) {
    const params = excludeId ? [key, excludeId] : [key];
    const sql = excludeId
      ? 'SELECT id FROM clusters WHERE project_key = ? AND id != ? LIMIT 1'
      : 'SELECT id FROM clusters WHERE project_key = ? LIMIT 1';
    const [rows] = await pool.query(sql, params);
    if (!rows[0]) return key;
    key = `${baseKey}${suffix}`.slice(0, 12);
    suffix += 1;
  }
}

export async function ensureProjectKey(projectId) {
  await ensurePhase2Schema();
  const pool = getPool();
  const [rows] = await pool.query('SELECT id, name, project_key FROM clusters WHERE id = ? LIMIT 1', [projectId]);
  const project = rows[0];
  if (!project) return null;
  if (project.project_key) return project.project_key;

  const key = await ensureUniqueProjectKey(deriveProjectKey(project.name), projectId);
  await pool.query('UPDATE clusters SET project_key = ? WHERE id = ?', [key, projectId]);
  return key;
}

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

  for (const row of rows) {
    if (!row.project_key) row.project_key = await ensureProjectKey(row.id);
  }
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
  const project = rows[0] || null;
  if (project && !project.project_key) {
    project.project_key = await ensureProjectKey(project.id);
  }
  return project;
}

export async function createProject(data, userId) {
  await ensurePhase2Schema();
  const pool = getPool();
  const projectKey = await ensureUniqueProjectKey(deriveProjectKey(data.name));
  const [result] = await pool.query(
    'INSERT INTO clusters (name, description, color, created_by, project_key) VALUES (?, ?, ?, ?, ?)',
    [data.name, data.description || null, data.color || '#3b82f6', userId, projectKey],
  );
  await ensureProjectOwnerMembership(result.insertId, userId);
  await ensureDefaultLabels(result.insertId);
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
