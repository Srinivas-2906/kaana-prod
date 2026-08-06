import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { trackerClerkAppearance } from '../lib/clerkAppearance';
import { isClerkEnabled, setTokenGetter } from '../lib/auth';

function ClerkSession({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    setTokenGetter(async () => {
      try {
        return await getToken();
      } catch {
        return null;
      }
    });

    if (!isSignedIn) {
      setSessionReady(true);
      return;
    }

    let active = true;
    (async () => {
      const token = await getToken();
      if (active) setSessionReady(Boolean(token));
    })();

    return () => {
      active = false;
    };
  }, [getToken, isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="login-page">
        <p className="muted">Loading session…</p>
      </div>
    );
  }

  if (isSignedIn && !sessionReady) {
    return (
      <div className="login-page">
        <p className="muted">Loading session…</p>
      </div>
    );
  }

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
      appearance={trackerClerkAppearance}
    >
      <ClerkSession>{children}</ClerkSession>
    </ClerkProvider>
  );
}
