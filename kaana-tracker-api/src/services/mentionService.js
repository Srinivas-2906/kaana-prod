import { getPool } from '../db/index.js';
import { createNotification } from './notificationService.js';

const EMAIL_MENTION_RE = /@([a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

export function extractMentionEmails(text) {
  const emails = new Set();
  let match;
  const re = new RegExp(EMAIL_MENTION_RE.source, 'g');
  while ((match = re.exec(String(text || ''))) !== null) {
    emails.add(match[1].toLowerCase());
  }
  return [...emails];
}

export async function notifyMentions({ content, actorId, link, title, excludeUserIds = [] }) {
  const emails = extractMentionEmails(content);
  if (!emails.length) return;

  const pool = getPool();
  const placeholders = emails.map(() => '?').join(',');
  const [users] = await pool.query(
    `SELECT id, email, name FROM users WHERE LOWER(email) IN (${placeholders})`,
    emails,
  );

  const excluded = new Set(excludeUserIds.map(Number));
  for (const user of users) {
    if (excluded.has(user.id) || user.id === actorId) continue;
    await createNotification({
      userId: user.id,
      type: 'mention',
      title: title || 'You were mentioned',
      body: content.slice(0, 120),
      link,
    });
  }
}

export async function notifyAssigneeChange({ workItem, previousOwnerId, actorId, actorName }) {
  const newOwnerId = Number(workItem.owner_id);
  if (!newOwnerId || newOwnerId === Number(previousOwnerId) || newOwnerId === actorId) return;

  await createNotification({
    userId: newOwnerId,
    type: 'assignment',
    title: `${actorName || 'Someone'} assigned you`,
    body: workItem.title,
    link: `/work/${workItem.id}`,
  });
}

export async function notifyStatusChange({ workItem, actorId, actorName, watchers = [] }) {
  if (!workItem.owner_id || Number(workItem.owner_id) === actorId) return;
  await createNotification({
    userId: workItem.owner_id,
    type: 'status_change',
    title: `${actorName || 'Someone'} moved “${workItem.title}”`,
    body: `Status: ${workItem.status}`,
    link: `/work/${workItem.id}`,
  });
}
