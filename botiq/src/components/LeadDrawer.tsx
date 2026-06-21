import type { Conversation } from '../types';

interface LeadDrawerProps {
  open: boolean;
  onClose: () => void;
  active: Conversation;
  takenOver: boolean;
  onTakeOver: () => void;
  onFollowUp: () => void;
  onViewCRM: () => void;
}

export function LeadDrawer({
  open, onClose, active, takenOver, onTakeOver, onFollowUp, onViewCRM,
}: LeadDrawerProps) {
  return (
    <>
      <div className={`drawer-backdrop ${open ? 'open' : ''}`} onClick={onClose} role="presentation" />
      <aside className={`lead-drawer ${open ? 'open' : ''}`}>
        <div className="drawer-head">
          <div>
            <span className="drawer-eyebrow"><i className="ti ti-sparkles ai-sparkle" /> Lead intelligence</span>
            <h3>{active.name}</h3>
          </div>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Close">
            <i className="ti ti-x" />
          </button>
        </div>

        <div className="drawer-confidence">
          <div className="conf-ring-lg">
            <svg viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(124,58,237,0.15)" strokeWidth="2.5" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#6D28D9" strokeWidth="2.5" strokeDasharray={`${active.lead.confidence}, 100`} />
            </svg>
            <div className="conf-ring-text">
              <strong>{active.lead.confidence}%</strong>
              <span>AI match</span>
            </div>
          </div>
          <div className="drawer-intent-card">
            <span>Intent</span>
            <strong>{active.lead.intent}</strong>
            <span className="stage-chip">{active.lead.stage}</span>
          </div>
        </div>

        <dl className="drawer-meta">
          <div><dt>Phone</dt><dd>{active.phone}</dd></div>
          <div><dt>Channel</dt><dd className="cap">{active.channel}</dd></div>
          <div><dt>Messages</dt><dd>{active.messages.length}</dd></div>
          <div><dt>Resolution</dt><dd>{active.stats.resolution}</dd></div>
          <div><dt>Time to book</dt><dd>{active.stats.timeToBook}</dd></div>
        </dl>

        <div className="drawer-actions">
          <button type="button" className="btn-primary full" onClick={onTakeOver} disabled={takenOver}>
            <i className="ti ti-user-plus" /> Assign agent
          </button>
          <button type="button" className="btn-secondary full" onClick={onFollowUp}>
            <i className="ti ti-send" /> Send follow-up
          </button>
          <button type="button" className="btn-secondary accent full" onClick={onViewCRM}>
            <i className="ti ti-external-link" /> Open in CRM
          </button>
        </div>
      </aside>
    </>
  );
}
