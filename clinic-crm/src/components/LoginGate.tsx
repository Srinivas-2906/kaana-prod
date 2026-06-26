import { useState, useEffect } from 'react';
import { Info, LogIn, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { isAuthenticated, requestSSOFromPlatform, loginWithCredentials, saveToken } from '../lib/auth';

const DEMO_EMAIL = 'demo@dentacare.in';
const DEMO_PASSWORD = 'demo1234';

export function LoginGate({ children }: { children: React.ReactNode }) {
  const [email,   setEmail]   = useState(DEMO_EMAIL);
  const [password,setPassword]= useState(DEMO_PASSWORD);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated() && window.opener) requestSSOFromPlatform();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const token = await loginWithCredentials(email, password);
      saveToken(token);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wrong email or password.');
    } finally { setLoading(false); }
  }

  if (!isAuthenticated()) {
    return (
      <div className="login-screen">
        <div className="login-card">

          {/* Hero */}
          <div className="login-hero">
            <div className="login-clinic-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 3c-1.2 0-2.4.6-3 1.5C8.4 5.4 8 7 8 8.5c0 1.5.4 3 .8 4.5.4 1.5.5 3 .5 4 0 1 .4 2 1.2 2s1.2-1.3 1.5-3c.3 1.7.7 3 1.5 3s1.2-1 1.2-2c0-1 .1-2.5.5-4 .4-1.5.8-3 .8-4.5 0-1.5-.4-3.1-1-4C15.4 3.6 13.2 3 12 3z"/></svg>
              Denta Care Dental Clinic
            </div>
            <h1 className="login-hero-dr-name">Dr. D. Ajit</h1>
            <p className="login-hero-qual">
              BDS · MDS · 18 years experience
            </p>
            <div className="login-meta-list">
              <div className="login-meta-row">
                <span className="login-meta-ico"><MapPin size={12} /></span>
                Muralinagar, Visakhapatnam
              </div>
              <div className="login-meta-row">
                <span className="login-meta-ico"><Clock size={12} /></span>
                Mon–Sat · 10 AM – 1 PM · 5 PM – 9 PM
              </div>
              <div className="login-meta-row">
                <span className="login-meta-ico"><ShieldCheck size={12} /></span>
                Consultation ₹100
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="login-form-area">
            <div className="login-demo-hint">
              <Info size={15} color="var(--brand)" style={{ flexShrink: 0, marginTop: 1 }} />
              <div className="login-demo-hint-text">
                <strong>Demo login (already filled)</strong>
                {DEMO_EMAIL} · password: {DEMO_PASSWORD}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="lEmail" className="login-label">Email</label>
                <input
                  id="lEmail"
                  type="email"
                  className="login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div className="login-field">
                <label htmlFor="lPass" className="login-label">Password</label>
                <input
                  id="lPass"
                  type="password"
                  className="login-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && <div className="login-error">{error}</div>}

              <button type="submit" className="login-submit" disabled={loading}>
                {loading
                  ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity=".25"/><path d="M12 3a9 9 0 019 9" strokeLinecap="round"/></svg> Signing in…</>
                  : <><LogIn size={15} /> Sign in</>
                }
              </button>
            </form>
          </div>

        </div>
      </div>
    );
  }

  return <>{children}</>;
}
