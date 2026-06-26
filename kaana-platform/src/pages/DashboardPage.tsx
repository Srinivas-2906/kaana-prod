import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getToken, clearAuth, BOTIQ, CRM, API,
  fetchAnalytics, connectWhatsApp, checkoutPlan, type Analytics, type Tenant,
} from '../lib/api';
import { openAppWithSSO } from '../lib/sso';
import { getContactHref, getContactLabel } from '../lib/contact';
import { SetupStatus } from '../components/SetupStatus';
import { SetupWalkthroughLink } from '../components/SetupWalkthroughLink';
import type { PlatformConfig } from '../lib/onboarding';
import './dashboard.css';
import './onboarding.css';

const LISTINGS = import.meta.env.VITE_LISTINGS_URL || 'http://localhost:3002/listings';

type Profile = {
  user: { name: string; email: string; isPlatformAdmin?: boolean };
  tenant: Tenant | null;
  platform?: PlatformConfig;
};

export function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [waForm, setWaForm] = useState({ phoneNumberId: '', accessToken: '', whatsappNumber: '' });
  const [waSaving, setWaSaving] = useState(false);
  const [waMsg, setWaMsg] = useState('');
  const [billingPlan, setBillingPlan] = useState('');
  const [billingMsg, setBillingMsg] = useState('');

  const pending = profile?.tenant?.onboardingPending;
  const live = profile?.tenant?.isLive;

  useEffect(() => {
    const token = getToken();
    if (!token) { navigate('/login'); return; }
    fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data: Profile) => {
        setProfile(data);
        if (data.tenant?.onboardingPending && !data.tenant.intakeSubmitted) {
          navigate('/onboarding');
        } else if (data.tenant?.isLive) {
          fetchAnalytics().then(setAnalytics).catch(() => {});
        }
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  async function saveWhatsApp(e: React.FormEvent) {
    e.preventDefault();
    setWaSaving(true);
    setWaMsg('');
    try {
      const updated = await connectWhatsApp(waForm);
      setProfile((p) => p ? { ...p, tenant: updated as Tenant } : p);
      setWaMsg('WhatsApp connected successfully.');
    } catch (err) {
      setWaMsg(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setWaSaving(false);
    }
  }

  async function upgrade(plan: string) {
    setBillingPlan(plan);
    setBillingMsg('');
    try {
      const result = await checkoutPlan(plan);
      setBillingMsg('demo' in result && result.demo ? 'Plan activated (demo billing mode).' : 'Payment successful — plan upgraded!');
      const token = getToken();
      if (token) {
        const p = await fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
        setProfile(p);
      }
    } catch (err) {
      setBillingMsg(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setBillingPlan('');
    }
  }

  if (!profile) return <main className="page-main" id="main-content"><div className="container">Loading…</div></main>;

  const slug = profile.tenant?.slug;
  const locked = !!pending;
  const concierge = profile.platform?.conciergeMode ?? true;
  const isClinic = profile.tenant?.industry === 'clinic';

  return (
    <main className="page-main dash-page" id="main-content">
      <div className="container">
        <div className="dash-header">
          <div>
            <p className="section-label">Workspace</p>
            <h1>{profile.tenant?.name ?? profile.user.name}</h1>
            <p className="dash-plan">
              {locked ? (
                <>Status: <strong>Setup in progress</strong></>
              ) : profile.tenant?.trialStarted && profile.tenant.trialDaysLeft != null ? (
                <>Plan: <strong>{profile.tenant.plan ?? 'trial'}</strong> · {profile.tenant.trialDaysLeft} day{profile.tenant.trialDaysLeft === 1 ? '' : 's'} left</>
              ) : (
                <>Plan: <strong>{profile.tenant?.plan ?? 'trial'}</strong></>
              )}
              {locked ? (
                <span className="dash-badge">Setup in progress</span>
              ) : profile.tenant?.whatsappConnected ? (
                <span className="dash-badge dash-badge-live">Live</span>
              ) : (
                <span className="dash-badge">WhatsApp pending</span>
              )}
            </p>
          </div>
          <div className="dash-header-actions">
            {profile.user.isPlatformAdmin && <Link to="/admin" className="btn btn-ghost">Admin</Link>}
            <button type="button" className="btn btn-ghost" onClick={() => { clearAuth(); navigate('/'); }}>Log out</button>
          </div>
        </div>

        {locked && (
          <>
            <SetupStatus tenant={profile.tenant} />

            <SetupWalkthroughLink context="dashboard" />

            <div className="dash-locked-banner">
              <h2>We&apos;re setting up your WhatsApp</h2>
              <p>
                You submitted your details — our team is configuring your replies, inbox, and lead list.
                We usually finish within <strong>1–3 business days</strong> and will WhatsApp you on the number you provided when you&apos;re ready to go.
              </p>
              <div className="dash-locked-actions">
                <Link to="/onboarding" className="btn btn-ghost">Edit questionnaire</Link>
                {(() => {
                  const href = getContactHref();
                  const external = href.startsWith('http');
                  return (
                    <a
                      href={href}
                      className="btn btn-ghost"
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noreferrer' : undefined}
                    >
                      {getContactLabel()}
                    </a>
                  );
                })()}
              </div>
            </div>
          </>
        )}

        {!locked && profile.tenant && !profile.tenant.whatsappConnected && profile.tenant.isLive && (
          <>
            <SetupStatus tenant={profile.tenant} compact />
          </>
        )}

        {live && analytics && (
          <div className="dash-stats">
            <div className="dash-stat"><strong>{analytics.leadsTotal}</strong><span>Leads</span></div>
            <div className="dash-stat"><strong>{analytics.conversationsTotal}</strong><span>Chats</span></div>
            <div className="dash-stat"><strong>{analytics.botReplies}</strong><span>Bot replies</span></div>
            <div className="dash-stat"><strong>{analytics.avgReplySeconds}s</strong><span>Avg reply</span></div>
          </div>
        )}

        <div className="dash-grid">
          <article className={`dash-card ${locked ? 'is-locked' : ''}`}>
            <span className="dash-icon">💬</span>
            <h2>Kaana Inbox</h2>
            <p>Live WhatsApp conversations, agent handoff, outbound replies.</p>
            <button type="button" className="btn btn-accent" disabled={locked} onClick={() => openAppWithSSO('botiq')}>Open Inbox →</button>
          </article>

          <article className={`dash-card ${locked ? 'is-locked' : ''}`}>
            <span className="dash-icon">{isClinic ? '🦷' : '🎯'}</span>
            <h2>{isClinic ? 'Clinic front desk' : 'Kaana CRM'}</h2>
            <p>{isClinic ? 'Today\'s appointments, patient cards, walk-in booking.' : 'Pipeline, leads from WhatsApp, bookings, follow-ups.'}</p>
            <button type="button" className="btn btn-accent" disabled={locked} onClick={() => openAppWithSSO(isClinic ? 'clinic' : 'crm')}>
              {isClinic ? 'Open clinic desk →' : 'Open CRM →'}
            </button>
          </article>

          <article className={`dash-card ${locked ? 'is-locked' : ''}`}>
            <span className="dash-icon">🌐</span>
            <h2>Mini-site</h2>
            <p>Shareable catalog page with your brand and WhatsApp button.</p>
            <a href={slug ? `${LISTINGS}?tenant=${slug}` : LISTINGS} target="_blank" rel="noreferrer" className={`btn btn-ghost ${locked ? 'is-locked' : ''}`} aria-disabled={locked} onClick={locked ? (e) => e.preventDefault() : undefined}>View site ↗</a>
          </article>

          {live && concierge && (
            <article className="dash-card dash-card-wide">
              <span className="dash-icon">📱</span>
              <h2>We connect your WhatsApp</h2>
              {profile.tenant?.whatsappConnected ? (
                <p>Your WhatsApp number is connected. Messages flow into your inbox automatically.</p>
              ) : (
                <p>
                  Our team is connecting your business number to the official WhatsApp API.
                  You don&apos;t need to paste Phone Number IDs or access tokens — we handle Meta setup for you.
                  We&apos;ll WhatsApp you when you&apos;re live.
                </p>
              )}
            </article>
          )}

          {live && !concierge && (
            <>
              <article className="dash-card dash-card-wide">
                <span className="dash-icon">⚙️</span>
                <h2>We connect your WhatsApp</h2>
                <p>Paste Meta Business API credentials — or we configure this for you during onboarding.</p>
                <form className="dash-wa-form" onSubmit={saveWhatsApp}>
                  <input placeholder="Phone Number ID" value={waForm.phoneNumberId} onChange={(e) => setWaForm({ ...waForm, phoneNumberId: e.target.value })} required />
                  <input placeholder="Access Token" type="password" value={waForm.accessToken} onChange={(e) => setWaForm({ ...waForm, accessToken: e.target.value })} required />
                  <input placeholder="WhatsApp number (919876543210)" value={waForm.whatsappNumber} onChange={(e) => setWaForm({ ...waForm, whatsappNumber: e.target.value })} />
                  <button type="submit" className="btn btn-accent" disabled={waSaving}>{waSaving ? 'Saving…' : 'Save & connect'}</button>
                </form>
                {waMsg && <p className="dash-msg">{waMsg}</p>}
              </article>
            </>
          )}

          {live && (
            <>
              <article className="dash-card dash-card-wide">
                <span className="dash-icon">💳</span>
                <h2>Billing</h2>
                <p>Upgrade via Razorpay when you&apos;re ready.</p>
                <div className="dash-billing-btns">
                  {['starter', 'growth', 'pro'].map((plan) => (
                    <button key={plan} type="button" className="btn btn-ghost" disabled={!!billingPlan} onClick={() => upgrade(plan)}>
                      {billingPlan === plan ? 'Processing…' : `Upgrade to ${plan}`}
                    </button>
                  ))}
                </div>
                {billingMsg && <p className="dash-msg">{billingMsg}</p>}
              </article>
            </>
          )}
        </div>

        <div className="dash-links">
          <p>Quick links: <a href={BOTIQ}>Inbox</a> · <a href={CRM}>CRM</a> · <Link to="/pricing">Pricing</Link> · <Link to="/platform">Platform</Link></p>
        </div>
      </div>
    </main>
  );
}
