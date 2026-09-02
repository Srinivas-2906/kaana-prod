import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type PublicShellProps = {
  children: ReactNode;
  /** Hide marketing nav CTAs on auth pages */
  minimal?: boolean;
};

export function PublicShell({ children, minimal = false }: PublicShellProps) {
  return (
    <div className="public-shell">
      <header className="public-header">
        <Link to="/" className="public-brand">
          <span className="public-brand-icon">K</span>
          <span>Kaana Tracker</span>
        </Link>
        {!minimal && (
          <nav className="public-nav">
            <Link to="/login?redirect_url=/calculator" className="btn btn-ghost">Try calculator</Link>
            <Link to="/login" className="btn btn-ghost">Sign in</Link>
            <Link to="/sign-up" className="btn btn-primary">Start tracking</Link>
          </nav>
        )}
      </header>
      <main className="public-main">{children}</main>
      <footer className="public-footer">
        <div className="public-footer-inner">
          <p className="muted">© {new Date().getFullYear()} Kaana</p>
          <div className="public-footer-links">
            <a href="https://kaana.in/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy</a>
            <a href="https://kaana.in/terms-of-service" target="_blank" rel="noopener noreferrer">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
