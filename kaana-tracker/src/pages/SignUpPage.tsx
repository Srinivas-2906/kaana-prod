import { SignUp } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { isClerkEnabled } from '../lib/auth';

export function SignUpPage() {
  if (!isClerkEnabled()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="login-page">
      <div className="card login-card clerk-auth-card">
        <h1 style={{ margin: '0 0 0.5rem' }}>Kaana Tracker</h1>
        <p className="muted" style={{ marginBottom: '1.5rem' }}>Create your workspace account</p>
        <SignUp routing="path" path="/sign-up" signInUrl="/login" forceRedirectUrl="/" />
      </div>
    </div>
  );
}
