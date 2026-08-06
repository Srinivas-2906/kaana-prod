import { SignUp } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { AuthModeSwitch } from '../components/AuthModeSwitch';
import { CLERK_AFTER_AUTH_URL, CLERK_SIGN_IN_URL, CLERK_SIGN_UP_URL } from '../lib/clerkAuth';
import { trackerClerkAppearance } from '../lib/clerkAppearance';
import { isClerkEnabled } from '../lib/auth';

export function SignUpPage() {
  if (!isClerkEnabled()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="login-page">
      <div className="card login-card clerk-auth-card">
        <h1 style={{ margin: '0 0 0.5rem' }}>Kaana Tracker</h1>
        <p className="muted" style={{ marginBottom: '1.5rem' }}>
          Create your account with email and password — no email code required.
        </p>
        <SignUp
          routing="path"
          path={CLERK_SIGN_UP_URL}
          signInUrl={CLERK_SIGN_IN_URL}
          forceRedirectUrl={CLERK_AFTER_AUTH_URL}
          fallbackRedirectUrl={CLERK_AFTER_AUTH_URL}
          appearance={trackerClerkAppearance}
        />
        <AuthModeSwitch mode="sign-up" />
      </div>
    </div>
  );
}
