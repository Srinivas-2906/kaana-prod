import { Link } from 'react-router-dom';
import { useIndustry } from '../context/IndustryContext';
import { CTA } from '../lib/onboarding';
import { SetupWalkthroughInlineLink } from './SetupWalkthroughInlineLink';
import './setup-process.css';

const FLOW = [
  { label: 'Sign up' },
  { label: 'We contact you' },
  { label: 'We connect WhatsApp' },
  { label: 'Go live' },
];

const TRUST_STRIP = [
  'Use your existing business number',
  'We help with Meta setup',
  'No technical knowledge required',
  'Your business keeps ownership of its WhatsApp account',
];

export function SetupProcess() {
  const { industryId } = useIndustry();

  return (
    <section id="how-it-works" className="setup-process">
      <div className="container">
        <p className="ultimate-kicker">How it works</p>
        <h2 className="ultimate-title">
          <span className="title-line">What happens</span>
          <span className="title-line ultimate-accent">after you sign up</span>
        </h2>
        <p className="ultimate-desc setup-process-desc">
          No guesswork — we reach out, connect your WhatsApp for you, and get you live. Usually 1–3 business days.
        </p>

        <SetupWalkthroughInlineLink />

        {/* Desktop: pill row */}
        <div className="setup-process-flow" aria-label="Setup steps">
          {FLOW.map((step, i) => (
            <div key={step.label} className="setup-process-flow-item">
              {i > 0 ? <span className="setup-process-flow-arrow" aria-hidden="true">↓</span> : null}
              <div className="setup-process-flow-step">
                <span className="setup-process-flow-num">{i + 1}</span>
                <span>{step.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: vertical timeline */}
        <ol className="setup-process-timeline" aria-label="Setup steps">
          {FLOW.map((step, i) => (
            <li key={step.label} className="setup-process-timeline-item">
              <div className="setup-process-timeline-left">
                <span className="setup-process-timeline-num">{i + 1}</span>
              </div>
              <div className="setup-process-timeline-body">
                <span className="setup-process-timeline-label">{step.label}</span>
              </div>
            </li>
          ))}
        </ol>

        <ul className="setup-trust-strip" aria-label="WhatsApp setup reassurance">
          {TRUST_STRIP.map((item) => (
            <li key={item}>
              <span className="setup-trust-check" aria-hidden="true">✓</span>
              {item}
            </li>
          ))}
        </ul>

        <div className="setup-process-cta">
          <Link to={`/signup?industry=${industryId}`} className="btn btn-accent btn-lg">
            {CTA.primary}
          </Link>
          <a href="#inbox-demo" className="btn btn-ghost btn-lg setup-process-cta-secondary">See the product</a>
        </div>
      </div>
    </section>
  );
}
