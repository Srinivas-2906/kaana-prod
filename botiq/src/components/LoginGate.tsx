import { isAuthenticated, logout, requestSSOFromPlatform } from '../lib/auth';
import { useEffect } from 'react';

const PLATFORM = import.meta.env.VITE_PLATFORM_URL || 'http://localhost:5180';

export function LoginGate({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!isAuthenticated() && window.opener) requestSSOFromPlatform();
  }, []);

  if (!isAuthenticated()) {
    return (
      <div className="login-gate">
        <div className="login-gate-card">
          <img
            src="/botiq-wordmark.png"
            alt="Bot IQ — A product of Kaana AI Technologies"
            className="login-gate-wordmark"
            width={280}
            height={80}
          />
          <p className="login-gate-tagline">
            Sign in with your Kaana account to access your WhatsApp inbox, templates, and automation.
          </p>
          <p className="login-gate-sub">Kaana AI Technologies</p>
          <a href={`${PLATFORM}/login`} className="login-gate-btn">
            Log in to continue
          </a>
          <a href={`${PLATFORM}/signup`} className="login-gate-link">
            New here? Start setup on Kaana
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export { logout };
