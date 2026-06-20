import { Link } from 'react-router-dom';
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
          <strong>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect width="24" height="24" rx="7" fill="currentColor" />
              <path d="M7 8.5c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v5.5c0 2.5-2 4.5-4.5 4.5h-1L8 20v-2.5C7.4 17.2 7 16.4 7 15.5V8.5z" fill="var(--bg)" />
              <path d="M9.5 11h5M9.5 13.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Kaana
          </strong>
          <p>Manage WhatsApp leads — capture enquiries, reply as a team, and track every conversation.</p>
          <p className="footer-tagline">Made for Indian businesses</p>
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

        <p className="footer-copy">© {new Date().getFullYear()} Kaana · All rights reserved</p>
      </div>
    </footer>
  );
}
