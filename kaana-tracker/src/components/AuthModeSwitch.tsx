import { Link } from 'react-router-dom';
import { CLERK_SIGN_IN_URL, CLERK_SIGN_UP_URL } from '../lib/clerkAuth';

export function AuthModeSwitch({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  if (mode === 'sign-in') {
    return (
      <p className="auth-mode-switch muted">
        Don&apos;t have an account?{' '}
        <Link to={CLERK_SIGN_UP_URL}>Sign up</Link>
      </p>
    );
  }

  return (
    <p className="auth-mode-switch muted">
      Already have an account?{' '}
      <Link to={CLERK_SIGN_IN_URL}>Sign in</Link>
    </p>
  );
}
