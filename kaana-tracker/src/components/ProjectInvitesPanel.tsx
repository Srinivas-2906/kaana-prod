import { FormEvent, useEffect, useState } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { createProjectInvite, fetchProjectInvites, revokeProjectInvite } from '../lib/api';
import type { ProjectInvite } from '../types';

const ROLE_OPTIONS = [
  { value: 'viewer', label: 'View only' },
  { value: 'contributor', label: 'View & edit' },
  { value: 'manager', label: 'View, edit & manage team' },
] as const;

export function ProjectInvitesPanel({ projectId, canManage }: { projectId: number; canManage: boolean }) {
  const [invites, setInvites] = useState<ProjectInvite[]>([]);
  const [role, setRole] = useState<'viewer' | 'contributor' | 'manager'>('contributor');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  function reload() {
    fetchProjectInvites(projectId)
      .then((r) => setInvites(r.invites))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load invites'));
  }

  useEffect(() => { if (canManage) reload(); }, [projectId, canManage]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const { invite } = await createProjectInvite(projectId, role);
      await navigator.clipboard.writeText(invite.url);
      setCopied(invite.url);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invite');
    }
  }

  async function onRevoke(inviteId: number) {
    await revokeProjectInvite(projectId, inviteId);
    reload();
  }

  if (!canManage) return null;

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <h3 style={{ marginTop: 0 }}>Invite link</h3>
      <p className="muted" style={{ marginBottom: '1rem' }}>
        Share a link so someone can sign in and join this project with a specific role. All actions are tracked in the activity timeline.
      </p>
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      <form className="form-row" onSubmit={onCreate}>
        <select value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary">Create & copy link</button>
      </form>
      {copied && <p className="muted" style={{ marginTop: '0.75rem' }}>Copied: {copied}</p>}

      {invites.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          {invites.map((invite) => (
            <div key={invite.id} className="member-row">
              <div>
                <strong>{ROLE_OPTIONS.find((r) => r.value === invite.role)?.label || invite.role}</strong>
                <div className="muted">
                  {invite.active ? 'Active' : 'Inactive'}
                  {invite.expires_at ? ` · expires ${new Date(invite.expires_at).toLocaleDateString()}` : ''}
                  {invite.use_count ? ` · used ${invite.use_count}x` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {invite.active && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => navigator.clipboard.writeText(invite.url)}
                    title="Copy link"
                  >
                    <Copy size={16} />
                  </button>
                )}
                {invite.active && (
                  <button type="button" className="btn btn-ghost" onClick={() => onRevoke(invite.id)}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
