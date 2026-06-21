import { Link } from 'react-router-dom';
import { CTA } from '../lib/onboarding';
import { getContactLabel, getWhatsAppLink } from '../lib/contact';
import { LeadCaptureForm } from './LeadCaptureForm';
import './social-proof.css';
import './lead-capture.css';

export function CallbackSection() {
  const waLink = getWhatsAppLink();

  return (
    <section id="callback" className="social-proof-section callback-section">
      <div className="container">
        <p className="ultimate-kicker">Not ready to sign up?</p>
        <h2 className="ultimate-title">
          <span className="title-line">Questions?</span>
          <span className="title-line ultimate-accent">WhatsApp us</span>
        </h2>
        <p className="ultimate-desc callback-desc">
          Leave your number or message us directly. No pressure, no spam.
        </p>

        {waLink ? (
          <a href={waLink} className="btn btn-accent btn-lg callback-wa-btn" target="_blank" rel="noreferrer">
            {getContactLabel()}
          </a>
        ) : null}

        <div className="callback-form-wrap">
          <LeadCaptureForm source="homepage-callback" />
        </div>

        <p className="social-proof-note callback-foot">
          Or{' '}
          <Link to="/signup">{CTA.primary} yourself →</Link>
        </p>
      </div>
    </section>
  );
}
