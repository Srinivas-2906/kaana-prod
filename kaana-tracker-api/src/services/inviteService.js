import crypto from 'crypto';
import { getPool } from '../db/index.js';
import { logActivity } from './activityService.js';
import {
  assertProjectAccess,
  canCreateInvites,
  ensureProjectOwnerMembership,
} from './authorizationService.js';

const INVITE_ROLES = ['viewer', 'contributor', 'manager'];

function buildInviteUrl(token) {
  const base = process.env.TRACKER_PUBLIC_URL || 'https://tracker.kaana.in';
  return `${base.replace(/\/$/, '')}/invite/${token}`;
}

export async function createInvite(projectId, role, actorId, options = {}) {
  await ensureProjectOwnerMembership(projectId, actorId);
  const access = await assertProjectAccess(projectId, actorId, 'manage');
  if (access.error) return { error: access.error };

  const inviteRole = INVITE_ROLES.includes(role) ? role : 'contributor';
  const expiresInDays = Number(options.expiresInDays) || 14;
  const maxUses = options.maxUses == null ? 1 : Number(options.maxUses);
  const token = crypto.randomBytes(24).toString('base64url');

  const pool = getPool();
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
  const [result] = await pool.query(`
    INSERT INTO project_invites (project_id, token, role, created_by, expires_at, max_uses)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [projectId, token, inviteRole, actorId, expiresAt, maxUses || 1]);

  await logActivity({
    eventType: 'invite_created',
    entityType: 'cluster',
    entityId: projectId,
    projectId,
    actorId,
    summary: `Invite link created (${inviteRole})`,
    payload: { invite_id: result.insertId, role: inviteRole },
  });

  const [rows] = await pool.query(`
    SELECT i.*, c.name AS project_name
    FROM project_invites i
    JOIN clusters c ON c.id = i.project_id
    WHERE i.id = ?
  `, [result.insertId]);

  return {
    invite: {
      ...rows[0],
      url: buildInviteUrl(token),
    },
  };
}

export async function listInvites(projectId, actorId) {
  const access = await assertProjectAccess(projectId, actorId, 'manage');
  if (access.error) return { error: access.error };

  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT i.*, u.name AS created_by_name
    FROM project_invites i
    JOIN users u ON u.id = i.created_by
    WHERE i.project_id = ?
    ORDER BY i.created_at DESC
  `, [projectId]);

  return {
    invites: rows.map((row) => ({
      ...row,
      url: buildInviteUrl(row.token),
      active: !row.revoked_at && (!row.expires_at || new Date(row.expires_at) > new Date())
        && (row.max_uses == null || row.use_count < row.max_uses),
    })),
  };
}

export async function revokeInvite(projectId, inviteId, actorId) {
  const access = await assertProjectAccess(projectId, actorId, 'manage');
  if (access.error) return { error: access.error };

  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM project_invites WHERE id = ? AND project_id = ? LIMIT 1',
    [inviteId, projectId],
  );
  if (!rows[0]) return { error: 'Invite not found' };
  if (rows[0].revoked_at) return { ok: true };

  await pool.query('UPDATE project_invites SET revoked_at = CURRENT_TIMESTAMP WHERE id = ?', [inviteId]);

  await logActivity({
    eventType: 'invite_revoked',
    entityType: 'cluster',
    entityId: projectId,
    projectId,
    actorId,
    summary: 'Invite link revoked',
    payload: { invite_id: inviteId },
  });

  return { ok: true };
}

export async function getInvitePreview(token) {
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT i.*, c.name AS project_name, c.color AS project_color, u.name AS created_by_name
    FROM project_invites i
    JOIN clusters c ON c.id = i.project_id
    JOIN users u ON u.id = i.created_by
    WHERE i.token = ?
    LIMIT 1
  `, [token]);

  const invite = rows[0];
  if (!invite) return { error: 'Invite not found' };
  if (invite.revoked_at) return { error: 'This invite link was revoked' };
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return { error: 'This invite link has expired' };
  }
  if (invite.max_uses != null && invite.use_count >= invite.max_uses) {
    return { error: 'This invite link has already been used' };
  }

  return {
    invite: {
      project_id: invite.project_id,
      project_name: invite.project_name,
      project_color: invite.project_color,
      role: invite.role,
      created_by_name: invite.created_by_name,
      expires_at: invite.expires_at,
    },
  };
}

export async function acceptInvite(token, userId) {
  const preview = await getInvitePreview(token);
  if (preview.error) return { error: preview.error };

  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM project_invites WHERE token = ? LIMIT 1', [token]);
  const invite = rows[0];
  const projectId = invite.project_id;
  const role = invite.role;

  const [existing] = await pool.query(
    'SELECT role FROM project_members WHERE project_id = ? AND user_id = ? LIMIT 1',
    [projectId, userId],
  );

  if (!existing[0]) {
    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [projectId, userId, role],
    );
  } else if (existing[0].role === 'viewer' && role !== 'viewer') {
    await pool.query(
      'UPDATE project_members SET role = ? WHERE project_id = ? AND user_id = ?',
      [role, projectId, userId],
    );
  }

  await pool.query(
    'UPDATE project_invites SET use_count = use_count + 1 WHERE id = ?',
    [invite.id],
  );

  const [users] = await pool.query('SELECT name, email FROM users WHERE id = ?', [userId]);

  await logActivity({
    eventType: 'invite_accepted',
    entityType: 'cluster',
    entityId: projectId,
    projectId,
    actorId: userId,
    summary: `${users[0]?.name || 'Someone'} joined via invite (${role})`,
    payload: { invite_id: invite.id, role, email: users[0]?.email },
  });

  return {
    projectId,
    role,
    projectUrl: `/projects/${projectId}/board`,
  };
}
