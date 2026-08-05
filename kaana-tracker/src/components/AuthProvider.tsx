import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { isClerkEnabled, setTokenGetter } from '../lib/auth';

function TokenBridge({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    setTokenGetter(() => getToken());
  }, [getToken, isLoaded]);

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!isClerkEnabled() || !publishableKey) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInUrl="/login"
      signUpUrl="/sign-up"
      afterSignOutUrl="/login"
    >
      <TokenBridge>{children}</TokenBridge>
    </ClerkProvider>
  );
}
