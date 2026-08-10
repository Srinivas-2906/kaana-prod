import { FormEvent, useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import {
  LayoutDashboard,
  Layers,
  CheckSquare,
  CalendarDays,
  Wallet,
  Compass,
  LogOut,
  Pencil,
} from 'lucide-react';
import { fetchMe, updateMe } from '../lib/api';
import { isClerkEnabled, legacyLogout } from '../lib/auth';
import type { User } from '../types';

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '?';
}

function TrackerAccountBadge() {
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadUser = useCallback(() => {
    fetchMe().then((r) => setUser(r.user)).catch(() => setUser(null));
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    const name = nameDraft.trim();
    if (!name) return;
    setBusy(true);
    setError('');
    try {
      const result = await updateMe({ name });
      setUser(result.user);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update name');
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return (
      <div className="sidebar-account">
        <div className="sidebar-account-text"><span className="muted">Loading account…</span></div>
      </div>
    );
  }

  return (
    <div className="sidebar-account">
      <div className="sidebar-account-avatar" aria-hidden>{initials(user.name)}</div>
      <div className="sidebar-account-text">
        {editing ? (
          <form className="sidebar-account-edit" onSubmit={onSave}>
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              maxLength={100}
              autoFocus
              disabled={busy}
              aria-label="Display name"
            />
            <div className="sidebar-account-edit-actions">
              <button type="submit" className="btn btn-primary btn-compact" disabled={busy || !nameDraft.trim()}>
                Save
              </button>
              <button type="button" className="btn btn-ghost btn-compact" disabled={busy} onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
            {error && <span className="sidebar-account-error">{error}</span>}
          </form>
        ) : (
          <>
            <div className="sidebar-account-name-row">
              <strong title={user.name}>{user.name}</strong>
              <button
                type="button"
                className="sidebar-account-edit-btn"
                title="Edit display name"
                aria-label="Edit display name"
                onClick={() => {
                  setNameDraft(user.name);
                  setEditing(true);
                  setError('');
                }}
              >
                <Pencil size={12} />
              </button>
            </div>
            {user.email && <span className="muted">{user.email}</span>}
          </>
        )}
      </div>
    </div>
  );
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
          <TrackerAccountBadge />
          {isClerkEnabled() ? <LogoutButtonClerk /> : <LogoutButtonLegacy />}
        </div>
      </aside>
      <div className="main-area">
        <div className="mobile-account-bar">
          <TrackerAccountBadge />
        </div>
        <Outlet />
      </div>
    </div>
  );
}
