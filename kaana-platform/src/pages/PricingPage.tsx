import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPlans, getToken, checkoutPlan, type Plan } from '../lib/api';
import {
  FOUNDING_PLANS,
  FOUNDING_SETUP_FEE_INR,
  SETUP_FEE_AFTER_FOUNDING_INR,
  formatPlanPeriod,
  formatPlanPrice,
  foundingPlansForApi,
} from '../lib/pricing';
import { getContactHref } from '../lib/contact';
import { CTA } from '../lib/onboarding';
import './pricing.css';

const FALLBACK_PLANS: Plan[] = foundingPlansForApi();

export function PricingPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [checkingOut, setCheckingOut] = useState('');
  const loggedIn = !!getToken();

  async function handlePlan(planId: string) {
    const marketing = FOUNDING_PLANS.find((p) => p.id === planId);
    if (marketing?.contactOnly) {
      window.location.href = getContactHref();
      return;
    }
    if (planId === 'trial') {
      navigate('/signup?plan=trial');
      return;
    }
    if (!loggedIn) {
      navigate(`/signup?plan=${planId}`);
      return;
    }
    setCheckingOut(planId);
    try {
      await checkoutPlan(planId);
      navigate('/dashboard');
    } catch {
      /* user closed checkout */
    } finally {
      setCheckingOut('');
    }
  }

  useEffect(() => {
    fetchPlans()
      .then((p) => {
        if (p?.length) setPlans(p);
      })
      .catch(() => {});
  }, []);

  return (
    <main className="page-main pricing-page" id="main-content">
      <div className="container">
        <div className="pricing-header">
          <p className="section-label">Founding pricing</p>
          <h1>Simple pricing for WhatsApp businesses</h1>
          <p>
            Start free for 14 days. Pay when you&apos;re live and getting leads.
            Founding customers pay <strong>₹{FOUNDING_SETUP_FEE_INR} setup</strong> — we handle WhatsApp onboarding for you.
          </p>
        </div>

        <div className="pricing-grid">
          {FOUNDING_PLANS.map((plan) => {
            const apiPlan = plans.find((p) => p.id === plan.id);
            const priceInr = plan.priceInr ?? (apiPlan?.price === -1 ? null : apiPlan?.price ?? plan.priceInr);
            const highlight = plan.highlight ?? false;

            return (
              <article key={plan.id} className={`plan-card ${highlight ? 'highlight' : ''}`}>
                {plan.badge ? <span className="plan-badge">{plan.badge}</span> : null}
                {highlight && !plan.badge ? <span className="plan-badge">Most popular</span> : null}
                <h2>{plan.name}</h2>
                <div className="plan-price">
                  <span className="amount">{formatPlanPrice(priceInr)}</span>
                  {priceInr !== null && plan.period !== 'custom' ? (
                    <span className="period">{formatPlanPeriod(plan.period)}</span>
                  ) : null}
                </div>
                {plan.desc ? <p className="plan-desc">{plan.desc}</p> : null}
                <ul>
                  {plan.features.map((f) => (
                    <li key={f}>✓ {f}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`btn ${highlight ? 'btn-accent' : 'btn-ghost'}`}
                  disabled={!!checkingOut}
                  onClick={() => handlePlan(plan.id)}
                >
                  {checkingOut === plan.id ? 'Processing…' : plan.cta}
                </button>
              </article>
            );
          })}
        </div>

        <div className="pricing-founder-note">
          <h3>Founding customer offer</h3>
          <p>
            <strong>₹{FOUNDING_SETUP_FEE_INR} setup fee</strong> for our first customers while we learn from every onboarding.
            After 10+ customers, a one-time setup fee of ₹{SETUP_FEE_AFTER_FOUNDING_INR.toLocaleString('en-IN')} may apply for complex flows — we&apos;ll confirm before you pay.
          </p>
          <p>
            No bot credits, conversation limits, or add-on packs on this page — one bundle, one price, personal setup included.
          </p>
        </div>

        <p className="pricing-foot">
          Billing powered by Razorpay · Upgrade anytime from your{' '}
          <Link to="/dashboard">dashboard</Link> · Questions?{' '}
          <a href={getContactHref()}>{CTA.primary === 'Start setup' ? 'Talk to us' : CTA.primary}</a>
        </p>
      </div>
    </main>
  );
}
