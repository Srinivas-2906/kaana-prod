import { FormEvent, useEffect, useState } from 'react';
import { Copy, Mail, Trash2, UserPlus } from 'lucide-react';
import { createProjectInvite, fetchProjectInvites, revokeProjectInvite } from '../lib/api';
import type { ProjectInvite } from '../types';

const ROLE_OPTIONS = [
  { value: 'viewer', label: 'View only' },
  { value: 'contributor', label: 'View & edit' },
  { value: 'manager', label: 'View, edit & manage team' },
] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  revoked: 'Revoked',
  expired: 'Expired',
  active: 'Active link',
};

function ShareProjectContent({
  projectId,
  projectName,
  onDone,
}: {
  projectId: number;
  projectName: string;
  onDone?: () => void;
}) {
  const [invites, setInvites] = useState<ProjectInvite[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'contributor' | 'manager'>('contributor');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState('');
  const [sending, setSending] = useState(false);

  function reload() {
    fetchProjectInvites(projectId)
      .then((r) => setInvites(r.invites))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load invites'));
  }

  useEffect(() => { reload(); }, [projectId]);

  async function onSendEmail(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSending(true);
    try {
      await createProjectInvite(projectId, role, email.trim());
      const sentTo = email.trim();
      setEmail('');
      setSuccess(`Invitation sent to ${sentTo}`);
      reload();
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  }

  async function onCopyLink() {
    setError('');
    setSuccess('');
    try {
      const { invite } = await createProjectInvite(projectId, role);
      await navigator.clipboard.writeText(invite.url);
      setCopied(invite.url);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create link');
    }
  }

  async function onRevoke(inviteId: number) {
    await revokeProjectInvite(projectId, inviteId);
    reload();
  }

  return (
    <>
      <p className="muted" style={{ marginTop: 0 }}>
        Invite collaborators to <strong>{projectName}</strong> — like GitHub, they receive an email and must accept before joining.
      </p>
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      {success && <p style={{ color: '#16a34a' }}>{success}</p>}

      <form className="card" style={{ marginBottom: '1rem', padding: '1rem' }} onSubmit={onSendEmail}>
        <h4 style={{ margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Mail size={16} /> Invite by email
        </h4>
        <div className="form-row">
          <input
            type="email"
            required
            placeholder="collaborator@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ flex: 1 }}
          />
          <select value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary" disabled={sending}>
            {sending ? 'Sending…' : 'Send invite'}
          </button>
        </div>
      </form>

      <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <h4 style={{ margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Copy size={16} /> Or share a link
        </h4>
        <div className="form-row">
          <select value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button type="button" className="btn btn-ghost" onClick={onCopyLink}>Create & copy link</button>
        </div>
        {copied && <p className="muted" style={{ margin: '0.75rem 0 0' }}>Copied: {copied}</p>}
      </div>

      {invites.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 0.75rem' }}>Invitations</h4>
          {invites.map((invite) => (
            <div key={invite.id} className="member-row">
              <div>
                {invite.invitee_email ? (
                  <strong>{invite.invitee_email}</strong>
                ) : (
                  <strong>{ROLE_OPTIONS.find((r) => r.value === invite.role)?.label || invite.role} link</strong>
                )}
                <div className="muted">
                  {STATUS_LABELS[invite.status || 'active'] || invite.status}
                  {' · '}
                  {ROLE_OPTIONS.find((r) => r.value === invite.role)?.label || invite.role}
                  {invite.expires_at && invite.status === 'pending' ? ` · expires ${new Date(invite.expires_at).toLocaleDateString()}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {invite.active && !invite.invitee_email && (
                  <button type="button" className="btn btn-ghost" onClick={() => navigator.clipboard.writeText(invite.url)} title="Copy link">
                    <Copy size={16} />
                  </button>
                )}
                {invite.active && (
                  <button type="button" className="btn btn-ghost" onClick={() => onRevoke(invite.id)} title="Revoke">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export function ProjectSharePanel({
  projectId,
  projectName,
  canManage,
}: {
  projectId: number;
  projectName: string;
  canManage: boolean;
}) {
  if (!canManage) return null;

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <UserPlus size={18} /> Share project
      </h3>
      <ShareProjectContent projectId={projectId} projectName={projectName} />
    </div>
  );
}

export function ProjectShareDialog({
  projectId,
  projectName,
  open,
  onClose,
}: {
  projectId: number;
  projectName: string;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <>
      <button type="button" className="issue-backdrop" aria-label="Close" onClick={onClose} />
      <div className="share-dialog" role="dialog" aria-labelledby="share-dialog-title">
        <header className="share-dialog-head">
          <h2 id="share-dialog-title" style={{ margin: 0, fontSize: '1.125rem' }}>Share {projectName}</h2>
          <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Close">×</button>
        </header>
        <div className="share-dialog-body">
          <ShareProjectContent projectId={projectId} projectName={projectName} />
        </div>
      </div>
    </>
  );
}
