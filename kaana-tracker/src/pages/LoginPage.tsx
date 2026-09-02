import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { GoogleSignInSection } from '../components/GoogleSignInSection';
import { PublicShell } from '../components/PublicShell';
import { authUrlWithRedirect, isAuthenticated, login, safeRedirectUrl } from '../lib/auth';

export function LoginPage() {
  const [params] = useSearchParams();
  const redirectUrl = safeRedirectUrl(params.get('redirect_url'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated()) return <Navigate to={redirectUrl} replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      window.location.href = redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  const signUpUrl = authUrlWithRedirect('/sign-up', redirectUrl);

  return (
    <PublicShell minimal>
      <div className="auth-page">
        <form className="card login-card" onSubmit={onSubmit}>
          <p className="auth-back-link">
            <Link to="/">← Back to home</Link>
          </p>
          <h1 style={{ margin: '0 0 0.5rem' }}>Sign in</h1>
          <p className="muted" style={{ marginBottom: '1.5rem' }}>Welcome back to Kaana Tracker</p>
          {error && <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>}
          <label className="muted" style={{ display: 'block', marginBottom: '0.375rem' }}>Email</label>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', marginBottom: '1rem' }}
          />
          <label className="muted" style={{ display: 'block', marginBottom: '0.375rem' }}>Password</label>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', marginBottom: '1.25rem' }}
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <GoogleSignInSection redirectUrl={redirectUrl} onError={setError} disabled={loading} />
          <p className="auth-mode-switch muted">
            Don&apos;t have an account?{' '}
            <Link to={signUpUrl}>Sign up</Link>
          </p>
        </form>
      </div>
    </PublicShell>
  );
}
