import { Link } from 'react-router-dom';
import { CTA } from '../lib/onboarding';
import { LeadCaptureForm } from './LeadCaptureForm';
import './social-proof.css';
import './lead-capture.css';

export function SocialProof() {
  return (
    <section className="social-proof-section">
      <div className="container">
        <p className="ultimate-kicker">Not ready yet?</p>
        <h2 className="ultimate-title">
          <span className="title-line">Leave your WhatsApp number</span>
          <span className="title-line ultimate-accent">— we&apos;ll reach out</span>
        </h2>
        <p className="ultimate-desc" style={{ marginTop: 12 }}>
          We&apos;ll call you on WhatsApp to explain setup and answer questions. No pressure, no spam.
        </p>

        <LeadCaptureForm source="homepage-social" />

        <p className="social-proof-note" style={{ marginTop: 20 }}>
          Or{' '}
          <Link to="/signup">{CTA.primary} yourself →</Link>
        </p>
      </div>
    </section>
  );
}
