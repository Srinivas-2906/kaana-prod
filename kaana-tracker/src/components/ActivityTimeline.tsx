import type { ActivityEvent } from '../types';

const EVENT_ICONS: Record<string, string> = {
  work_item_created: '✦',
  work_item_updated: '✎',
  status_changed: '↔',
  discussion_added: '💬',
  journal_added: '📓',
  decision_created: '⚖',
  decision_status_changed: '⚖',
  invite_created: '🔗',
  invite_sent: '✉',
  invite_accepted: '✓',
  invite_revoked: '✕',
  member_added: '👤',
  member_removed: '👤',
  idea_promoted: '→',
};

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  if (!events.length) return <p className="muted">No activity yet.</p>;

  return (
    <div className="activity-timeline">
      {events.map((e) => (
        <div key={e.id} className="activity-row">
          <span className="activity-icon">{EVENT_ICONS[e.event_type] || '·'}</span>
          <div className="activity-body">
            <p className="activity-summary">{e.summary}</p>
            <p className="muted activity-meta">
              {e.actor_name} · {new Date(e.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
