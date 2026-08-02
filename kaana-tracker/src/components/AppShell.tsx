import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  CheckSquare,
  CalendarDays,
  Wallet,
  Compass,
  LogOut,
} from 'lucide-react';
import { logout } from '../lib/auth';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Hub', end: true },
  { to: '/projects', icon: Layers, label: 'Projects' },
  { to: '/my-work', icon: CheckSquare, label: 'My work' },
  { to: '/plan', icon: CalendarDays, label: 'Calendar' },
  { to: '/transactions', icon: Wallet, label: 'Expenses' },
];

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
