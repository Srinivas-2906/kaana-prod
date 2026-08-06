import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

export function SsoCallbackPage() {
  return (
    <div className="login-page">
      <p className="muted">Completing sign in…</p>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
