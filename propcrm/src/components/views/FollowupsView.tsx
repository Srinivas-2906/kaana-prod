import type { Lead } from '../../types';

interface FollowupsViewProps {
  leads: Lead[];
  onOpen: (id: number) => void;
}

export function FollowupsView({ leads, onOpen }: FollowupsViewProps) {
  const queue = [...leads]
    .filter((l) => ['Today', 'Tomorrow'].includes(l.followup) || l.score >= 75)
    .sort((a, b) => (a.followup === 'Today' ? 0 : 1) - (b.followup === 'Today' ? 0 : 1) || b.score - a.score);

  if (queue.length === 0) {
    return <div className="empty-state panel">No follow-ups scheduled. You're all caught up!</div>;
  }

  return (
    <div className="cards-grid">
      {queue.map((l) => (
        <div key={l.id} className={`follow-card panel ${l.followup === 'Today' ? 'urgent' : ''}`}>
          <h4>{l.name}</h4>
          <div className="meta">{l.prop}</div>
          <div className="meta">Due: {l.followup} · Score {l.score}</div>
          <div className="meta">Agent: {l.assignedAgent}</div>
          <button type="button" className="btn btn-primary btn-block" style={{ marginTop: 12 }} onClick={() => onOpen(l.id)}>
            Open lead
          </button>
        </div>
      ))}
    </div>
  );
}
