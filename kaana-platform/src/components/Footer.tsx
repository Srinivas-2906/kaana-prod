import { Link } from 'react-router-dom';
import { BotIqLogo } from './BotIqLogo';
import './footer.css';

const LINKS = [
  {
    heading: 'Product',
    items: [
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Watch demo', href: '/#inbox-demo' },
      { label: 'Platform', href: '/platform' },
      { label: 'Industries', href: '/#industries' },
    ],
  },
  {
    heading: 'Get started',
    items: [
      { label: 'Pricing', href: '/#pricing' },
      { label: 'Start setup', href: '/signup' },
      { label: 'Log in', href: '/login' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  },
  {
    heading: 'What you get',
    items: [
      { label: 'Shared inbox', href: '/#inbox-demo' },
      { label: 'Lead tracking', href: '/#lead-tracking' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'WhatsApp setup', href: '/#how-it-works' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <BotIqLogo to="/" />
          <p>Bot IQ — WhatsApp automation, shared inbox, templates, and CRM for your team.</p>
          <p className="footer-tagline">By Kaana AI Technologies</p>
          <p className="footer-meta-badge">Built on Meta WhatsApp Business Platform</p>
          <a href="mailto:hello@kaana.in" className="footer-email">hello@kaana.in</a>
        </div>

        {LINKS.map((col) => (
          <nav key={col.heading} className="footer-col" aria-label={col.heading}>
            <h4>{col.heading}</h4>
            {col.items.map((item) => (
              <Link key={item.label} to={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        ))}

        <p className="footer-copy">© {new Date().getFullYear()} Kaana AI Technologies · Bot IQ</p>
      </div>
    </footer>
  );
}
