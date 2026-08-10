import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/clerk-react';
import {
  LayoutDashboard,
  Layers,
  CheckSquare,
  CalendarDays,
  Wallet,
  Compass,
  LogOut,
} from 'lucide-react';
import { fetchMe } from '../lib/api';
import { isClerkEnabled, legacyLogout } from '../lib/auth';
import type { User } from '../types';

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '?';
}

function AccountBadge({ name, email }: { name: string; email?: string | null }) {
  return (
    <div className="sidebar-account" title={email || name}>
      <div className="sidebar-account-avatar" aria-hidden>{initials(name)}</div>
      <div className="sidebar-account-text">
        <strong>{name}</strong>
        {email && <span className="muted">{email}</span>}
      </div>
    </div>
  );
}

function AccountBadgeClerk() {
  const { isLoaded, user } = useUser();
  if (!isLoaded) {
    return (
      <div className="sidebar-account">
        <div className="sidebar-account-text"><span className="muted">Loading account…</span></div>
      </div>
    );
  }

  const name = user?.fullName || user?.firstName || user?.username || 'Account';
  const email = user?.primaryEmailAddress?.emailAddress || null;
  return <AccountBadge name={name} email={email} />;
}

function AccountBadgeLegacy() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchMe().then((r) => setUser(r.user)).catch(() => setUser(null));
  }, []);

  if (!user) {
    return (
      <div className="sidebar-account">
        <div className="sidebar-account-text"><span className="muted">Signed in</span></div>
      </div>
    );
  }

  return <AccountBadge name={user.name} email={user.email} />;
}

function SidebarAccount() {
  return isClerkEnabled() ? <AccountBadgeClerk /> : <AccountBadgeLegacy />;
}

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Hub', end: true },
  { to: '/projects', icon: Layers, label: 'Projects' },
  { to: '/my-work', icon: CheckSquare, label: 'My work' },
  { to: '/plan', icon: CalendarDays, label: 'Calendar' },
  { to: '/transactions', icon: Wallet, label: 'Expenses' },
];

function LogoutButtonClerk() {
  const { signOut } = useClerk();
  return (
    <button
      type="button"
      className="nav-link"
      style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer', color: '#dc2626' }}
      onClick={() => signOut({ redirectUrl: '/login' })}
    >
      <LogOut size={18} /> Logout
    </button>
  );
}

function LogoutButtonLegacy() {
  return (
    <button
      type="button"
      className="nav-link"
      style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer', color: '#dc2626' }}
      onClick={legacyLogout}
    >
      <LogOut size={18} /> Logout
    </button>
  );
}

export function AppShell() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon"><Compass size={18} /></div>
          <div>
            <strong>Kaana Tracker</strong>
            <div className="muted">Work · Calendar · Expenses</div>
          </div>
        </div>
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
        <div className="sidebar-footer">
          <SidebarAccount />
          {isClerkEnabled() ? <LogoutButtonClerk /> : <LogoutButtonLegacy />}
        </div>
      </aside>
      <div className="main-area">
        <div className="mobile-account-bar">
          <SidebarAccount />
        </div>
        <Outlet />
      </div>
    </div>
  );
}
