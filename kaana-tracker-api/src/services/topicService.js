import { getPool } from '../db/index.js';
import { logActivity, logFieldChange, listEntityVersions } from './activityService.js';
import { assertProjectAccess, canEdit } from './authorizationService.js';
import { sendTopicReplyEmail } from './emailService.js';
import { getReactionsForDiscussions } from './reactionService.js';

const TOPIC_STATUSES = ['open', 'answered', 'closed'];

function mapTopicRow(row) {
  return {
    id: row.id,
    project_id: row.project_id,
    title: row.title,
    status: row.status,
    work_item_id: row.work_item_id,
    work_item_title: row.work_item_title || null,
    created_by: row.created_by,
    created_by_name: row.created_by_name,
    reply_count: Number(row.reply_count || 0),
    unread_count: Number(row.unread_count || 0),
    created_at: row.created_at,
    updated_at: row.updated_at,
    title_edited_at: row.title_edited_at || null,
    last_reply_at: row.last_reply_at || row.updated_at,
  };
}

const UNREAD_COUNT_SQL = `
  (SELECT COUNT(*) FROM discussions d
   WHERE d.topic_id = t.id
     AND d.created_by != ?
     AND d.created_at > COALESCE(
       (SELECT trs.last_read_at FROM topic_read_state trs
        WHERE trs.user_id = ? AND trs.topic_id = t.id),
       '1970-01-01'
     )
  ) AS unread_count`;

async function notifyTopicReply({
  projectId, topicId, topicTitle, actorId, content,
}) {
  if (process.env.TOPIC_REPLY_EMAIL_ENABLED === 'false') return;

  const pool = getPool();
  const [projects] = await pool.query(
    'SELECT name FROM clusters WHERE id = ? LIMIT 1',
    [projectId],
  );
  const [actors] = await pool.query(
    'SELECT name, email FROM users WHERE id = ? LIMIT 1',
    [actorId],
  );
  const [participants] = await pool.query(`
    SELECT DISTINCT u.id, u.email, u.name
    FROM (
      SELECT created_by AS user_id FROM discussions WHERE topic_id = ?
      UNION
      SELECT created_by FROM discussion_topics WHERE id = ?
    ) p
    JOIN users u ON u.id = p.user_id
    WHERE u.id != ?
  `, [topicId, topicId, actorId]);

  const base = process.env.TRACKER_PUBLIC_URL || 'https://tracker.kaana.in';
  const topicUrl = `${base}/projects/${projectId}/updates?topic=${topicId}`;
  const replierName = actors[0]?.name || 'Someone';
  const projectName = projects[0]?.name || 'Project';

  for (const p of participants) {
    if (!p.email || p.email.includes('@tracker.kaana.local')) continue;
    sendTopicReplyEmail({
      to: p.email,
      replierName,
      projectName,
      topicTitle,
      topicUrl,
      excerpt: content,
    }).catch((err) => console.error('Topic reply email failed:', err?.message || err));
  }
}

export async function listTopics(projectId, actorId, status = null) {
  const access = await assertProjectAccess(projectId, actorId, 'view');
  if (access.error) return { error: access.error, status: access.status };

  const pool = getPool();
  const params = [projectId];
  let statusFilter = '';
  if (status && TOPIC_STATUSES.includes(status)) {
    statusFilter = ' AND t.status = ?';
    params.push(status);
  }

  const [rows] = await pool.query(`
    SELECT t.*,
      u.name AS created_by_name,
      w.title AS work_item_title,
      (SELECT COUNT(*) FROM discussions d WHERE d.topic_id = t.id) AS reply_count,
      (SELECT MAX(d.created_at) FROM discussions d WHERE d.topic_id = t.id) AS last_reply_at,
      ${UNREAD_COUNT_SQL}
    FROM discussion_topics t
    JOIN users u ON u.id = t.created_by
    LEFT JOIN work_items w ON w.id = t.work_item_id
    WHERE t.project_id = ?${statusFilter}
    ORDER BY COALESCE(
      (SELECT MAX(d.created_at) FROM discussions d WHERE d.topic_id = t.id),
      t.updated_at
    ) DESC
  `, [actorId, actorId, ...params]);

  return { topics: rows.map(mapTopicRow) };
}

export async function getTopic(projectId, topicId, actorId) {
  const access = await assertProjectAccess(projectId, actorId, 'view');
  if (access.error) return { error: access.error, status: access.status };

  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT t.*,
      u.name AS created_by_name,
      w.title AS work_item_title,
      (SELECT COUNT(*) FROM discussions d WHERE d.topic_id = t.id) AS reply_count,
      (SELECT MAX(d.created_at) FROM discussions d WHERE d.topic_id = t.id) AS last_reply_at,
      ${UNREAD_COUNT_SQL}
    FROM discussion_topics t
    JOIN users u ON u.id = t.created_by
    LEFT JOIN work_items w ON w.id = t.work_item_id
    WHERE t.id = ? AND t.project_id = ?
    LIMIT 1
  `, [actorId, actorId, topicId, projectId]);

  if (!rows[0]) return { error: 'Topic not found', status: 404 };

  const [replies] = await pool.query(`
    SELECT d.*, u.name AS created_by_name
    FROM discussions d
    JOIN users u ON u.id = d.created_by
    WHERE d.topic_id = ?
    ORDER BY d.created_at ASC
  `, [topicId]);

  const replyIds = replies.map((r) => r.id);
  const reactionMap = await getReactionsForDiscussions(replyIds, actorId);
  const repliesWithReactions = replies.map((r) => ({
    ...r,
    edited_at: r.edited_at || null,
    reactions: reactionMap[r.id] || [],
  }));

  return { topic: mapTopicRow(rows[0]), replies: repliesWithReactions };
}

export async function createTopic(projectId, data, actorId) {
  const access = await assertProjectAccess(projectId, actorId, 'view');
  if (access.error) return { error: access.error, status: access.status };

  const title = String(data.title || '').trim();
  const content = String(data.content || '').trim();
  if (!title) return { error: 'Title is required', status: 400 };
  if (!content) return { error: 'Message is required', status: 400 };

  const pool = getPool();
  const workItemId = data.work_item_id ? Number(data.work_item_id) : null;

  if (workItemId) {
    const [items] = await pool.query(
      'SELECT id FROM work_items WHERE id = ? AND cluster_id = ? LIMIT 1',
      [workItemId, projectId],
    );
    if (!items[0]) return { error: 'Linked story not found in this project', status: 400 };
  }

  const [result] = await pool.query(`
    INSERT INTO discussion_topics (project_id, title, status, work_item_id, created_by)
    VALUES (?, ?, 'open', ?, ?)
  `, [projectId, title, workItemId, actorId]);

  const topicId = result.insertId;

  await pool.query(`
    INSERT INTO discussions (entity_type, entity_id, topic_id, content, created_by)
    VALUES ('cluster', ?, ?, ?, ?)
  `, [projectId, topicId, content, actorId]);

  await logActivity({
    eventType: 'topic_created',
    entityType: 'topic',
    entityId: topicId,
    projectId,
    actorId,
    summary: `New topic: ${title}`,
    payload: { topic_id: topicId, title },
  });

  return getTopic(projectId, topicId, actorId);
}

export async function addTopicReply(projectId, topicId, content, actorId) {
  const access = await assertProjectAccess(projectId, actorId, 'view');
  if (access.error) return { error: access.error, status: access.status };

  const text = String(content || '').trim();
  if (!text) return { error: 'Message is required', status: 400 };

  const pool = getPool();
  const [topics] = await pool.query(
    'SELECT id, title, status, created_by FROM discussion_topics WHERE id = ? AND project_id = ? LIMIT 1',
    [topicId, projectId],
  );
  if (!topics[0]) return { error: 'Topic not found', status: 404 };

  const [result] = await pool.query(`
    INSERT INTO discussions (entity_type, entity_id, topic_id, content, created_by)
    VALUES ('cluster', ?, ?, ?, ?)
  `, [projectId, topicId, text, actorId]);

  await pool.query(
    'UPDATE discussion_topics SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [topicId],
  );

  const isTeamMember = canEdit(access.role);
  const isTopicCreator = topics[0].created_by === actorId;

  if (topics[0].status === 'answered' && !isTeamMember) {
    await pool.query(
      'UPDATE discussion_topics SET status = ? WHERE id = ?',
      ['open', topicId],
    );
  } else if (topics[0].status === 'open' && isTeamMember && !isTopicCreator) {
    await pool.query(
      'UPDATE discussion_topics SET status = ? WHERE id = ?',
      ['answered', topicId],
    );
  }

  const [rows] = await pool.query(`
    SELECT d.*, u.name AS created_by_name FROM discussions d
    JOIN users u ON u.id = d.created_by WHERE d.id = ?
  `, [result.insertId]);

  await logActivity({
    eventType: 'topic_reply_added',
    entityType: 'topic',
    entityId: topicId,
    projectId,
    actorId,
    summary: `Reply on "${topics[0].title}": ${text.slice(0, 60)}`,
    payload: { topic_id: topicId },
  });

  notifyTopicReply({
    projectId,
    topicId,
    topicTitle: topics[0].title,
    actorId,
    content: text,
  }).catch(() => {});

  return { reply: rows[0] };
}

export async function updateTopicStatus(projectId, topicId, status, actorId) {
  const access = await assertProjectAccess(projectId, actorId, 'view');
  if (access.error) return { error: access.error, status: access.status };

  if (!TOPIC_STATUSES.includes(status)) {
    return { error: 'Invalid status', status: 400 };
  }

  const pool = getPool();
  const [topics] = await pool.query(
    'SELECT id, title, status FROM discussion_topics WHERE id = ? AND project_id = ? LIMIT 1',
    [topicId, projectId],
  );
  if (!topics[0]) return { error: 'Topic not found', status: 404 };

  await pool.query(
    'UPDATE discussion_topics SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, topicId],
  );

  await logActivity({
    eventType: 'topic_status_changed',
    entityType: 'topic',
    entityId: topicId,
    projectId,
    actorId,
    summary: `Topic "${topics[0].title}" marked ${status}`,
    payload: { topic_id: topicId, status },
  });

  return getTopic(projectId, topicId, actorId);
}

function canEditContent(access, authorId, actorId) {
  return authorId === actorId || canEdit(access.role);
}

export async function updateTopicTitle(projectId, topicId, title, actorId) {
  const access = await assertProjectAccess(projectId, actorId, 'view');
  if (access.error) return { error: access.error, status: access.status };

  const nextTitle = String(title || '').trim();
  if (!nextTitle) return { error: 'Title is required', status: 400 };

  const pool = getPool();
  const [topics] = await pool.query(
    'SELECT id, title, created_by FROM discussion_topics WHERE id = ? AND project_id = ? LIMIT 1',
    [topicId, projectId],
  );
  if (!topics[0]) return { error: 'Topic not found', status: 404 };
  if (!canEditContent(access, topics[0].created_by, actorId)) {
    return { error: 'Not allowed to edit this topic', status: 403 };
  }

  const prevTitle = topics[0].title;
  if (prevTitle === nextTitle) return getTopic(projectId, topicId, actorId);

  await pool.query(
    'UPDATE discussion_topics SET title = ?, title_edited_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [nextTitle, topicId],
  );

  await logFieldChange('topic', topicId, 'title', prevTitle, nextTitle, actorId);
  await logActivity({
    eventType: 'topic_title_edited',
    entityType: 'topic',
    entityId: topicId,
    projectId,
    actorId,
    summary: `Topic title updated: "${prevTitle}" → "${nextTitle}"`,
    payload: { topic_id: topicId, previous_title: prevTitle, new_title: nextTitle },
  });

  return getTopic(projectId, topicId, actorId);
}

export async function updateDiscussionContent(projectId, topicId, discussionId, content, actorId) {
  const access = await assertProjectAccess(projectId, actorId, 'view');
  if (access.error) return { error: access.error, status: access.status };

  const nextContent = String(content || '').trim();
  if (!nextContent) return { error: 'Message is required', status: 400 };

  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT d.id, d.content, d.created_by
    FROM discussions d
    WHERE d.id = ? AND d.topic_id = ? AND d.entity_id = ?
    LIMIT 1
  `, [discussionId, topicId, projectId]);

  if (!rows[0]) return { error: 'Message not found', status: 404 };
  if (!canEditContent(access, rows[0].created_by, actorId)) {
    return { error: 'Not allowed to edit this message', status: 403 };
  }

  const prevContent = rows[0].content;
  if (prevContent === nextContent) return getTopic(projectId, topicId, actorId);

  await pool.query(
    'UPDATE discussions SET content = ?, edited_at = CURRENT_TIMESTAMP WHERE id = ?',
    [nextContent, discussionId],
  );
  await pool.query(
    'UPDATE discussion_topics SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [topicId],
  );

  await logFieldChange('discussion', discussionId, 'content', prevContent, nextContent, actorId);
  await logActivity({
    eventType: 'discussion_edited',
    entityType: 'discussion',
    entityId: discussionId,
    projectId,
    actorId,
    summary: `Message edited in topic #${topicId}`,
    payload: { topic_id: topicId, discussion_id: discussionId },
  });

  return getTopic(projectId, topicId, actorId);
}

export async function getTopicEditHistory(projectId, topicId, actorId) {
  const access = await assertProjectAccess(projectId, actorId, 'view');
  if (access.error) return { error: access.error, status: access.status };

  const pool = getPool();
  const [topics] = await pool.query(
    'SELECT id FROM discussion_topics WHERE id = ? AND project_id = ? LIMIT 1',
    [topicId, projectId],
  );
  if (!topics[0]) return { error: 'Topic not found', status: 404 };

  const [discussions] = await pool.query(
    'SELECT id FROM discussions WHERE topic_id = ?',
    [topicId],
  );
  const discussionIds = discussions.map((d) => d.id);

  const titleEdits = await listEntityVersions('topic', topicId, 50);
  const discussionEdits = [];
  for (const id of discussionIds) {
    const versions = await listEntityVersions('discussion', id, 50);
    discussionEdits.push(...versions.map((v) => ({ ...v, discussion_id: id })));
  }

  const edits = [
    ...titleEdits.map((e) => ({ ...e, target_type: 'topic_title', target_id: topicId })),
    ...discussionEdits.map((e) => ({ ...e, target_type: 'discussion', target_id: e.discussion_id })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return { edits };
}

export async function markTopicRead(projectId, topicId, actorId) {
  const access = await assertProjectAccess(projectId, actorId, 'view');
  if (access.error) return { error: access.error, status: access.status };

  const pool = getPool();
  const [topics] = await pool.query(
    'SELECT id FROM discussion_topics WHERE id = ? AND project_id = ? LIMIT 1',
    [topicId, projectId],
  );
  if (!topics[0]) return { error: 'Topic not found', status: 404 };

  const [latest] = await pool.query(
    'SELECT id FROM discussions WHERE topic_id = ? ORDER BY created_at DESC LIMIT 1',
    [topicId],
  );

  await pool.query(`
    INSERT INTO topic_read_state (user_id, topic_id, last_read_at, last_read_discussion_id)
    VALUES (?, ?, CURRENT_TIMESTAMP, ?)
    ON DUPLICATE KEY UPDATE
      last_read_at = CURRENT_TIMESTAMP,
      last_read_discussion_id = VALUES(last_read_discussion_id)
  `, [actorId, topicId, latest[0]?.id || null]);

  return { ok: true };
}

export async function getTopicUnreadSummary(projectId, actorId) {
  const access = await assertProjectAccess(projectId, actorId, 'view');
  if (access.error) return { error: access.error, status: access.status };

  const pool = getPool();
  const [unreadRows] = await pool.query(`
    SELECT COUNT(*) AS unread_messages
    FROM discussions d
    JOIN discussion_topics t ON t.id = d.topic_id
    LEFT JOIN topic_read_state trs ON trs.topic_id = t.id AND trs.user_id = ?
    WHERE t.project_id = ?
      AND d.created_by != ?
      AND d.created_at > COALESCE(trs.last_read_at, '1970-01-01')
  `, [actorId, projectId, actorId]);

  const [openRows] = await pool.query(
    'SELECT COUNT(*) AS open_count FROM discussion_topics WHERE project_id = ? AND status = ?',
    [projectId, 'open'],
  );

  const [answeredRows] = await pool.query(`
    SELECT COUNT(*) AS answered_this_week
    FROM discussion_topics
    WHERE project_id = ?
      AND status = 'answered'
      AND updated_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 7 DAY)
  `, [projectId]);

  const [activityRows] = await pool.query(`
    SELECT MAX(GREATEST(
      t.updated_at,
      COALESCE((SELECT MAX(d.created_at) FROM discussions d WHERE d.topic_id = t.id), t.created_at)
    )) AS last_activity_at
    FROM discussion_topics t
    WHERE t.project_id = ?
  `, [projectId]);

  return {
    unread_count: Number(unreadRows[0]?.unread_messages || 0),
    open_count: Number(openRows[0]?.open_count || 0),
    answered_this_week: Number(answeredRows[0]?.answered_this_week || 0),
    last_activity_at: activityRows[0]?.last_activity_at || null,
  };
}
