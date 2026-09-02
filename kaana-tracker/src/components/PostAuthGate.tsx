import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { fetchMe } from '../lib/api';
import type { User } from '../types';

type PostAuthGateProps = {
  children?: React.ReactNode;
};

export function PostAuthGate({ children }: PostAuthGateProps) {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMe()
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="post-auth-gate-loading">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (user?.needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (children) return <>{children}</>;
  return <Outlet />;
}
