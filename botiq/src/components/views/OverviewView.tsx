interface OverviewViewProps {
  onNavigate: () => void;
}

export function OverviewView({ onNavigate }: OverviewViewProps) {
  return (
    <div className="overview-view page-fade">
      <div className="overview-hero">
        <div className="hero-badge"><i className="ti ti-sparkles ai-sparkle" /> AI-powered · 3 channels</div>
        <h1>Never miss a customer. Ever.</h1>
        <p>
          PropBot handles property enquiries on WhatsApp, web chat, and SMS —
          and turns them into booked site visits, around the clock.
        </p>
        <div className="hero-stats-row">
          <div className="hero-stat"><strong>1,247</strong><span>Conversations</span></div>
          <div className="hero-stat"><strong>78%</strong><span>Auto-resolved</span></div>
          <div className="hero-stat"><strong>89</strong><span>Leads this week</span></div>
          <div className="hero-stat"><strong>1.2s</strong><span>Avg response</span></div>
        </div>
        <button type="button" className="btn-primary" onClick={onNavigate}>
          Open inbox <i className="ti ti-arrow-right" />
        </button>
      </div>

      <div className="overview-cards">
        <div className="overview-card">
          <div className="oc-icon wa"><i className="ti ti-brand-whatsapp" /></div>
          <h3>WhatsApp</h3>
          <p>58% of enquiries · Property cards · Instant replies</p>
          <div className="channel-bar wa"><div style={{ width: '58%' }} /></div>
        </div>
        <div className="overview-card">
          <div className="oc-icon web"><i className="ti ti-message-circle" /></div>
          <h3>Web Chat</h3>
          <p>Embedded on your site · 31% of traffic</p>
          <div className="channel-bar web"><div style={{ width: '31%' }} /></div>
        </div>
        <div className="overview-card">
          <div className="oc-icon sms"><i className="ti ti-message" /></div>
          <h3>SMS</h3>
          <p>Confirmations & follow-ups · 11% share</p>
          <div className="channel-bar sms"><div style={{ width: '11%' }} /></div>
        </div>
      </div>
    </div>
  );
}
