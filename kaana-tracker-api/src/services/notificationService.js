import { getPool } from '../db/index.js';
import { ensureProSchema } from './schemaService.js';

export async function createNotification({ userId, type, title, body = null, link = null }) {
  await ensureProSchema();
  const pool = getPool();
  const [result] = await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)`,
    [userId, type, title, body, link],
  );
  return result.insertId;
}

export async function createNotificationsForUsers(userIds, payload) {
  const ids = [...new Set(userIds.map(Number).filter(Boolean))];
  for (const userId of ids) {
    await createNotification({ userId, ...payload });
  }
}

export async function listNotifications(userId, { limit = 40, unreadOnly = false } = {}) {
  await ensureProSchema();
  const pool = getPool();
  const cap = Math.min(Math.max(Number(limit) || 40, 1), 100);
  const filter = unreadOnly ? ' AND read_at IS NULL' : '';
  const [rows] = await pool.query(
    `SELECT id, type, title, body, link, read_at, created_at
     FROM notifications
     WHERE user_id = ?${filter}
     ORDER BY created_at DESC
     LIMIT ?`,
    [userId, cap],
  );
  return rows;
}

export async function countUnreadNotifications(userId) {
  await ensureProSchema();
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND read_at IS NULL',
    [userId],
  );
  return Number(rows[0]?.c || 0);
}

export async function markNotificationRead(userId, notificationId) {
  await ensureProSchema();
  const pool = getPool();
  const [result] = await pool.query(
    'UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ? AND read_at IS NULL',
    [notificationId, userId],
  );
  return result.affectedRows > 0;
}

export async function markAllNotificationsRead(userId) {
  await ensureProSchema();
  const pool = getPool();
  await pool.query(
    'UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND read_at IS NULL',
    [userId],
  );
}
