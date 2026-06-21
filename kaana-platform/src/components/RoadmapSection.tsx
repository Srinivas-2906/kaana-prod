import { Link } from 'react-router-dom';
import { PLATFORM_ROADMAP } from '../data/industries';
import { CAPABILITY_ICONS } from './KaanaIcons';
import { getContactHref, getContactLabel } from '../lib/contact';
import './roadmap.css';

type Props = {
  variant?: 'home' | 'platform';
};

export function RoadmapSection({ variant = 'home' }: Props) {
  const href = getContactHref();
  const external = href.startsWith('http');

  return (
    <section id="roadmap" className="roadmap-section">
      <div className="container">
        <p className="ultimate-kicker">Same platform, more channels</p>
        <h2 className="ultimate-title">
          <span className="title-line">Starting with WhatsApp.</span>
          <span className="title-line ultimate-accent">Adding more next.</span>
        </h2>
        <p className="ultimate-desc roadmap-desc">
          {variant === 'home'
            ? 'We ship WhatsApp end-to-end first — inbox, lead tracking, and share page. Instagram DM, QR ordering, web chat, and AI-assisted workflows plug into the same platform over time.'
            : 'One Kaana account — not separate products. New channels connect to the same inbox, CRM, billing, and admin dashboard you use today.'}
        </p>

        <div className="roadmap-grid">
          {PLATFORM_ROADMAP.map((item) => {
            const Icon = CAPABILITY_ICONS[item.iconKey];
            return (
              <article key={item.title} className="roadmap-card">
                <div className="roadmap-card-top">
                  <span className="roadmap-icon-wrap">
                    {Icon && <Icon size={20} strokeWidth={2} aria-hidden="true" />}
                  </span>
                  <span className="roadmap-status">
                    {'status' in item && item.status === 'soon' ? 'Soon' : 'Early access'}
                  </span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <span className="roadmap-audience">For {item.audience}</span>
              </article>
            );
          })}
        </div>

        <div className="roadmap-foot">
          <p className="roadmap-note">
            Need one of these now? Tell us when you sign up or reach out — we onboard WhatsApp customers first, then turn on add-ons by request.
          </p>
          <div className="roadmap-actions">
            <Link to="/platform" className="btn btn-ghost">See what&apos;s live today</Link>
            <a
              href={href}
              className="btn btn-ghost"
              target={external ? '_blank' : undefined}
              rel={external ? 'noreferrer' : undefined}
            >
              {getContactLabel()}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
