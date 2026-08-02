import { getPool } from '../db/index.js';
import { logActivity } from './activityService.js';

export async function listReminders(filters = {}) {
  const pool = getPool();
  const where = [];
  const params = [];

  if (filters.date) {
    where.push('r.reminder_date = ?');
    params.push(filters.date);
  }
  if (filters.projectId) {
    where.push('(r.project_id = ? OR r.project_id IS NULL)');
    params.push(filters.projectId);
  }
  if (filters.upcoming) {
    where.push('r.reminder_date >= CURDATE() AND r.completed_at IS NULL');
  }
  if (!filters.includeCompleted) {
    where.push('r.completed_at IS NULL');
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await pool.query(`
    SELECT r.*, u.name AS created_by_name, c.name AS project_name
    FROM reminders r
    JOIN users u ON r.created_by = u.id
    LEFT JOIN clusters c ON r.project_id = c.id
    ${whereClause}
    ORDER BY r.reminder_date ASC, r.reminder_time ASC, r.id ASC
    LIMIT 200
  `, params);
  return rows;
}

export async function createReminder(data, userId) {
  const title = String(data.title || '').trim();
  if (!title) return { error: 'Title required' };
  if (!data.reminder_date) return { error: 'Date required' };

  const pool = getPool();
  const [result] = await pool.query(`
    INSERT INTO reminders (title, notes, reminder_date, reminder_time, project_id, work_item_id, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    title,
    data.notes || null,
    data.reminder_date,
    data.reminder_time || null,
    data.project_id || null,
    data.work_item_id || null,
    userId,
  ]);

  await logActivity({
    eventType: 'reminder_created',
    entityType: 'reminder',
    entityId: result.insertId,
    projectId: data.project_id || null,
    actorId: userId,
    summary: `Reminder: ${title} on ${data.reminder_date}`,
  });

  const [rows] = await pool.query(`
    SELECT r.*, u.name AS created_by_name, c.name AS project_name
    FROM reminders r JOIN users u ON r.created_by = u.id
    LEFT JOIN clusters c ON r.project_id = c.id WHERE r.id = ?
  `, [result.insertId]);
  return { reminder: rows[0] };
}

export async function completeReminder(id, userId) {
  const pool = getPool();
  const [existing] = await pool.query('SELECT * FROM reminders WHERE id = ?', [id]);
  if (!existing[0]) return { error: 'Not found' };

  await pool.query('UPDATE reminders SET completed_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

  await logActivity({
    eventType: 'reminder_completed',
    entityType: 'reminder',
    entityId: id,
    projectId: existing[0].project_id,
    actorId: userId,
    summary: `Completed reminder: ${existing[0].title}`,
  });

  const [rows] = await pool.query(`
    SELECT r.*, u.name AS created_by_name FROM reminders r
    JOIN users u ON r.created_by = u.id WHERE r.id = ?
  `, [id]);
  return { reminder: rows[0] };
}

export async function deleteReminder(id) {
  const pool = getPool();
  await pool.query('DELETE FROM reminders WHERE id = ?', [id]);
  return { ok: true };
}

export async function getReminderCountsByDate(from, to, projectId = null) {
  const pool = getPool();
  const where = ['r.reminder_date BETWEEN ? AND ?', 'r.completed_at IS NULL'];
  const params = [from, to];
  if (projectId) {
    where.push('(r.project_id = ? OR r.project_id IS NULL)');
    params.push(projectId);
  }
  const [rows] = await pool.query(`
    SELECT r.reminder_date AS date, COUNT(*) AS count
    FROM reminders r
    WHERE ${where.join(' AND ')}
    GROUP BY r.reminder_date
  `, params);
  const map = {};
  for (const row of rows) {
    map[row.date] = Number(row.count);
  }
  return map;
}
