import { FormEvent, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSignIn, useSignUp } from '@clerk/clerk-react';
import { CLERK_AFTER_AUTH_URL } from '../lib/clerkAuth';
import { clerkRegister } from '../lib/auth';

function clerkErrorMessage(err: unknown) {
  const clerkErr = err as { errors?: Array<{ longMessage?: string; message?: string }> };
  return clerkErr.errors?.[0]?.longMessage
    || clerkErr.errors?.[0]?.message
    || (err instanceof Error ? err.message : 'Something went wrong');
}

async function signInWithPassword(
  signIn: NonNullable<ReturnType<typeof useSignIn>['signIn']>,
  setActive: (params: { session: string | null }) => Promise<void>,
  email: string,
  password: string,
) {
  await signIn.create({ identifier: email.trim() });
  const attempt = await signIn.attemptFirstFactor({ strategy: 'password', password });
  if (attempt.status !== 'complete' || !attempt.createdSessionId) {
    throw new Error('Sign-in could not be completed. Try signing in from the login page.');
  }
  await setActive({ session: attempt.createdSessionId });
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '0.5rem',
  border: '1px solid var(--border)',
  marginBottom: '1rem',
  boxSizing: 'border-box',
};

export function ClerkSignUpForm() {
  const { isLoaded, signUp } = useSignUp();
  const { isLoaded: signInLoaded, signIn, setActive } = useSignIn();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectUrl = params.get('redirect_url') || CLERK_AFTER_AUTH_URL;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onGoogle() {
    if (!isLoaded || !signUp) return;
    setError('');
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: redirectUrl,
      });
    } catch (err) {
      setError(clerkErrorMessage(err));
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signInLoaded || !signIn) return;
    setLoading(true);
    setError('');
    try {
      await clerkRegister(email.trim(), password);
      await signInWithPassword(signIn, setActive, email, password);
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      setError(clerkErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="kaana-auth-form" onSubmit={onSubmit}>
      {error && <p className="auth-form-error">{error}</p>}
      <button type="button" className="btn btn-ghost auth-oauth-btn" onClick={onGoogle} disabled={loading}>
        Continue with Google
      </button>
      <div className="auth-divider"><span>or</span></div>
      <label className="muted auth-label">Email address</label>
      <input
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        style={inputStyle}
      />
      <label className="muted auth-label">Password</label>
      <input
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ ...inputStyle, marginBottom: '1.25rem' }}
      />
      <button type="submit" className="btn btn-primary auth-submit" disabled={loading || !isLoaded || !signInLoaded}>
        {loading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}

export function ClerkSignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectUrl = params.get('redirect_url') || CLERK_AFTER_AUTH_URL;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onGoogle() {
    if (!isLoaded || !signIn) return;
    setError('');
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: redirectUrl,
      });
    } catch (err) {
      setError(clerkErrorMessage(err));
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setError('');
    try {
      await signInWithPassword(signIn, setActive, email, password);
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      setError(clerkErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="kaana-auth-form" onSubmit={onSubmit}>
      {error && <p className="auth-form-error">{error}</p>}
      <button type="button" className="btn btn-ghost auth-oauth-btn" onClick={onGoogle} disabled={loading}>
        Continue with Google
      </button>
      <div className="auth-divider"><span>or</span></div>
      <label className="muted auth-label">Email address</label>
      <input
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        style={inputStyle}
      />
      <label className="muted auth-label">Password</label>
      <input
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ ...inputStyle, marginBottom: '1.25rem' }}
      />
      <button type="submit" className="btn btn-primary auth-submit" disabled={loading || !isLoaded}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
