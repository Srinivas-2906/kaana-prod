import type { ReactNode } from 'react';
import type { ViewId } from '../../types';

const icons: Record<ViewId, ReactNode> = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  properties: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21h18M5 21V7l7-4 7 4v14" />
    </svg>
  ),
  leads: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  followups: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
    </svg>
  ),
  calendar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  reports: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19V5M10 19V9M16 19V13M22 19V7" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
};

const navItems: { id: ViewId; label: string; badge?: number }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'properties', label: 'Properties' },
  { id: 'leads', label: 'Leads' },
  { id: 'followups', label: 'Follow-ups', badge: 3 },
  { id: 'calendar', label: 'Calendar' },
  { id: 'reports', label: 'Reports' },
  { id: 'settings', label: 'Settings' },
];

interface SidebarProps {
  active: ViewId;
  collapsed: boolean;
  onNavigate: (view: ViewId) => void;
  onToggle: () => void;
  leadCount: number;
}

export function Sidebar({ active, collapsed, onNavigate, onToggle, leadCount }: SidebarProps) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
          </svg>
        </div>
        {!collapsed && (
          <div>
            <div className="brand-title">Kaana CRM</div>
            <div className="brand-sub">Real estate</div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar-link ${active === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            title={item.label}
          >
            {icons[item.id]}
            {!collapsed && (
              <>
                <span>{item.label}</span>
                {item.id === 'leads' && <span className="nav-pill">{leadCount}</span>}
                {item.badge && item.id !== 'leads' && <span className="nav-pill">{item.badge}</span>}
              </>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="kaana-watermark">
            <span className="kaana-dot" />
            Powered by <strong>Kaana AI</strong>
          </div>
        )}
        <button type="button" className="collapse-btn" onClick={onToggle} aria-label="Toggle sidebar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {collapsed ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
          </svg>
        </button>
      </div>
    </aside>
  );
}
