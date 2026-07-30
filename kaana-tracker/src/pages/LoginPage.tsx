import { useState } from 'react';
import { login } from '../lib/auth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      window.location.href = '/';
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
        <label className="muted" style={{ display: 'block', marginBottom: '0.375rem' }}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
