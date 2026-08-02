import type { ChannelId } from '../types';

interface SidebarProps {
  active: string;
  onNavigate: (view: string) => void;
  onAbout: () => void;
}

const navItems = [
  { id: 'overview', icon: 'ti-layout-dashboard', label: 'Overview' },
  { id: 'conversations', icon: 'ti-message-chatbot', label: 'Inbox', badge: 3 },
  { id: 'builder', icon: 'ti-robot', label: 'Builder' },
  { id: 'analytics', icon: 'ti-chart-dots', label: 'Analytics' },
  { id: 'settings', icon: 'ti-settings-2', label: 'Settings' },
];

export function Sidebar({ active, onNavigate, onAbout }: SidebarProps) {
  return (
    <aside className="icon-rail">
      <div className="rail-brand" title="BotIQ by Kaana AI">
        <div className="rail-logo"><i className="ti ti-robot" /></div>
      </div>

      <nav className="rail-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`rail-btn ${active === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            title={item.label}
            data-label={item.label}
          >
            <i className={`ti ${item.icon}`} />
            {'badge' in item && item.badge ? <span className="rail-badge">{item.badge}</span> : null}
          </button>
        ))}
      </nav>

      <div className="rail-bottom">
        <button type="button" className="rail-bot active" title="PropBot · Live">
          🏠
          <span className="rail-live" />
        </button>
        <button type="button" className="rail-btn" onClick={onAbout} title="About">
          <i className="ti ti-help" />
        </button>
        <button type="button" className="rail-avatar" title="Arun Kaana">
          AK
        </button>
      </div>
    </aside>
  );
}

export function channelIcon(ch: ChannelId) {
  if (ch === 'whatsapp') return 'ti-brand-whatsapp';
  if (ch === 'web') return 'ti-message-circle';
  return 'ti-message';
}
