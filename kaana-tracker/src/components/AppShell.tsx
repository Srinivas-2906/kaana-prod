import { FormEvent, useCallback, useEffect, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  CheckSquare,
  CalendarDays,
  Wallet,
  Compass,
  LogOut,
  Pencil,
  PenSquare,
  MessageSquare,
  Search,
  Calculator,
  Menu,
  X,
} from 'lucide-react';
import { fetchMe, updateMe } from '../lib/api';
import { logout } from '../lib/auth';
import type { User } from '../types';
import { NotificationBell } from './NotificationBell';
import { SearchDialog } from './SearchDialog';

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
  { to: '/whiteboards', icon: PenSquare, label: 'Whiteboards' },
  { to: '/discussions', icon: MessageSquare, label: 'Discussions' },
  { to: '/transactions', icon: Wallet, label: 'Expenses' },
  { to: '/calculator', icon: Calculator, label: 'Calculator' },
];

function LogoutButton() {
  return (
    <button
      type="button"
      className="nav-link nav-link-logout"
      onClick={logout}
    >
      <LogOut size={18} /> Logout
    </button>
  );
}

type SidebarNavProps = {
  onNavigate?: () => void;
  onSearch: () => void;
};

function SidebarNav({ onNavigate, onSearch }: SidebarNavProps) {
  return (
    <>
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon"><Compass size={18} /></div>
        <div>
          <strong>Kaana Tracker</strong>
          <div className="muted">Work · Calendar · Expenses</div>
        </div>
      </div>
      <div className="sidebar-toolbar">
        <button type="button" className="sidebar-search-btn" onClick={onSearch}>
          <Search size={16} />
          <span>Search</span>
          <kbd className="sidebar-search-kbd">Ctrl K</kbd>
        </button>
        <NotificationBell />
      </div>
      <nav className="sidebar-nav" aria-label="Main">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={onNavigate}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <TrackerAccountBadge />
        <LogoutButton />
      </div>
    </>
  );
}

export function AppShell({ children }: { children?: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setNavOpen(false);
        setSearchOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle('mobile-nav-open', navOpen);
    return () => document.body.classList.remove('mobile-nav-open');
  }, [navOpen]);

  function openSearch() {
    setSearchOpen(true);
    setNavOpen(false);
  }

  return (
    <div className={`app-shell${navOpen ? ' nav-open' : ''}`}>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <button
        type="button"
        className="sidebar-backdrop"
        aria-label="Close menu"
        onClick={() => setNavOpen(false)}
      />
      <aside className="sidebar" aria-label="Navigation">
        <button
          type="button"
          className="sidebar-close-btn"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
        >
          <X size={20} />
        </button>
        <SidebarNav onNavigate={() => setNavOpen(false)} onSearch={openSearch} />
      </aside>
      <div className="main-area">
        <header className="mobile-header">
          <button
            type="button"
            className="mobile-menu-btn btn btn-ghost"
            aria-label="Open menu"
            aria-expanded={navOpen}
            onClick={() => setNavOpen(true)}
          >
            <Menu size={20} />
          </button>
          <NavLink to="/" className="mobile-header-brand" onClick={() => setNavOpen(false)}>
            Kaana Tracker
          </NavLink>
          <div className="mobile-header-actions">
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              aria-label="Search"
              onClick={openSearch}
            >
              <Search size={18} />
            </button>
            <NotificationBell />
          </div>
        </header>
        {children ?? <Outlet />}
      </div>
    </div>
  );
}
