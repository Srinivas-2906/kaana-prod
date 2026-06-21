import { Link } from 'react-router-dom';
import './legal.css';

export function PrivacyPage() {
  return (
    <main className="page-main legal-page" id="main-content">
      <div className="container legal-inner">
        <div className="legal-head">
          <p className="section-label">Legal</p>
          <h1>Privacy Policy</h1>
          <p className="legal-meta">Last updated: June 2026 · Questions? <a href="mailto:hello@kaana.in">hello@kaana.in</a></p>
        </div>

        <div className="legal-body">
          <section>
            <h2>1. What we collect</h2>
            <p>We collect: (a) account information you provide at signup (name, email, phone, business name); (b) usage data (bot reply counts, inbox activity, CRM records you create); (c) WhatsApp message content to the extent required to deliver the Service; (d) technical data (IP address, browser type, session logs) for security and analytics.</p>
          </section>

          <section>
            <h2>2. How we use your data</h2>
            <p>Your data is used to: operate and improve the Service; send transactional emails (signup, billing, support); provide customer support; comply with legal obligations. We do not use your data for advertising or sell it to third parties.</p>
          </section>

          <section>
            <h2>3. WhatsApp message data</h2>
            <p>Messages processed through Kaana are stored to power the team inbox, CRM, and bot features. Message data is encrypted at rest. You retain ownership of all customer data created in your workspace.</p>
          </section>

          <section>
            <h2>4. Data storage and security</h2>
            <p>Data is stored on servers located in India. We use industry-standard encryption (TLS in transit, AES-256 at rest) and access controls. No system is perfectly secure; we will notify you promptly of any breach affecting your data.</p>
          </section>

          <section>
            <h2>5. Third-party services</h2>
            <p>We use: Meta (WhatsApp Business API); Razorpay (payments); standard cloud infrastructure. Each third-party service operates under its own privacy policy. We only share data with these services to the extent necessary to provide the Service.</p>
          </section>

          <section>
            <h2>6. Your rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data at any time by emailing hello@kaana.in. Account deletion removes your data from our systems within 30 days, except data we are legally required to retain.</p>
          </section>

          <section>
            <h2>7. Cookies</h2>
            <p>We use only essential cookies (session management, authentication). We do not use advertising or tracking cookies. You can disable cookies in your browser, though this may affect Service functionality.</p>
          </section>

          <section>
            <h2>8. Data retention</h2>
            <p>We retain your data for as long as your account is active, plus 90 days after closure for backup and audit purposes. Billing records are retained for 7 years as required by Indian accounting law.</p>
          </section>

          <section>
            <h2>9. Children</h2>
            <p>The Service is not directed to individuals under 18. We do not knowingly collect data from minors.</p>
          </section>

          <section>
            <h2>10. Changes to this policy</h2>
            <p>We may update this policy. Material changes will be communicated by email. Continued use of the Service after changes constitutes acceptance.</p>
          </section>
        </div>

        <div className="legal-foot">
          <Link to="/terms">Terms of Service →</Link>
          <Link to="/signup">Back to sign up →</Link>
        </div>
      </div>
    </main>
  );
}
