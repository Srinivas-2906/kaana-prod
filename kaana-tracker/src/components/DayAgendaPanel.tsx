import { Link } from 'react-router-dom';
import type { DayAgenda } from '../types';
import { statusLabel } from '../types';

export function DayAgendaPanel({ agenda, daybookLink }: { agenda: DayAgenda; daybookLink?: string }) {
  return (
    <div className="agenda-grid">
      {(['ideas', 'stories', 'tasks', 'work'] as const).map((key) => (
        <div key={key}>
          <h4 className="agenda-heading">{key}</h4>
          {agenda[key].length ? agenda[key].map((item) => (
            <Link key={item.id} to={`/work/${item.id}`} className="agenda-item">
              <span className="agenda-item-title">{item.title}</span>
              <span className="muted agenda-item-meta">
                {item.cluster_name && `${item.cluster_name} · `}
                {statusLabel(item.status)}
                {item.start_date && item.due_date && item.start_date !== item.due_date && (
                  <> · {item.start_date} → {item.due_date}</>
                )}
              </span>
            </Link>
          )) : <p className="muted">None</p>}
        </div>
      ))}
      <div>
        <h4 className="agenda-heading">Board ideas</h4>
        {agenda.board_ideas.length ? agenda.board_ideas.map((n) => (
          <Link key={n.id} to={`/whiteboards/${n.whiteboard_id}`} className="agenda-item">
            <span className="agenda-item-title">{n.content.slice(0, 80)}</span>
            {n.board_title && <span className="muted agenda-item-meta">{n.board_title}</span>}
          </Link>
        )) : <p className="muted">None</p>}
      </div>
      {daybookLink && (
        <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
          <Link to={daybookLink} className="btn btn-ghost">Open full daybook →</Link>
        </div>
      )}
    </div>
  );
}
