import { isAuthenticated, requestSSOFromPlatform } from '../lib/auth';
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
          <h1>Kaana CRM</h1>
          <p>Sign in with your Kaana account to manage leads from WhatsApp.</p>
          <a href={`${PLATFORM}/login`} className="login-gate-btn">Log in to Kaana</a>
          <a href={`${PLATFORM}/signup`} className="login-gate-link">Start setup</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
