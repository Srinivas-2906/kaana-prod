import { getPool } from '../db/index.js';
import { logActivity } from './activityService.js';

export async function listJournalEntries(filters = {}) {
  const pool = getPool();
  const where = [];
  const params = [];

  if (filters.date) {
    where.push('j.entry_date = ?');
    params.push(filters.date);
  }
  if (filters.projectId) {
    where.push('(j.project_id = ? OR j.project_id IS NULL)');
    params.push(filters.projectId);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await pool.query(`
    SELECT j.*, u.name AS author_name, c.name AS project_name
    FROM journal_entries j
    JOIN users u ON j.author_id = u.id
    LEFT JOIN clusters c ON j.project_id = c.id
    ${whereClause}
    ORDER BY j.entry_date DESC, j.created_at DESC
    LIMIT 100
  `, params);
  return rows;
}

export async function createJournalEntry(data, authorId) {
  const content = String(data.content || '').trim();
  if (!content) return { error: 'Content required' };
  if (!data.entry_date) return { error: 'Date required' };

  const pool = getPool();
  const [result] = await pool.query(`
    INSERT INTO journal_entries (entry_date, project_id, author_id, content, blockers, learnings, next_steps)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    data.entry_date,
    data.project_id || null,
    authorId,
    content,
    data.blockers || null,
    data.learnings || null,
    data.next_steps || null,
  ]);

  await logActivity({
    eventType: 'journal_added',
    entityType: 'journal',
    entityId: result.insertId,
    projectId: data.project_id || null,
    actorId: authorId,
    summary: `Journal entry for ${data.entry_date}`,
    payload: { entry_date: data.entry_date },
  });

  const [rows] = await pool.query(`
    SELECT j.*, u.name AS author_name, c.name AS project_name
    FROM journal_entries j
    JOIN users u ON j.author_id = u.id
    LEFT JOIN clusters c ON j.project_id = c.id
    WHERE j.id = ?
  `, [result.insertId]);
  return { entry: rows[0] };
}

export async function updateJournalEntry(id, data, authorId) {
  const pool = getPool();
  const [existing] = await pool.query('SELECT * FROM journal_entries WHERE id = ?', [id]);
  if (!existing[0]) return { error: 'Not found' };
  if (existing[0].author_id !== authorId) return { error: 'Not authorized' };

  await pool.query(`
    UPDATE journal_entries
    SET content = ?, blockers = ?, learnings = ?, next_steps = ?
    WHERE id = ?
  `, [
    data.content ?? existing[0].content,
    data.blockers ?? existing[0].blockers,
    data.learnings ?? existing[0].learnings,
    data.next_steps ?? existing[0].next_steps,
    id,
  ]);

  const [rows] = await pool.query(`
    SELECT j.*, u.name AS author_name, c.name AS project_name
    FROM journal_entries j JOIN users u ON j.author_id = u.id
    LEFT JOIN clusters c ON j.project_id = c.id WHERE j.id = ?
  `, [id]);
  return { entry: rows[0] };
}

export async function deleteJournalEntry(id, authorId) {
  const pool = getPool();
  const [existing] = await pool.query('SELECT author_id FROM journal_entries WHERE id = ?', [id]);
  if (!existing[0]) return { error: 'Not found' };
  if (existing[0].author_id !== authorId) return { error: 'Not authorized' };
  await pool.query('DELETE FROM journal_entries WHERE id = ?', [id]);
  return { ok: true };
}
