import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { SignIn } from '@clerk/clerk-react';
import { isClerkEnabled, legacyLogin } from '../lib/auth';
import { trackerClerkAppearance } from '../lib/clerkAppearance';

function safeRedirectUrl(input: string | null) {
  if (!input) return '/';
  // Prevent open-redirects; only allow in-app paths.
  return input.startsWith('/') ? input : '/';
}

export function LoginPage() {
  const [params] = useSearchParams();
  const redirectUrl = safeRedirectUrl(params.get('redirect_url'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isClerkEnabled()) {
    const { isLoaded, isSignedIn } = useAuth();
    if (isLoaded && isSignedIn) return <Navigate to={redirectUrl} replace />;
    return (
      <div className="login-page">
        <div className="card login-card">
          <h1 style={{ margin: '0 0 0.5rem' }}>Kaana Tracker</h1>
          <p className="muted" style={{ marginBottom: '1.5rem' }}>Sign in to your workspace</p>
          <SignIn
            routing="path"
            path="/login"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/"
            appearance={trackerClerkAppearance}
          />
        </div>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await legacyLogin(email, password);
      window.location.href = redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={onSubmit}>
        <h1 style={{ margin: '0 0 0.5rem' }}>Kaana Tracker</h1>
        <p className="muted" style={{ marginBottom: '1.5rem' }}>Sign in to your workspace</p>
        {error && <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>}
        <label className="muted" style={{ display: 'block', marginBottom: '0.375rem' }}>Email or username</label>
        <input
          type="text"
          name="username"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="kaana or you@company.com"
          style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', marginBottom: '1rem' }}
        />
        <label className="muted" style={{ display: 'block', marginBottom: '0.375rem' }}>Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', marginBottom: '1.25rem' }}
        />
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
