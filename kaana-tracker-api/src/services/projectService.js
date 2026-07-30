import { getPool } from '../db/index.js';

export async function listProjects() {
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT c.*, u.name AS created_by_name,
      (SELECT COUNT(*) FROM work_items w WHERE w.cluster_id = c.id) AS item_count,
      (SELECT COUNT(*) FROM work_items w WHERE w.cluster_id = c.id AND w.status != 'done') AS open_count
    FROM clusters c
    JOIN users u ON c.created_by = u.id
    ORDER BY c.name ASC
  `);
  return rows;
}

export async function getProjectById(id) {
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT c.*, u.name AS created_by_name
    FROM clusters c
    JOIN users u ON c.created_by = u.id
    WHERE c.id = ?
  `, [id]);
  return rows[0] || null;
}

export async function createProject(data, userId) {
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO clusters (name, description, color, created_by) VALUES (?, ?, ?, ?)',
    [data.name, data.description || null, data.color || '#3b82f6', userId],
  );
  return getProjectById(result.insertId);
}

export async function updateProject(id, data) {
  const pool = getPool();
  await pool.query(
    'UPDATE clusters SET name = ?, description = ?, color = ? WHERE id = ?',
    [data.name, data.description || null, data.color || '#3b82f6', id],
  );
  return getProjectById(id);
}

export async function deleteProject(id) {
  const pool = getPool();
  await pool.query('DELETE FROM clusters WHERE id = ?', [id]);
}
