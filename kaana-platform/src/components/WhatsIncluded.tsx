import { WHATS_INCLUDED } from '../lib/pricing';
import './whats-included.css';

export function WhatsIncluded() {
  return (
    <section id="included" className="whats-included">
      <div className="container">
        <p className="ultimate-kicker">What you get</p>
        <h2 className="ultimate-title">
          <span className="title-line">Everything</span>
          <span className="title-line ultimate-accent">included</span>
        </h2>
        <p className="ultimate-desc whats-included-desc">
          One bundle — no add-ons, no credits, no per-message fees on the marketing site.
          This is what you get for <strong>₹999/month</strong> as a founding customer.
        </p>

        <ul className="whats-included-grid">
          {WHATS_INCLUDED.map((item) => (
            <li key={item}>
              <span className="whats-included-check" aria-hidden="true">✓</span>
              {item}
            </li>
          ))}
        </ul>

        <p className="whats-included-note">
          Founding customers: <strong>₹0 setup fee</strong>. We learn from every onboarding — you get personal setup help.
        </p>
      </div>
    </section>
  );
}
