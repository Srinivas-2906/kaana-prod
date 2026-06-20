import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getToken, apiGet, apiPost } from '../lib/api';
import type { IntakeAnswers, OnboardingIntake } from '../lib/onboarding';
import { CTA } from '../lib/onboarding';
import { getContactHref, getWhatsAppLink } from '../lib/contact';
import { SetupStatus } from '../components/SetupStatus';
import { SetupWalkthroughLink } from '../components/SetupWalkthroughLink';
import type { Tenant } from '../lib/api';
import './onboarding.css';

const STEPS = [
  { title: 'Your business', desc: 'What you do and what you sell — we use this for your automatic replies and services page.' },
  { title: 'WhatsApp', desc: 'Your number, hours, and the questions customers ask most.' },
  { title: 'Finish', desc: 'What you want WhatsApp to handle for you.' },
];

const USE_CASES = [
  'Answer FAQs',
  'Book appointments',
  'Take orders',
  'Share catalog',
  'Payment links',
];

const EMPTY: IntakeAnswers = {};

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<IntakeAnswers>(EMPTY);
  const [contactPhone, setContactPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [tenantProfile, setTenantProfile] = useState<Tenant | null>(null);

  useEffect(() => {
    if (!getToken()) { navigate('/signup'); return; }
    apiGet<{ intake?: OnboardingIntake; tenant?: Tenant }>('/me')
      .then((data) => {
        const merged = { ...(data.intake?.answers ?? {}) };
        if (!merged.existingWhatsApp && data.tenant?.agentPhone) {
          merged.existingWhatsApp = data.tenant.agentPhone;
        }
        setContactPhone(merged.existingWhatsApp || data.tenant?.agentPhone || '');
        setAnswers(merged);
        if (data.intake?.step != null) setStep(Math.min(data.intake.step, STEPS.length - 1));
        if (data.intake?.status === 'submitted' || data.intake?.status === 'reviewed') {
          setSubmitted(true);
          setTenantProfile(data.tenant ?? null);
        }
      })
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  function setField<K extends keyof IntakeAnswers>(key: K, value: IntakeAnswers[K]) {
    setAnswers((a) => ({ ...a, [key]: value }));
  }

  function toggleUseCase(item: string) {
    const current = answers.useCases ?? [];
    setField('useCases', current.includes(item) ? current.filter((x) => x !== item) : [...current, item]);
  }

  async function save(nextStep: number, submit = false) {
    setSaving(true);
    setError('');
    try {
      await apiPost('/onboarding/intake', { answers, step: nextStep, submit });
      if (submit) {
        setContactPhone(answers.existingWhatsApp || contactPhone);
        setSubmitted(true);
        apiGet<{ tenant?: Tenant }>('/me').then((data) => setTenantProfile(data.tenant ?? null)).catch(() => {});
      } else {
        setStep(nextStep);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="page-main" id="main-content"><div className="container">Loading…</div></main>;

  if (submitted) {
    const waLink = getWhatsAppLink();
    const phone = answers.existingWhatsApp || contactPhone;
    return (
      <main className="page-main onboarding-page" id="main-content">
        <div className="container onboarding-done">
          <h1>You&apos;re all set ✓</h1>
          <p className="onboarding-done-lead">
            We received your details. Our team will set up your WhatsApp replies, shared inbox, and lead list.
          </p>
          <ul className="onboarding-done-list">
            <li>
              <strong>We&apos;ll contact you</strong> on WhatsApp
              {phone ? <> at <strong>{phone}</strong></> : null} within <strong>1–3 business days</strong> when your setup is ready.
            </li>
            <li><strong>You don&apos;t need to do anything else</strong> — no Meta account, API keys, or technical setup required from you.</li>
            <li><strong>You keep your WhatsApp number.</strong> Your business owns it — Kaana helps you manage it.</li>
            <li><strong>Founding price:</strong> ₹999/month after your 14-day trial · Trial starts when we activate you · ₹0 setup fee today.</li>
          </ul>

          <SetupStatus tenant={tenantProfile} compact />

          <SetupWalkthroughLink context="success" />

          <p className="onboarding-done-note">
            Questions?{' '}
            {waLink ? (
              <a href={waLink} target="_blank" rel="noreferrer">Message us on WhatsApp</a>
            ) : (
              <a href={getContactHref()}>Get in touch</a>
            )}
          </p>
          <Link to="/dashboard" className="btn btn-accent btn-lg">View setup status</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-main onboarding-page" id="main-content">
      <div className="container onboarding-layout">
        <aside className="onboarding-aside">
          <p className="section-label">Step 2 of 2</p>
          <h1>Help us set up your WhatsApp</h1>
          <p className="onboarding-aside-desc">
            Three short steps · about 5 minutes · We configure everything — you don&apos;t need Meta or technical knowledge.
          </p>
          <ol className="onboarding-steps-nav">
            {STEPS.map((s, i) => (
              <li key={s.title} className={i === step ? 'active' : i < step ? 'done' : ''}>
                <span>{i + 1}</span>
                {s.title}
              </li>
            ))}
          </ol>
        </aside>

        <div className="onboarding-panel">
          <header className="onboarding-panel-head">
            <h2>{STEPS[step].title}</h2>
            <p>{STEPS[step].desc}</p>
          </header>

          {error && <p className="error-msg" role="alert">{error}</p>}

          {step === 0 && (
            <div className="onboarding-fields">
              <label>
                What does your business do?
                <textarea rows={3} value={answers.businessDescription ?? ''} onChange={(e) => setField('businessDescription', e.target.value)} placeholder="e.g. Multi-speciality clinic in Gachibowli, or D2C skincare brand shipping across India" required />
              </label>
              <label>
                Main services or products (with prices if known)
                <span className="field-hint">Rough list is fine — we&apos;ll refine with you on WhatsApp.</span>
                <textarea rows={5} value={answers.servicesList ?? ''} onChange={(e) => setField('servicesList', e.target.value)} placeholder="One per line — e.g. Haircut — ₹599&#10;Bridal package — ₹15,000" required />
              </label>
              <label>
                City / area you serve
                <input value={answers.citiesServed ?? ''} onChange={(e) => setField('citiesServed', e.target.value)} placeholder="e.g. Hyderabad, Secunderabad, pan-India" required />
              </label>
            </div>
          )}

          {step === 1 && (
            <div className="onboarding-fields">
              <p className="onboarding-step-note">
                <strong>Meta (Facebook):</strong> If you don&apos;t have a Meta account yet, we&apos;ll guide you during setup. No need to create one now.
              </p>
              <label>
                Business WhatsApp number
                <span className="field-hint">Your business keeps this number — we help connect it to the official WhatsApp API.</span>
                <input value={answers.existingWhatsApp ?? ''} onChange={(e) => setField('existingWhatsApp', e.target.value)} placeholder="+91 98400 12345" required />
              </label>
              <label>
                Business hours
                <input value={answers.businessHours ?? ''} onChange={(e) => setField('businessHours', e.target.value)} placeholder="e.g. Mon–Sat 10am–8pm" required />
              </label>
              <label>
                Top 3 questions customers ask on WhatsApp
                <textarea rows={4} value={answers.topQuestions ?? ''} onChange={(e) => setField('topQuestions', e.target.value)} placeholder="One per line — e.g. Price?, Available slots?, Track my order?" required />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="onboarding-fields">
              <fieldset>
                <legend>What should WhatsApp handle for you?</legend>
                <p className="field-hint">Pick at least one — this tells us what to set up first.</p>
                <div className="onboarding-chips">
                  {USE_CASES.map((item) => (
                    <button key={item} type="button" className={`onboarding-chip ${answers.useCases?.includes(item) ? 'active' : ''}`} onClick={() => toggleUseCase(item)}>
                      {item}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label>
                Anything else we should know? (optional)
                <textarea rows={3} value={answers.customRequests ?? ''} onChange={(e) => setField('customRequests', e.target.value)} placeholder="Special flows, integrations, or notes for our setup call" />
              </label>
            </div>
          )}

          <footer className="onboarding-actions">
            {step > 0 && (
              <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => setStep(step - 1)}>Back</button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" className="btn btn-accent" disabled={saving} onClick={() => save(step + 1)}>
                {saving ? 'Saving…' : 'Continue →'}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-accent"
                disabled={saving || !(answers.useCases?.length)}
                onClick={() => save(step, true)}
              >
                {saving ? 'Submitting…' : CTA.onboardingSubmit}
              </button>
            )}
          </footer>
        </div>
      </div>
    </main>
  );
}
