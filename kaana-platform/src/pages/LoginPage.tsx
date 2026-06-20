import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiPost, saveAuth } from '../lib/api';
import { CTA } from '../lib/onboarding';
import './auth.css';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiPost<{
        token: string;
        user: { id: string; email: string; name: string; role: string; isPlatformAdmin?: boolean };
        tenant: {
          id: string; slug: string; name: string; botName: string; plan: string; status: string;
          onboardingPending?: boolean; intakeSubmitted?: boolean;
        } | null;
      }>('/login', { email, password });
      saveAuth(data.token, data.user, data.tenant);

      if (data.user.isPlatformAdmin) {
        const dest = next && next.startsWith('/') ? next : '/admin';
        navigate(dest);
      } else if (data.tenant?.onboardingPending && !data.tenant.intakeSubmitted) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-main auth-page" id="main-content">
      <div className="container auth-layout">
        <div className="auth-copy">
          <p className="section-label">Welcome back</p>
          <h1>Log in to Kaana</h1>
          <p>Access your WhatsApp dashboard, CRM, and settings.</p>
        </div>
        <form className="form-card" onSubmit={submit}>
          <h2>Log in</h2>
          {error && <p className="error-msg">{error}</p>}
          {import.meta.env.DEV && (
            <p className="auth-dev-hint">
              Platform admin: <strong>admin@kaana.ai</strong> / <strong>kaanaadmin</strong>
            </p>
          )}
          <div className="form-field">
            <label>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-accent" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Log in'}
          </button>
          <p className="auth-switch">New here? <Link to="/signup">{CTA.primary}</Link></p>
        </form>
      </div>
    </main>
  );
}
