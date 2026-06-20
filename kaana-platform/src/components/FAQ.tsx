import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CTA } from '../lib/onboarding';
import { getContactHref } from '../lib/contact';
import './faq.css';

const FAQS = [
  {
    q: 'Who owns the WhatsApp account?',
    a: 'Your business owns the WhatsApp account and number. Kaana helps connect and manage it, but you keep ownership and can continue using it if you leave.',
  },
  {
    q: 'Do I need a Facebook account?',
    a: 'Yes. WhatsApp Business API requires a Meta account. If you don\'t have one, we\'ll guide you through setup.',
  },
  {
    q: 'Can I use my existing WhatsApp number?',
    a: 'Yes, in most cases. Existing numbers can be migrated to the official WhatsApp Business API. We walk you through it as part of setup — you won\'t lose your number.',
  },
  {
    q: 'Do I need GST?',
    a: 'No. You can start without GST. We can discuss billing details when you upgrade to a paid plan.',
  },
  {
    q: 'How long does setup take?',
    a: 'Usually 1–3 business days after you submit the setup form. Meta verification can sometimes add a day — we WhatsApp you when everything is ready.',
  },
  {
    q: 'Do I need technical knowledge?',
    a: 'No. We help with WhatsApp setup, automatic replies, and connecting your team inbox. You fill a short form — we handle the rest.',
  },
  {
    q: 'Is this only for one industry?',
    a: 'No. Any business that gets customers on WhatsApp — clinics, salons, coaches, shops, brokers, schools, and more. We configure flows for your business type.',
  },
  {
    q: 'What happens when a customer sends a message we cannot answer automatically?',
    a: 'It goes to your shared team inbox. Any team member can take over, see the full history, and reply — the customer stays on the same WhatsApp thread.',
  },
  {
    q: 'How is this different from the WhatsApp Business app?',
    a: 'The WhatsApp Business app is single-user and manual. Kaana adds automatic replies, a shared team inbox, lead tracking, and follow-ups — all on one business number.',
  },
  {
    q: 'How much does Kaana cost?',
    a: 'Founding customer pricing starts at ₹999/month for Starter. Growth is ₹2,499/month. Pro is custom. No setup fee for founding customers.',
  },
  {
    q: 'Is pricing per person or per business?',
    a: 'Per business. Starter includes 2 team members on the shared inbox. Growth includes 5. No per-message credits or add-on packs on our founding plans.',
  },
  {
    q: 'What payment methods do you support?',
    a: 'We use Razorpay — UPI, net banking, credit/debit cards, and EMI. All prices are in INR.',
  },
];

type Props = {
  mobileLimit?: number;
};

export function FAQ({ mobileLimit = 8 }: Props) {
  const [open, setOpen] = useState<number | null>(null);

  function toggle(i: number) {
    setOpen((prev) => (prev === i ? null : i));
  }

  return (
    <section id="faq" className="faq-section">
      <div className="container faq-inner">
        <div className="faq-head">
          <p className="ultimate-kicker">FAQ</p>
          <h2 className="ultimate-title">
            <span className="title-line">Common</span>
            <span className="title-line ultimate-accent">questions</span>
          </h2>
          <p className="ultimate-desc">
            Everything you need to know before starting. Can&apos;t find an answer?{' '}
            <a href={getContactHref()}>Get in touch →</a>
          </p>
        </div>

        <div className="faq-list">
          {FAQS.map((item, i) => (
            <div
              key={i}
              className={`faq-item ${open === i ? 'faq-item-open' : ''}${mobileLimit && i >= mobileLimit ? ' faq-item-mobile-hidden' : ''}`}
            >
              <button
                type="button"
                className="faq-question"
                aria-expanded={open === i}
                onClick={() => toggle(i)}
              >
                <span>{item.q}</span>
                <span className="faq-chevron" aria-hidden="true" />
              </button>
              <div className="faq-answer" aria-hidden={open !== i}>
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="faq-mobile-more">
          <Link to="/pricing">Pricing details</Link>
          {' · '}
          <a href={getContactHref()}>Get in touch</a>
        </p>

        <div className="faq-foot">
          <p className="faq-foot-desktop">Still have questions? We are happy to help.</p>
          <div className="faq-foot-actions">
            <a href={getContactHref()} className="btn btn-ghost faq-foot-secondary">Get in touch</a>
            <Link to="/signup" className="btn btn-accent">{CTA.primary}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
