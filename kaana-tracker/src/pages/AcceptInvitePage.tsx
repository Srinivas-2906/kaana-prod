import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { CLERK_SIGN_UP_URL } from '../lib/clerkAuth';
import { acceptProjectInvite, fetchInvitePreview } from '../lib/api';
import { isClerkEnabled, isLegacyAuthenticated } from '../lib/auth';
import type { InvitePreview } from '../types';

const ROLE_LABELS: Record<string, string> = {
  viewer: 'View only',
  contributor: 'View & edit',
  manager: 'View, edit & manage team',
};

function InviteCard({
  preview,
  error,
  signedIn,
  accepting,
  onAccept,
  token,
}: {
  preview: InvitePreview;
  error: string;
  signedIn: boolean;
  accepting: boolean;
  onAccept: () => void;
  token: string;
}) {
  const loginHref = `/login?redirect_url=${encodeURIComponent(`/invite/${token}`)}`;
  const signUpHref = `${CLERK_SIGN_UP_URL}?redirect_url=${encodeURIComponent(`/invite/${token}`)}`;

  return (
    <div className="login-page">
      <div className="card login-card">
        <h1 style={{ marginTop: 0 }}>Join project</h1>
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
            <p className="muted">Sign in to accept this invite and access the project.</p>
            <Link to={loginHref} className="btn btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
              Sign in to accept
            </Link>
            <p className="auth-mode-switch muted">
              New to Kaana Tracker?{' '}
              <Link to={signUpHref}>Create an account</Link>
            </p>
          </>
        ) : (
          <button type="button" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={accepting} onClick={onAccept}>
            {accepting ? 'Joining…' : 'Accept invite'}
          </button>
        )}
      </div>
    </div>
  );
}

function useInviteFlow(signedIn: boolean, authReady: boolean) {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [autoTried, setAutoTried] = useState(false);

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

  // Auto-accept after sign-in so invite links land straight in the project.
  useEffect(() => {
    if (!signedIn || !authReady) return;
    if (!token || !preview) return;
    if (accepting || autoTried) return;
    setAutoTried(true);
    onAccept();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn, authReady, token, preview, accepting, autoTried]);

  if (!authReady || loading) {
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
    <InviteCard
      preview={preview}
      error={error}
      signedIn={signedIn}
      accepting={accepting}
      onAccept={onAccept}
      token={token}
    />
  );
}

function AcceptInviteClerk() {
  const { isLoaded, isSignedIn } = useAuth();
  return useInviteFlow(Boolean(isSignedIn), isLoaded);
}

function AcceptInviteLegacy() {
  return useInviteFlow(isLegacyAuthenticated(), true);
}

export function AcceptInvitePage() {
  return isClerkEnabled() ? <AcceptInviteClerk /> : <AcceptInviteLegacy />;
}
