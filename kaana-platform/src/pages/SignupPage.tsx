import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiPost, saveAuth, fetchPlatformConfig } from '../lib/api';
import { INDUSTRIES, DEFAULT_INDUSTRY, INDUSTRY_MAP } from '../data/industries';
import { CTA } from '../lib/onboarding';
import { getContactHref, getContactLabel } from '../lib/contact';
import { SIGNUP_TRUST_ITEMS } from '../lib/signupTrust';
import type { PlatformConfig } from '../lib/onboarding';
import './auth.css';

function resolveIndustryParam(param: string | null): string {
  if (param && param in INDUSTRY_MAP) return param;
  if (param === 'healthcare') return 'clinic';
  if (param === 'other') return 'other';
  return DEFAULT_INDUSTRY;
}

export function SignupPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [platform, setPlatform] = useState<PlatformConfig | null>(null);
  const [form, setForm] = useState({
    businessName: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    industry: resolveIndustryParam(params.get('industry')),
    plan: params.get('plan') || 'trial',
  });

  useEffect(() => {
    fetchPlatformConfig().then(setPlatform).catch(() => {});
    const ind = params.get('industry');
    if (ind) setForm((f) => ({ ...f, industry: resolveIndustryParam(ind) }));
  }, [params]);

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiPost<{
        token: string;
        user: { id: string; email: string; name: string; role: string };
        tenant: { id: string; slug: string; name: string; botName: string; plan: string; status: string };
        nextStep?: string;
        conciergeMode?: boolean;
      }>('/signup', form);
      saveAuth(data.token, data.user, data.tenant);
      navigate(data.nextStep === 'dashboard' ? '/dashboard' : '/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  const spotsLeft = platform?.conciergeSpotsRemaining;

  return (
    <main className="page-main auth-page">
      <div className="container auth-layout">
        <div className="auth-copy">
          <p className="section-label">Step 1 of 2</p>
          <h1>{CTA.primary}</h1>
          <p>{CTA.heroSub}</p>
          {platform?.conciergeMode && spotsLeft != null && (
            <p className="auth-spots">{spotsLeft} setup {spotsLeft === 1 ? 'slot' : 'slots'} left</p>
          )}
          <ul className="auth-benefits">
            <li>{CTA.trialNote}</li>
            <li>We configure replies, inbox, and lead list for you</li>
            <li>Short 3-step questionnaire — about 5 minutes</li>
            <li>Go live in 1–3 business days after review</li>
          </ul>
        </div>

        <form className="form-card" onSubmit={submit} noValidate>
          <h2>Create your account</h2>

          <ul className="signup-trust-box" aria-label="WhatsApp setup reassurance">
            {SIGNUP_TRUST_ITEMS.map((item) => (
              <li key={item}>
                <span aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>

          {error && <p className="error-msg" role="alert">{error}</p>}

          <div className="form-field">
            <label htmlFor="businessName">Business name</label>
            <input id="businessName" required value={form.businessName} onChange={set('businessName')} placeholder="e.g. Green Leaf Clinic, City Style Salon" autoComplete="organization" />
          </div>
          <div className="form-field">
            <label htmlFor="name">Your name</label>
            <input id="name" required value={form.name} onChange={set('name')} placeholder="Your full name" autoComplete="name" />
          </div>
          <div className="form-field">
            <label htmlFor="email">Work email</label>
            <input id="email" type="email" required value={form.email} onChange={set('email')} placeholder="you@yourbusiness.com" autoComplete="email" />
          </div>
          <div className="form-field">
            <label htmlFor="phone">WhatsApp number</label>
            <input id="phone" required value={form.phone} onChange={set('phone')} placeholder="+91 98400 12345" autoComplete="tel" />
          </div>
          <div className="form-field">
            <label htmlFor="industry">Business type</label>
            <select id="industry" value={form.industry} onChange={set('industry')}>
              {INDUSTRIES.map((ind) => (
                <option key={ind.id} value={ind.id}>{ind.name}</option>
              ))}
              <option value="other">Other / Custom setup</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <div className="form-field-pw">
              <input id="password" type={showPw ? 'text' : 'password'} required minLength={8} value={form.password} onChange={set('password')} placeholder="At least 8 characters" autoComplete="new-password" />
              <button type="button" className="form-pw-toggle" aria-label={showPw ? 'Hide password' : 'Show password'} onClick={() => setShowPw((v) => !v)}>{showPw ? 'Hide' : 'Show'}</button>
            </div>
          </div>

          <button type="submit" className="btn btn-accent auth-submit" disabled={loading}>
            {loading ? 'Creating account…' : CTA.signupSubmit}
          </button>

          <p className="auth-fine" style={{ marginTop: 10 }}>
            Prefer to talk first?{' '}
            {(() => {
              const href = getContactHref();
              const external = href.startsWith('http');
              return (
                <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
                  {getContactLabel()}
                </a>
              );
            })()}
          </p>

          <p className="auth-fine">
            By signing up you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.
          </p>
          <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
        </form>
      </div>
    </main>
  );
}
