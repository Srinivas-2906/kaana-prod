import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { acceptProjectInvite, fetchInvitePreview } from '../lib/api';
import { authUrlWithRedirect, isAuthenticated } from '../lib/auth';
import type { InvitePreview } from '../types';

const ROLE_LABELS: Record<string, string> = {
  viewer: 'View only',
  contributor: 'View & edit',
  manager: 'View, edit & manage team',
};

export function AcceptInvitePage() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const signedIn = isAuthenticated();
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [autoTried, setAutoTried] = useState(false);

  const loginHref = authUrlWithRedirect('/login', `/invite/${token}`);
  const signUpHref = authUrlWithRedirect('/sign-up', `/invite/${token}`);

  useEffect(() => {
    if (!token) return;
    fetchInvitePreview(token)
      .then((r) => setPreview(r.invite))
      .catch((e) => setError(e instanceof Error ? e.message : 'Invalid invite'))
      .finally(() => setLoading(false));
  }, [token]);

  async function onAccept() {
    if (!token) return;
    setAccepting(true);
    setError('');
    try {
      const result = await acceptProjectInvite(token);
      navigate(result.projectUrl, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not accept invite');
      setAccepting(false);
    }
  }

  useEffect(() => {
    if (!signedIn || !token || !preview) return;
    if (accepting || autoTried) return;
    setAutoTried(true);
    onAccept();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn, token, preview, accepting, autoTried]);

  if (loading) {
    return (
      <div className="login-page">
        <p className="muted">Loading invite…</p>
      </div>
    );
  }

  if (error && !preview) {
    return (
      <div className="login-page">
        <div className="card login-card">
          <h1 style={{ marginTop: 0 }}>Invite unavailable</h1>
          <p style={{ color: '#dc2626' }}>{error}</p>
          <Link to="/" className="btn btn-primary">Go to Tracker</Link>
        </div>
      </div>
    );
  }

  if (!preview) return null;

  return (
    <div className="login-page">
      <div className="card login-card">
        <h1 style={{ marginTop: 0 }}>{preview.already_accepted ? 'Open project' : 'Join project'}</h1>
        <p>
          <strong style={{ color: preview.project_color }}>{preview.project_name}</strong>
        </p>
        <p className="muted">
          Invited by {preview.created_by_name} · {ROLE_LABELS[preview.role] || preview.role}
        </p>
        {preview.invitee_email && (
          <p className="muted">Sent to {preview.invitee_email}</p>
        )}
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}

        {!signedIn ? (
          <>
            <p className="muted">
              {preview.already_accepted
                ? 'Sign in to open this project.'
                : 'Sign in to accept this invite and access the project.'}
            </p>
            <Link to={loginHref} className="btn btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
              {preview.already_accepted ? 'Sign in to open project' : 'Sign in to accept'}
            </Link>
            <p className="auth-mode-switch muted">
              New to Kaana Tracker?{' '}
              <Link to={signUpHref}>Create an account</Link>
            </p>
          </>
        ) : (
          <button type="button" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={accepting} onClick={onAccept}>
            {accepting ? 'Opening…' : preview.already_accepted ? 'Open project' : 'Accept invite'}
          </button>
        )}
      </div>
    </div>
  );
}
