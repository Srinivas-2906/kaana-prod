interface MainTopbarProps {
  view: string;
}

const titles: Record<string, { title: string; sub: string }> = {
  overview: { title: 'Overview', sub: 'PropBot · Real estate' },
  conversations: { title: 'Conversations', sub: '8 active threads · 3 need attention' },
  builder: { title: 'Bot builder', sub: 'PropBot enquiry flow' },
  analytics: { title: 'Analytics', sub: 'Last 14 days' },
  settings: { title: 'Settings', sub: 'Channels & personality' },
};

export function MainTopbar({ view }: MainTopbarProps) {
  const info = titles[view] ?? titles.conversations;

  return (
    <header className="main-topbar">
      <div className="topbar-left">
        <h1>{info.title}</h1>
        <p>{info.sub}</p>
      </div>
      <div className="topbar-stats">
        <div className="topbar-stat">
          <span className="topbar-stat-val">847</span>
          <span className="topbar-stat-lbl">Today</span>
        </div>
        <div className="topbar-stat accent">
          <span className="topbar-stat-val">1.2s</span>
          <span className="topbar-stat-lbl">Avg reply</span>
        </div>
        <div className="topbar-stat success">
          <span className="topbar-stat-val">78%</span>
          <span className="topbar-stat-lbl">Auto-resolved</span>
        </div>
      </div>
      <div className="topbar-right">
        <div className="bot-status-pill">
          <span className="pulse-dot" />
          PropBot live
        </div>
        <button type="button" className="topbar-icon-btn" title="Notifications">
          <i className="ti ti-bell" />
          <span className="notif-dot" />
        </button>
      </div>
    </header>
  );
}
