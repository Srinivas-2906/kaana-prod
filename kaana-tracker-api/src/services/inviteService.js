import crypto from 'crypto';
import { getPool } from '../db/index.js';
import { logActivity } from './activityService.js';
import { sendProjectInviteEmail } from './emailService.js';
import {
  assertProjectAccess,
  ensureProjectOwnerMembership,
} from './authorizationService.js';

const INVITE_ROLES = ['viewer', 'contributor', 'manager'];

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function buildInviteUrl(token) {
  const base = process.env.TRACKER_PUBLIC_URL || 'https://tracker.kaana.in';
  return `${base.replace(/\/$/, '')}/invite/${token}`;
}

function mapInviteStatus(row) {
  const now = new Date();
  const expired = row.expires_at && new Date(row.expires_at) < now;
  const revoked = Boolean(row.revoked_at) || row.status === 'revoked';
  const accepted = row.status === 'accepted' || row.use_count > 0;

  if (revoked) return 'revoked';
  if (accepted) return 'accepted';
  if (expired) return 'expired';
  if (row.invitee_email) return 'pending';
  return 'active';
}

function mapInviteRow(row) {
  const status = mapInviteStatus(row);
  const expired = row.expires_at && new Date(row.expires_at) < new Date();
  const revoked = Boolean(row.revoked_at) || row.status === 'revoked';
  const accepted = status === 'accepted';

  return {
    ...row,
    url: buildInviteUrl(row.token),
    status,
    active: !revoked && !expired && !accepted
      && (row.max_uses == null || row.use_count < row.max_uses),
  };
}

export async function createInvite(projectId, role, actorId, options = {}) {
  await ensureProjectOwnerMembership(projectId, actorId);
  const access = await assertProjectAccess(projectId, actorId, 'manage');
  if (access.error) return { error: access.error };

  const inviteRole = INVITE_ROLES.includes(role) ? role : 'contributor';
  const inviteeEmail = options.email ? normalizeEmail(options.email) : null;

  if (inviteeEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteeEmail)) {
    return { error: 'Enter a valid email address' };
  }

  const pool = getPool();

  if (inviteeEmail) {
    const [members] = await pool.query(`
      SELECT u.email FROM project_members pm
      JOIN users u ON u.id = pm.user_id
      WHERE pm.project_id = ? AND LOWER(u.email) = ?
      LIMIT 1
    `, [projectId, inviteeEmail]);
    if (members[0]) return { error: 'This person is already a project member' };

    const [pending] = await pool.query(`
      SELECT id FROM project_invites
      WHERE project_id = ? AND invitee_email = ? AND status = 'pending'
        AND revoked_at IS NULL
        AND (expires_at IS NULL OR expires_at > NOW())
      LIMIT 1
    `, [projectId, inviteeEmail]);
    if (pending[0]) return { error: 'An invitation is already pending for this email' };
  }

  const expiresInDays = Number(options.expiresInDays) || 14;
  const maxUses = inviteeEmail ? 1 : (options.maxUses == null ? 1 : Number(options.maxUses));
  const token = crypto.randomBytes(24).toString('base64url');
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  const [result] = await pool.query(`
    INSERT INTO project_invites (project_id, token, role, invitee_email, status, created_by, expires_at, max_uses)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    projectId,
    token,
    inviteRole,
    inviteeEmail,
    inviteeEmail ? 'pending' : 'pending',
    actorId,
    expiresAt,
    maxUses || 1,
  ]);

  const [actorRows] = await pool.query('SELECT name FROM users WHERE id = ?', [actorId]);
  const inviterName = options.inviterName || actorRows[0]?.name || 'Someone';

  const [rows] = await pool.query(`
    SELECT i.*, c.name AS project_name
    FROM project_invites i
    JOIN clusters c ON c.id = i.project_id
    WHERE i.id = ?
  `, [result.insertId]);

  const invite = mapInviteRow(rows[0]);

  if (inviteeEmail) {
    const emailResult = await sendProjectInviteEmail({
      to: inviteeEmail,
      inviterName,
      projectName: rows[0].project_name,
      inviteUrl: invite.url,
      role: inviteRole,
    });
    if (emailResult.error) {
      await pool.query('UPDATE project_invites SET revoked_at = CURRENT_TIMESTAMP, status = ? WHERE id = ?', ['revoked', result.insertId]);
      return { error: emailResult.error };
    }
  }

  await logActivity({
    eventType: inviteeEmail ? 'invite_sent' : 'invite_created',
    entityType: 'cluster',
    entityId: projectId,
    projectId,
    actorId,
    summary: inviteeEmail
      ? `Invitation sent to ${inviteeEmail} (${inviteRole})`
      : `Invite link created (${inviteRole})`,
    payload: { invite_id: result.insertId, role: inviteRole, email: inviteeEmail },
  });

  return { invite };
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

  return { invites: rows.map(mapInviteRow) };
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

  await pool.query(
    'UPDATE project_invites SET revoked_at = CURRENT_TIMESTAMP, status = ? WHERE id = ?',
    ['revoked', inviteId],
  );

  await logActivity({
    eventType: 'invite_revoked',
    entityType: 'cluster',
    entityId: projectId,
    projectId,
    actorId,
    summary: rows[0].invitee_email
      ? `Invitation revoked for ${rows[0].invitee_email}`
      : 'Invite link revoked',
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
  if (invite.revoked_at || invite.status === 'revoked') return { error: 'This invitation was revoked' };
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return { error: 'This invitation has expired' };
  }
  if (invite.max_uses != null && invite.use_count >= invite.max_uses) {
    return { error: 'This invitation has already been accepted' };
  }

  return {
    invite: {
      project_id: invite.project_id,
      project_name: invite.project_name,
      project_color: invite.project_color,
      role: invite.role,
      created_by_name: invite.created_by_name,
      expires_at: invite.expires_at,
      invitee_email: invite.invitee_email,
    },
  };
}

export async function acceptInvite(token, userId, userEmail) {
  const preview = await getInvitePreview(token);
  if (preview.error) return { error: preview.error };

  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM project_invites WHERE token = ? LIMIT 1', [token]);
  const invite = rows[0];
  const projectId = invite.project_id;
  const role = invite.role;

  if (invite.invitee_email) {
    const expected = normalizeEmail(invite.invitee_email);
    const actual = normalizeEmail(userEmail);
    if (!actual) {
      return { error: 'Sign in with the email address this invitation was sent to.' };
    }
    if (actual !== expected) {
      return {
        error: `This invitation was sent to ${invite.invitee_email}. Sign in with that email to accept.`,
      };
    }
  }

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

  await pool.query(`
    UPDATE project_invites
    SET use_count = use_count + 1, status = 'accepted', accepted_at = CURRENT_TIMESTAMP, accepted_by = ?
    WHERE id = ?
  `, [userId, invite.id]);

  const [users] = await pool.query('SELECT name, email FROM users WHERE id = ?', [userId]);

  await logActivity({
    eventType: 'invite_accepted',
    entityType: 'cluster',
    entityId: projectId,
    projectId,
    actorId: userId,
    summary: `${users[0]?.name || 'Someone'} accepted invitation (${role})`,
    payload: { invite_id: invite.id, role, email: users[0]?.email },
  });

  return {
    projectId,
    role,
    projectUrl: `/projects/${projectId}/board`,
  };
}
