import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { getToken } from '../lib/api';
import { CTA } from '../lib/onboarding';
import { ThemeToggle } from './ThemeToggle';
import { BotIqLogo } from './BotIqLogo';
import './nav.css';

const NAV_LINKS = [
  { to: '/#how-it-works', label: 'How it works', hash: true },
  { to: '/#inbox-demo', label: 'Product', hash: true },
  { to: '/platform', label: 'Platform', hash: false },
  { to: '/#industries', label: 'Industries', hash: true },
  { to: '/#pricing', label: 'Pricing', hash: true },
];

export function Navbar() {
  const loggedIn = !!getToken();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close menu on navigation
  useEffect(() => {
    setOpen(false);
  }, [location]);

  // Trap body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <header className="site-header">
        <div className="nav" data-open={open || undefined}>
          <div className="nav-inner">
            <BotIqLogo to="/" className="nav-brand-logo" />

            <nav className="nav-links" aria-label="Main navigation">
              {NAV_LINKS.map(({ to, label, hash }) =>
                hash ? (
                  <Link key={label} to={to}>{label}</Link>
                ) : (
                  <NavLink key={label} to={to}>{label}</NavLink>
                ),
              )}
            </nav>

            <div className="nav-actions">
              <ThemeToggle compact />
              {loggedIn ? (
                <Link to="/dashboard" className="btn btn-ghost nav-btn-sm">Dashboard</Link>
              ) : (
                <Link to="/login" className="btn btn-ghost nav-btn-sm nav-hide-sm">Log in</Link>
              )}
              <Link to="/signup" className="btn btn-accent nav-btn-sm nav-cta">{CTA.primaryShort}</Link>

              <button
                type="button"
                className="nav-burger"
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                <span className="nav-burger-bar" />
                <span className="nav-burger-bar" />
                <span className="nav-burger-bar" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`nav-drawer ${open ? 'nav-drawer-open' : ''}`} aria-hidden={!open}>
        <nav className="nav-drawer-links" aria-label="Mobile navigation">
          {NAV_LINKS.map(({ to, label, hash }) =>
            hash ? (
              <Link key={label} to={to} className="nav-drawer-link" onClick={() => setOpen(false)}>
                {label}
              </Link>
            ) : (
              <NavLink key={label} to={to} className="nav-drawer-link" onClick={() => setOpen(false)}>
                {label}
              </NavLink>
            ),
          )}
        </nav>
        <div className="nav-drawer-actions">
          {loggedIn ? (
            <Link to="/dashboard" className="btn btn-ghost" onClick={() => setOpen(false)}>Dashboard</Link>
          ) : (
            <Link to="/login" className="btn btn-ghost" onClick={() => setOpen(false)}>Log in</Link>
          )}
          <Link to="/signup" className="btn btn-accent" onClick={() => setOpen(false)}>
            {CTA.primaryLong}
          </Link>
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="nav-drawer-backdrop"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
