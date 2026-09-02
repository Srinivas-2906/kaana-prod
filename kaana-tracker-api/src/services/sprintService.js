import { getPool } from '../db/index.js';
import { ensurePhase2Schema } from './schemaService.js';
import { assertProjectAccess } from './authorizationService.js';

export async function listSprints(projectId, userId) {
  const access = await assertProjectAccess(projectId, userId, 'view');
  if (access.error) return { error: access.error, status: access.status };

  await ensurePhase2Schema();
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT s.*,
      (SELECT COUNT(*) FROM work_items w WHERE w.sprint_id = s.id) AS item_count,
      (SELECT COUNT(*) FROM work_items w WHERE w.sprint_id = s.id AND w.status = 'done') AS done_count
    FROM sprints s
    WHERE s.project_id = ?
    ORDER BY FIELD(s.status, 'active', 'planning', 'closed'), s.start_date DESC, s.id DESC
  `, [projectId]);
  return { sprints: rows };
}

export async function createSprint(projectId, data, userId) {
  const access = await assertProjectAccess(projectId, userId, 'edit');
  if (access.error) return { error: access.error, status: access.status };

  const name = String(data.name || '').trim();
  if (!name) return { error: 'Sprint name is required', status: 400 };

  await ensurePhase2Schema();
  const pool = getPool();

  if (data.status === 'active') {
    await pool.query(
      "UPDATE sprints SET status = 'planning' WHERE project_id = ? AND status = 'active'",
      [projectId],
    );
  }

  const [result] = await pool.query(
    `INSERT INTO sprints (project_id, name, goal, start_date, end_date, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      projectId,
      name,
      data.goal || null,
      data.start_date || null,
      data.end_date || null,
      ['planning', 'active', 'closed'].includes(data.status) ? data.status : 'planning',
      userId,
    ],
  );

  const [rows] = await pool.query('SELECT * FROM sprints WHERE id = ?', [result.insertId]);
  return { sprint: rows[0] };
}

export async function updateSprint(projectId, sprintId, data, userId) {
  const access = await assertProjectAccess(projectId, userId, 'edit');
  if (access.error) return { error: access.error, status: access.status };

  await ensurePhase2Schema();
  const pool = getPool();
  const [existing] = await pool.query(
    'SELECT * FROM sprints WHERE id = ? AND project_id = ? LIMIT 1',
    [sprintId, projectId],
  );
  if (!existing[0]) return { error: 'Sprint not found', status: 404 };

  if (data.status === 'active') {
    await pool.query(
      "UPDATE sprints SET status = 'planning' WHERE project_id = ? AND status = 'active' AND id != ?",
      [projectId, sprintId],
    );
  }

  const sprint = existing[0];
  await pool.query(
    `UPDATE sprints SET name = ?, goal = ?, start_date = ?, end_date = ?, status = ? WHERE id = ?`,
    [
      data.name !== undefined ? String(data.name).trim() : sprint.name,
      data.goal !== undefined ? data.goal : sprint.goal,
      data.start_date !== undefined ? data.start_date : sprint.start_date,
      data.end_date !== undefined ? data.end_date : sprint.end_date,
      data.status !== undefined ? data.status : sprint.status,
      sprintId,
    ],
  );

  const [rows] = await pool.query('SELECT * FROM sprints WHERE id = ?', [sprintId]);
  return { sprint: rows[0] };
}
