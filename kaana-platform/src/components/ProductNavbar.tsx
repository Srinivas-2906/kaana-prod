import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { clearAuth, getToken } from '../lib/api';
import { INBOX_APP_URL } from '../lib/appShell';
import { BotIqLogo } from './BotIqLogo';
import './product-nav.css';

const PRODUCT_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/templates', label: 'Templates' },
] as const;

export function ProductNavbar() {
  const loggedIn = !!getToken();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const home = loggedIn ? '/dashboard' : '/login';

  useEffect(() => {
    setOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  function logout() {
    clearAuth();
    navigate('/login');
  }

  return (
    <>
      <header className="product-header">
        <div className="product-nav" data-open={open || undefined}>
          <div className="product-nav-inner">
            <BotIqLogo to={home} />

            <nav className="product-nav-links" aria-label="Product">
              {loggedIn &&
                PRODUCT_LINKS.map(({ to, label }) => (
                  <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
                    {label}
                  </NavLink>
                ))}
              {loggedIn && (
                <a href={INBOX_APP_URL} className="product-nav-external" target="_blank" rel="noreferrer">
                  Inbox
                </a>
              )}
            </nav>

            <div className="product-nav-actions">
              {!loggedIn ? (
                <>
                  <Link to="/login" className="btn btn-ghost nav-btn-sm">
                    Log in
                  </Link>
                  <Link to="/signup" className="btn btn-accent nav-btn-sm">
                    Start setup
                  </Link>
                </>
              ) : (
                <button type="button" className="btn btn-ghost nav-btn-sm" onClick={logout}>
                  Log out
                </button>
              )}

              <button
                type="button"
                className="product-nav-burger"
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className={`product-drawer ${open ? 'product-drawer-open' : ''}`} aria-hidden={!open}>
        <nav className="product-drawer-links" aria-label="Mobile product">
          {loggedIn &&
            PRODUCT_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} className="product-drawer-link" onClick={() => setOpen(false)}>
                {label}
              </NavLink>
            ))}
          {loggedIn && (
            <a
              href={INBOX_APP_URL}
              className="product-drawer-link"
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
            >
              Open inbox
            </a>
          )}
        </nav>
        <div className="product-drawer-actions">
          {!loggedIn ? (
            <>
              <Link to="/login" className="btn btn-ghost" onClick={() => setOpen(false)}>
                Log in
              </Link>
              <Link to="/signup" className="btn btn-accent" onClick={() => setOpen(false)}>
                Start setup
              </Link>
            </>
          ) : (
            <button type="button" className="btn btn-ghost" onClick={() => { setOpen(false); logout(); }}>
              Log out
            </button>
          )}
        </div>
      </div>

      {open && (
        <button
          type="button"
          className="product-drawer-backdrop"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
