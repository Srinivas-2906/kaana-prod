import { getPool } from '../db/index.js';
import { assertProjectAccess } from './authorizationService.js';

const ALLOWED_EMOJI = ['👍', '👀', '✅', '💡'];

export function isAllowedEmoji(emoji) {
  return ALLOWED_EMOJI.includes(emoji);
}

export async function getReactionsForDiscussions(discussionIds, actorId) {
  if (!discussionIds.length) return {};
  const pool = getPool();
  const placeholders = discussionIds.map(() => '?').join(',');
  const [rows] = await pool.query(`
    SELECT discussion_id, emoji, user_id, u.name AS user_name
    FROM discussion_reactions dr
    JOIN users u ON u.id = dr.user_id
    WHERE discussion_id IN (${placeholders})
    ORDER BY dr.created_at ASC
  `, discussionIds);

  const map = {};
  for (const row of rows) {
    if (!map[row.discussion_id]) map[row.discussion_id] = [];
    map[row.discussion_id].push({
      emoji: row.emoji,
      user_id: row.user_id,
      user_name: row.user_name,
    });
  }

  const result = {};
  for (const id of discussionIds) {
    const list = map[id] || [];
    const grouped = {};
    for (const r of list) {
      if (!grouped[r.emoji]) {
        grouped[r.emoji] = { emoji: r.emoji, count: 0, users: [], mine: false };
      }
      grouped[r.emoji].count += 1;
      grouped[r.emoji].users.push(r.user_name);
      if (r.user_id === actorId) grouped[r.emoji].mine = true;
    }
    result[id] = Object.values(grouped);
  }
  return result;
}

export async function toggleReaction(discussionId, actorId, emoji) {
  if (!isAllowedEmoji(emoji)) {
    return { error: 'Nice try — pick one of the emoji reactions', status: 400 };
  }

  const pool = getPool();
  const [discussions] = await pool.query(`
    SELECT d.id, d.topic_id, d.entity_type, d.entity_id
    FROM discussions d WHERE d.id = ? LIMIT 1
  `, [discussionId]);
  if (!discussions[0]) return { error: 'Message not found', status: 404 };

  const d = discussions[0];
  let projectId = null;
  if (d.topic_id) {
    const [topics] = await pool.query(
      'SELECT project_id FROM discussion_topics WHERE id = ? LIMIT 1',
      [d.topic_id],
    );
    projectId = topics[0]?.project_id;
  } else if (d.entity_type === 'cluster') {
    projectId = d.entity_id;
  } else if (d.entity_type === 'work_item') {
    const [items] = await pool.query(
      'SELECT cluster_id FROM work_items WHERE id = ? LIMIT 1',
      [d.entity_id],
    );
    projectId = items[0]?.cluster_id;
  }

  if (!projectId) return { error: 'Cannot react to this message', status: 403 };
  const access = await assertProjectAccess(projectId, actorId, 'view');
  if (access.error) return { error: access.error, status: access.status };

  const [existing] = await pool.query(
    'SELECT id FROM discussion_reactions WHERE discussion_id = ? AND user_id = ? AND emoji = ? LIMIT 1',
    [discussionId, actorId, emoji],
  );

  if (existing[0]) {
    await pool.query('DELETE FROM discussion_reactions WHERE id = ?', [existing[0].id]);
    return { toggled: 'off', emoji };
  }

  await pool.query(
    'INSERT INTO discussion_reactions (discussion_id, user_id, emoji) VALUES (?, ?, ?)',
    [discussionId, actorId, emoji],
  );
  return { toggled: 'on', emoji };
}

export { ALLOWED_EMOJI };
