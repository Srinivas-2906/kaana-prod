import { Link } from 'react-router-dom';
import './legal.css';

export function TermsPage() {
  return (
    <main className="page-main legal-page" id="main-content">
      <div className="container legal-inner">
        <div className="legal-head">
          <p className="section-label">Legal</p>
          <h1>Terms of Service</h1>
          <p className="legal-meta">Last updated: June 2026 · Questions? <a href="mailto:hello@kaana.in">hello@kaana.in</a></p>
        </div>

        <div className="legal-body">
          <section>
            <h2>1. Acceptance of terms</h2>
            <p>By creating an account or using Kaana ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2>2. Description of service</h2>
            <p>Kaana provides WhatsApp automation tools including a bot builder, team inbox, CRM pipeline, and shareable mini-site, accessed through a multi-tenant SaaS platform. The Service connects to the Meta WhatsApp Business API on your behalf using credentials you provide.</p>
          </section>

          <section>
            <h2>3. Accounts and workspaces</h2>
            <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your password and all activities under your workspace. Notify us immediately at hello@kaana.in if you suspect unauthorised access.</p>
          </section>

          <section>
            <h2>4. Acceptable use</h2>
            <p>You agree not to: (a) send unsolicited messages or spam; (b) use the Service to harass, threaten, or defraud individuals; (c) violate Meta's WhatsApp Business Policy or any applicable law; (d) resell or sublicense the Service without written permission.</p>
          </section>

          <section>
            <h2>5. WhatsApp Business API compliance</h2>
            <p>Your use of WhatsApp features through Kaana is subject to Meta's Acceptable Use Policy and WhatsApp Business Policy. You are solely responsible for obtaining required opt-ins from your customers and for all messages sent from your number.</p>
          </section>

          <section>
            <h2>6. Billing and payments</h2>
            <p>Plans are billed monthly in INR via Razorpay. All prices are inclusive of applicable GST. Free trial limits apply as stated on our Pricing page. Downgrades or cancellations take effect at the end of the current billing period. No refunds are issued for partial months.</p>
          </section>

          <section>
            <h2>7. Data and privacy</h2>
            <p>Your data is stored on servers within India. We do not sell your data. See our <Link to="/privacy">Privacy Policy</Link> for details on how data is collected, stored, and processed.</p>
          </section>

          <section>
            <h2>8. Service availability</h2>
            <p>We aim for 99% uptime but do not guarantee uninterrupted service. Scheduled maintenance will be communicated in advance where possible. We are not liable for downtime caused by Meta API outages or third-party infrastructure.</p>
          </section>

          <section>
            <h2>9. Termination</h2>
            <p>You may close your account at any time. We reserve the right to suspend or terminate accounts that violate these Terms, with or without notice depending on the severity of the violation.</p>
          </section>

          <section>
            <h2>10. Limitation of liability</h2>
            <p>To the maximum extent permitted by law, Kaana's liability is limited to the amount paid by you in the 30 days preceding the claim. We are not liable for indirect, incidental, or consequential damages.</p>
          </section>

          <section>
            <h2>11. Governing law</h2>
            <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Bengaluru, India.</p>
          </section>

          <section>
            <h2>12. Changes to terms</h2>
            <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance. Material changes will be notified by email.</p>
          </section>
        </div>

        <div className="legal-foot">
          <Link to="/privacy">Privacy Policy →</Link>
          <Link to="/signup">Back to sign up →</Link>
        </div>
      </div>
    </main>
  );
}
