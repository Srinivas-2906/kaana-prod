import { getPool } from '../db/index.js';

const ROLE_RANK = { owner: 4, manager: 3, contributor: 2, viewer: 1 };

export function canView(role) {
  return Boolean(role);
}

export function canEdit(role) {
  return role === 'owner' || role === 'manager' || role === 'contributor';
}

export function canManageMembers(role) {
  return role === 'owner' || role === 'manager';
}

export function canCreateInvites(role) {
  return role === 'owner' || role === 'manager';
}

export async function getProjectRole(projectId, userId) {
  const pool = getPool();
  const uid = Number(userId);
  const pid = Number(projectId);
  const [memberRows] = await pool.query(
    'SELECT role FROM project_members WHERE project_id = ? AND user_id = ? LIMIT 1',
    [pid, uid],
  );
  if (memberRows[0]) return memberRows[0].role;

  const [creatorRows] = await pool.query(
    'SELECT created_by FROM clusters WHERE id = ? LIMIT 1',
    [pid],
  );
  if (Number(creatorRows[0]?.created_by) === uid) return 'owner';
  return null;
}

export async function assertProjectAccess(projectId, userId, level = 'view') {
  const role = await getProjectRole(Number(projectId), Number(userId));
  if (!role || !canView(role)) {
    return { error: 'You do not have access to this project', status: 403, role: null };
  }
  if (level === 'edit' && !canEdit(role)) {
    return { error: 'Read-only access for this project', status: 403, role };
  }
  if (level === 'manage' && !canManageMembers(role)) {
    return { error: 'You cannot manage members for this project', status: 403, role };
  }
  return { role };
}

export async function listAccessibleProjectIds(userId) {
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT DISTINCT c.id
    FROM clusters c
    LEFT JOIN project_members pm ON pm.project_id = c.id AND pm.user_id = ?
    WHERE pm.user_id IS NOT NULL OR c.created_by = ?
  `, [userId, userId]);
  return rows.map((r) => r.id);
}

export async function ensureProjectOwnerMembership(projectId, userId) {
  const pool = getPool();
  const role = await getProjectRole(projectId, userId);
  if (role) return role;

  await pool.query(
    'INSERT IGNORE INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
    [projectId, userId, 'owner'],
  );
  return 'owner';
}

export function roleLabel(role) {
  const labels = {
    owner: 'Owner',
    manager: 'Manager',
    contributor: 'Edit & view',
    viewer: 'View only',
  };
  return labels[role] || role;
}

export function compareRoles(a, b) {
  return (ROLE_RANK[a] || 0) - (ROLE_RANK[b] || 0);
}
