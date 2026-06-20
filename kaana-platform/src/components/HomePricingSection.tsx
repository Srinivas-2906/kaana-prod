import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useIndustry } from '../context/IndustryContext';
import { CTA } from '../lib/onboarding';
import { formatPlanPrice, getFoundingPlan } from '../lib/pricing';
import { getContactHref } from '../lib/contact';
import './home-pricing.css';

const HOME_PLANS = [
  {
    id: 'starter',
    features: [
      '1 WhatsApp number',
      '2 team members',
      'Shared inbox',
      'Lead CRM',
      'Mini-site included',
      'Setup included',
    ],
  },
  {
    id: 'growth',
    features: [
      'Everything in Starter',
      '5 team members',
      'Broadcast campaigns',
      'Advanced workflows',
      'Priority support',
    ],
  },
  {
    id: 'pro',
    features: [
      'Custom workflows',
      'Priority support',
      'Advanced integrations',
    ],
  },
] as const;

function CollapsiblePlan({
  summaryName,
  summaryPrice,
  period,
  children,
}: {
  summaryName: string;
  summaryPrice: string;
  period: string | null;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 769px)');
    function sync() {
      if (ref.current) ref.current.open = mq.matches;
    }
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return (
    <details ref={ref} className="home-pricing-card home-pricing-collapsed">
      <summary className="home-pricing-summary">
        <span className="home-pricing-summary-name">{summaryName}</span>
        <span className="home-pricing-summary-price">
          {summaryPrice}
          {period ? <em>{period}</em> : null}
        </span>
      </summary>
      {children}
    </details>
  );
}

export function HomePricingSection() {
  const { industryId } = useIndustry();

  return (
    <section id="pricing" className="home-pricing">
      <div className="container">
        <p className="ultimate-kicker">Pricing</p>
        <h2 className="ultimate-title">
          <span className="title-line">Simple pricing.</span>
          <span className="title-line ultimate-accent">One bundle.</span>
        </h2>
        <p className="ultimate-desc home-pricing-desc">
          Founding customer pricing. No setup fee. No credit card to start.
        </p>

        <div className="home-pricing-compare">
          {HOME_PLANS.map(({ id, features }) => {
            const plan = getFoundingPlan(id)!;
            const highlight = plan.highlight ?? false;
            const href = plan.contactOnly
              ? getContactHref()
              : `/signup?industry=${industryId}&plan=${id}`;

            const body = (
              <>
                {plan.badge ? <span className="home-pricing-badge">{plan.badge}</span> : null}
                <h3>{plan.name}</h3>
                <div className="home-pricing-price">
                  <strong>{formatPlanPrice(plan.priceInr)}</strong>
                  {plan.priceInr !== null ? <span>{plan.period}</span> : null}
                </div>
                <div className="home-pricing-tier-body">
                  <ul>
                    {features.map((f) => (
                      <li key={f}>✓ {f}</li>
                    ))}
                  </ul>
                  {plan.contactOnly ? (
                    <a href={href} className="btn btn-ghost">{plan.cta}</a>
                  ) : (
                    <Link to={href} className={`btn ${highlight ? 'btn-accent' : 'btn-ghost'}`}>
                      {CTA.primary}
                    </Link>
                  )}
                </div>
              </>
            );

            if (highlight) {
              return (
                <article key={id} className="home-pricing-card highlight">
                  {body}
                </article>
              );
            }

            return (
              <CollapsiblePlan
                key={id}
                summaryName={plan.name}
                summaryPrice={formatPlanPrice(plan.priceInr)}
                period={plan.priceInr !== null ? plan.period : null}
              >
                {body}
              </CollapsiblePlan>
            );
          })}
        </div>

        <p className="home-pricing-foot">
          Free 14-day trial · ₹0 setup for founding customers ·{' '}
          <Link to="/pricing">Full pricing details →</Link>
        </p>
      </div>
    </section>
  );
}
