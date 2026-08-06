import { Navigate } from 'react-router-dom';
import { AuthModeSwitch } from '../components/AuthModeSwitch';
import { ClerkSignUpForm } from '../components/ClerkAuthForms';
import { isClerkEnabled } from '../lib/auth';

export function SignUpPage() {
  if (!isClerkEnabled()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="login-page">
      <div className="card login-card">
        <h1 style={{ margin: '0 0 0.5rem' }}>Kaana Tracker</h1>
        <p className="muted" style={{ marginBottom: '1.5rem' }}>
          Create your account with email and password.
        </p>
        <ClerkSignUpForm />
        <AuthModeSwitch mode="sign-up" />
      </div>
    </div>
  );
}
