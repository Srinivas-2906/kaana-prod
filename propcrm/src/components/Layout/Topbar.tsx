interface TopbarProps {
  search: string;
  onSearch: (v: string) => void;
  onMenuToggle: () => void;
}

export function Topbar({ search, onSearch, onMenuToggle }: TopbarProps) {
  return (
    <header className="topbar">
      <button type="button" className="mobile-menu-btn" onClick={onMenuToggle} aria-label="Menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="search-wrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          className="search-input"
          type="search"
          placeholder="Search leads by name, phone, property..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Global search"
        />
      </div>

      <div className="topbar-right">
        <button type="button" className="icon-btn" aria-label="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 17H9l-1-4H5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2h-3l-1 4z" />
            <path d="M10 19a2 2 0 0 0 4 0" />
          </svg>
          <span className="notif-dot" />
        </button>
        <div className="avatar" title="Ravi Kapoor">RK</div>
      </div>
    </header>
  );
}
