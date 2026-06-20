import { Link } from 'react-router-dom';
import { useReveal } from '../lib/useReveal';
import './workspace.css';

const FEATURED = [
  {
    icon: '💬',
    title: 'Team inbox',
    desc: 'See and reply to WhatsApp messages with your staff — one shared number, full history.',
    cta: 'Watch demo',
    href: '#inbox-demo',
  },
  {
    icon: '🎯',
    title: 'Lead list',
    desc: 'Every enquiry saved with name, number, and stage — follow up without losing chats.',
    cta: 'Watch demo',
    href: '#lead-tracking',
  },
];

const REGULAR = [
  {
    icon: '🌐',
    title: 'Share page',
    desc: 'One link with your services and a WhatsApp button — send in chat or ads.',
    href: '#inbox-demo',
    cta: 'See demo',
  },
  {
    icon: '⚙️',
    title: 'WhatsApp setup',
    desc: 'We connect your business number to the official API — guided setup included.',
    href: '/#how-it-works',
    cta: 'How it works',
    internal: true,
  },
  {
    icon: '💳',
    title: 'Billing',
    desc: 'Trial, Starter, Growth, and Pro plans via Razorpay. Upgrade when you are ready.',
    href: '/#pricing',
    cta: 'View pricing',
    internal: true,
  },
];

export function WorkspaceSection() {
  const sectionRef = useReveal<HTMLElement>();

  return (
    <section id="workspace" className="workspace-section" ref={sectionRef}>
      <div className="container">
        <p className="ultimate-kicker">What you get</p>
        <h2 className="ultimate-title">
          <span className="title-line">Everything in</span>
          <span className="title-line ultimate-accent">one place</span>
        </h2>
        <p className="ultimate-desc workspace-desc">
          After signup you get a shared WhatsApp inbox, a lead list, and a simple page to share your services — we connect it all for you.
        </p>

        <div className="workspace-bento">
          <div className="workspace-featured-row reveal-stagger">
            {FEATURED.map((app) => (
              <article key={app.title} className="workspace-card workspace-card-featured reveal">
                <span className="workspace-icon">{app.icon}</span>
                <h3>{app.title}</h3>
                <p>{app.desc}</p>
                <a href={app.href} className="workspace-link workspace-link-ghost">
                  {app.cta} →
                </a>
              </article>
            ))}
          </div>

          <div className="workspace-regular-row reveal-stagger">
            {REGULAR.map((app) => (
              <article key={app.title} className="workspace-card workspace-card-sm reveal">
                <span className="workspace-icon-sm">{app.icon}</span>
                <div className="workspace-card-sm-body">
                  <h3>{app.title}</h3>
                  <p>{app.desc}</p>
                </div>
                {app.internal ? (
                  <Link to={app.href} className="workspace-link">
                    {app.cta} →
                  </Link>
                ) : (
                  <a href={app.href} className="workspace-link">
                    {app.cta} →
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
