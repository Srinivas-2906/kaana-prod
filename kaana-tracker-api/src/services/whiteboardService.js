import { getPool } from '../db/index.js';
import { NOTE_COLORS } from '../constants.js';
import { ensurePlanSchema } from './schemaService.js';

export async function listWhiteboards() {
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT wb.*, u.name AS created_by_name,
      (SELECT COUNT(*) FROM whiteboard_notes n WHERE n.whiteboard_id = wb.id) AS note_count
    FROM whiteboards wb
    JOIN users u ON wb.created_by = u.id
    ORDER BY wb.updated_at DESC
  `);
  return rows;
}

export async function getWhiteboardById(id) {
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT wb.*, u.name AS created_by_name FROM whiteboards wb
    JOIN users u ON wb.created_by = u.id WHERE wb.id = ?
  `, [id]);
  return rows[0] || null;
}

export async function createWhiteboard(data, userId) {
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO whiteboards (title, description, created_by) VALUES (?, ?, ?)',
    [data.title, data.description || null, userId],
  );
  return getWhiteboardById(result.insertId);
}

export async function getNotes(whiteboardId) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT n.*, u.name AS author_name FROM whiteboard_notes n LEFT JOIN users u ON n.created_by = u.id WHERE n.whiteboard_id = ? ORDER BY n.id',
    [whiteboardId],
  );
  return rows;
}

export async function createNote(whiteboardId, data, userId) {
  const color = NOTE_COLORS.includes(data.color) ? data.color : '#fef08a';
  const pool = getPool();
  const [result] = await pool.query(`
    INSERT INTO whiteboard_notes (whiteboard_id, content, color, pos_x, pos_y, width, height, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    whiteboardId, data.content || 'New idea', color,
    data.pos_x ?? 40, data.pos_y ?? 40, data.width ?? 200, data.height ?? 140, userId,
  ]);
  await pool.query('UPDATE whiteboards SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [whiteboardId]);
  const [rows] = await pool.query('SELECT * FROM whiteboard_notes WHERE id = ?', [result.insertId]);
  return rows[0];
}

export async function updateNote(id, data) {
  await ensurePlanSchema();
  const pool = getPool();
  const [existing] = await pool.query('SELECT * FROM whiteboard_notes WHERE id = ?', [id]);
  const note = existing[0];
  if (!note) return null;

  const color = NOTE_COLORS.includes(data.color) ? data.color : note.color;
  const scheduledDate = data.scheduled_date !== undefined ? (data.scheduled_date || null) : note.scheduled_date;
  await pool.query(`
    UPDATE whiteboard_notes SET content = ?, color = ?, pos_x = ?, pos_y = ?, width = ?, height = ?, scheduled_date = ? WHERE id = ?
  `, [
    data.content ?? note.content, color,
    data.pos_x ?? note.pos_x, data.pos_y ?? note.pos_y,
    data.width ?? note.width, data.height ?? note.height,
    scheduledDate, id,
  ]);
  await pool.query('UPDATE whiteboards SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [note.whiteboard_id]);
  const [rows] = await pool.query('SELECT * FROM whiteboard_notes WHERE id = ?', [id]);
  return rows[0];
}

export async function deleteNote(id) {
  const pool = getPool();
  const [existing] = await pool.query('SELECT whiteboard_id FROM whiteboard_notes WHERE id = ?', [id]);
  if (!existing[0]) return false;
  await pool.query('DELETE FROM whiteboard_notes WHERE id = ?', [id]);
  await pool.query('UPDATE whiteboards SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [existing[0].whiteboard_id]);
  return true;
}
