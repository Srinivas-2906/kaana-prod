import { getPool } from '../db/index.js';
import { assertProjectAccess } from './authorizationService.js';
import { logActivity } from './activityService.js';

export const VIBE_PRESETS = [
  { emoji: '🔥', message: 'On fire — cooking something good' },
  { emoji: '🚀', message: 'Launch mode activated' },
  { emoji: '🧘', message: 'Chill vibes, steady progress' },
  { emoji: '😅', message: 'Mild chaos but we got this' },
  { emoji: '☕', message: 'Coffee break energy' },
  { emoji: '🎉', message: 'Something just shipped!' },
  { emoji: '👀', message: 'Eyes on — review time' },
  { emoji: '💤', message: 'Quiet week, building in the background' },
];

export async function updateProjectVibe(projectId, data, actorId) {
  const access = await assertProjectAccess(projectId, actorId, 'view');
  if (access.error) return { error: access.error, status: access.status };

  const emoji = String(data.emoji || '').trim();
  const message = String(data.message || '').trim().slice(0, 120);
  if (!emoji) return { error: 'Pick a vibe emoji', status: 400 };

  const pool = getPool();
  await pool.query(
    'UPDATE clusters SET vibe_emoji = ?, vibe_message = ? WHERE id = ?',
    [emoji, message || null, projectId],
  );

  const [users] = await pool.query('SELECT name FROM users WHERE id = ?', [actorId]);
  await logActivity({
    eventType: 'vibe_changed',
    entityType: 'cluster',
    entityId: projectId,
    projectId,
    actorId,
    summary: `${users[0]?.name || 'Someone'} set the vibe to ${emoji}${message ? `: ${message}` : ''}`,
    payload: { emoji, message },
  });

  const [rows] = await pool.query(
    'SELECT vibe_emoji, vibe_message FROM clusters WHERE id = ? LIMIT 1',
    [projectId],
  );
  return { vibe: rows[0] };
}

export async function pokeTeam(projectId, actorId) {
  const access = await assertProjectAccess(projectId, actorId, 'view');
  if (access.error) return { error: access.error, status: access.status };

  const pool = getPool();
  const [recent] = await pool.query(`
    SELECT id FROM activity_events
    WHERE project_id = ? AND actor_id = ? AND event_type = 'team_poked'
      AND created_at > DATE_SUB(NOW(), INTERVAL 30 MINUTE)
    LIMIT 1
  `, [projectId, actorId]);
  if (recent[0]) {
    return { error: 'Please wait about 30 minutes before notifying the team again.', status: 429 };
  }

  const [users] = await pool.query('SELECT name FROM users WHERE id = ?', [actorId]);
  const [projects] = await pool.query('SELECT name FROM clusters WHERE id = ?', [projectId]);

  await logActivity({
    eventType: 'team_poked',
    entityType: 'cluster',
    entityId: projectId,
    projectId,
    actorId,
    summary: `${users[0]?.name || 'Someone'} poked the team on ${projects[0]?.name || 'the project'} 🫵`,
    payload: { poke: true },
  });

  return { ok: true, message: 'Team notified — someone will follow up soon.' };
}
