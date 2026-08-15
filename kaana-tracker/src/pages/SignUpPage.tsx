import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { GoogleSignInSection } from '../components/GoogleSignInSection';
import { authUrlWithRedirect, isAuthenticated, register, safeRedirectUrl } from '../lib/auth';

export function SignUpPage() {
  const [params] = useSearchParams();
  const redirectUrl = safeRedirectUrl(params.get('redirect_url'));
  const [name, setName] = useState('');
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
      await register(email, password, name.trim() || undefined);
      window.location.href = redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  const loginUrl = authUrlWithRedirect('/login', redirectUrl);

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={onSubmit}>
        <h1 style={{ margin: '0 0 0.5rem' }}>Create account</h1>
        <p className="muted" style={{ marginBottom: '1.5rem' }}>Sign up for Kaana Tracker</p>
        {error && <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>}
        <label className="muted" style={{ display: 'block', marginBottom: '0.375rem' }}>Name</label>
        <input
          type="text"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', marginBottom: '1rem' }}
        />
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
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', marginBottom: '1.25rem' }}
        />
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
        <GoogleSignInSection redirectUrl={redirectUrl} onError={setError} disabled={loading} />
        <p className="auth-mode-switch muted">
          Already have an account?{' '}
          <Link to={loginUrl}>Sign in</Link>
        </p>
      </form>
    </div>
  );
}
