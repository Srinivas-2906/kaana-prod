import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  CheckSquare,
  CalendarDays,
  Presentation,
  MessagesSquare,
  List,
  Compass,
  LogOut,
} from 'lucide-react';
import { logout } from '../lib/auth';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Hub', end: true },
  { to: '/projects', icon: Layers, label: 'Projects' },
  { to: '/daybook', icon: BookOpen, label: 'Daybook' },
  { to: '/my-work', icon: CheckSquare, label: 'My work' },
  { section: 'Work' },
  { to: '/plan', icon: CalendarDays, label: 'Plan' },
  { to: '/whiteboards', icon: Presentation, label: 'Whiteboards' },
  { to: '/discussions', icon: MessagesSquare, label: 'Discussions' },
  { section: 'Finance' },
  { to: '/transactions', icon: List, label: 'Transactions' },
];

export function AppShell() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon"><Compass size={18} /></div>
          <div>
            <strong>Kaana Tracker</strong>
            <div className="muted">Idea-to-outcome hub</div>
          </div>
        </div>
        {NAV.map((item, i) =>
          'section' in item ? (
            <div key={i} className="muted" style={{ padding: '0.75rem 0.75rem 0.25rem', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase' }}>
              {item.section}
            </div>
          ) : (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ),
        )}
        <button type="button" className="nav-link" style={{ marginTop: 'auto', border: 'none', background: 'none', width: '100%', cursor: 'pointer', color: '#dc2626' }} onClick={logout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>
      <div className="main-area">
        <Outlet />
      </div>
    </div>
  );
}
