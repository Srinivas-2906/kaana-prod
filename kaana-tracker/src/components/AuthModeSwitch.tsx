import { Link, useSearchParams } from 'react-router-dom';
import { CLERK_SIGN_IN_URL, CLERK_SIGN_UP_URL } from '../lib/clerkAuth';

export function AuthModeSwitch({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const [params] = useSearchParams();
  const redirectUrl = params.get('redirect_url');
  const qs = redirectUrl ? `?redirect_url=${encodeURIComponent(redirectUrl)}` : '';

  if (mode === 'sign-in') {
    return (
      <p className="auth-mode-switch muted">
        Don&apos;t have an account?{' '}
        <Link to={`${CLERK_SIGN_UP_URL}${qs}`}>Sign up</Link>
      </p>
    );
  }

  return (
    <p className="auth-mode-switch muted">
      Already have an account?{' '}
      <Link to={`${CLERK_SIGN_IN_URL}${qs}`}>Sign in</Link>
    </p>
  );
}
