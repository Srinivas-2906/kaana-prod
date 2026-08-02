import { getPool } from '../db/index.js';
import { logActivity } from './activityService.js';

export async function listMembers(projectId) {
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT pm.*, u.name, u.email
    FROM project_members pm
    JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = ?
    ORDER BY FIELD(pm.role, 'owner', 'manager', 'contributor', 'viewer'), u.name
  `, [projectId]);

  const [project] = await pool.query(`
    SELECT c.*, u.name AS created_by_name FROM clusters c
    JOIN users u ON c.created_by = u.id WHERE c.id = ?
  `, [projectId]);

  return { members: rows, creator: project[0] || null };
}

export async function addMember(projectId, userId, role, actorId) {
  const validRoles = ['owner', 'manager', 'contributor', 'viewer'];
  if (!validRoles.includes(role)) return { error: 'Invalid role' };

  const pool = getPool();
  const [users] = await pool.query('SELECT id, name FROM users WHERE id = ?', [userId]);
  if (!users[0]) return { error: 'User not found' };

  try {
    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [projectId, userId, role],
    );
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return { error: 'User already a member' };
    throw e;
  }

  await logActivity({
    eventType: 'member_added',
    entityType: 'cluster',
    entityId: projectId,
    projectId,
    actorId,
    summary: `${users[0].name} added as ${role}`,
    payload: { user_id: userId, role },
  });

  const [rows] = await pool.query(`
    SELECT pm.*, u.name, u.email FROM project_members pm
    JOIN users u ON pm.user_id = u.id WHERE pm.project_id = ? AND pm.user_id = ?
  `, [projectId, userId]);
  return { member: rows[0] };
}

export async function removeMember(projectId, userId, actorId) {
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT pm.*, u.name FROM project_members pm JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = ? AND pm.user_id = ?
  `, [projectId, userId]);
  if (!rows[0]) return { error: 'Not found' };
  if (rows[0].role === 'owner') return { error: 'Cannot remove owner' };

  await pool.query('DELETE FROM project_members WHERE project_id = ? AND user_id = ?', [projectId, userId]);

  await logActivity({
    eventType: 'member_removed',
    entityType: 'cluster',
    entityId: projectId,
    projectId,
    actorId,
    summary: `${rows[0].name} removed from project`,
    payload: { user_id: userId },
  });

  return { ok: true };
}

export async function listUsers() {
  const pool = getPool();
  const [rows] = await pool.query('SELECT id, name, email FROM users ORDER BY name');
  return rows;
}
