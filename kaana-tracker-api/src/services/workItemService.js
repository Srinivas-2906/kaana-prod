import { getPool } from '../db/index.js';

export async function listWorkItems(filters = {}) {
  const pool = getPool();
  const where = [];
  const params = [];

  if (filters.projectId) {
    where.push('w.cluster_id = ?');
    params.push(filters.projectId);
  }
  if (filters.itemType) {
    where.push('w.item_type = ?');
    params.push(filters.itemType);
  }
  if (filters.excludeDone) {
    where.push("w.status != 'done'");
  }
  if (filters.createdBy) {
    where.push('w.created_by = ?');
    params.push(filters.createdBy);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await pool.query(`
    SELECT w.*, c.name AS cluster_name, c.color AS cluster_color, u.name AS created_by_name
    FROM work_items w
    LEFT JOIN clusters c ON w.cluster_id = c.id
    JOIN users u ON w.created_by = u.id
    ${whereClause}
    ORDER BY FIELD(w.priority, 'urgent', 'high', 'medium', 'low'),
      w.due_date IS NULL, w.due_date ASC, w.updated_at DESC
  `, params);
  return rows;
}

export async function getWorkStats() {
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
