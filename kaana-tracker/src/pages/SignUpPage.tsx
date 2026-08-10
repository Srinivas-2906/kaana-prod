import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth, SignUp } from '@clerk/clerk-react';
import { isClerkEnabled } from '../lib/auth';
import { authUrlWithRedirect, CLERK_SIGN_IN_URL, safeRedirectUrl } from '../lib/clerkAuth';

export function SignUpPage() {
  if (!isClerkEnabled()) {
    return <Navigate to="/login" replace />;
  }

  const { isLoaded, isSignedIn } = useAuth();
  const [params] = useSearchParams();
  const redirectUrl = safeRedirectUrl(params.get('redirect_url'));
  if (isLoaded && isSignedIn) return <Navigate to={redirectUrl} replace />;

  return (
    <div className="login-page">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl={authUrlWithRedirect(CLERK_SIGN_IN_URL, redirectUrl)}
        forceRedirectUrl={redirectUrl}
      />
    </div>
  );
}
