import type { Lead } from '../../types';
import { formatDate } from '../../utils/format';

interface CalendarViewProps {
  leads: Lead[];
}

export function CalendarView({ leads }: CalendarViewProps) {
  const events = leads
    .filter((l) => l.followup === 'Today' || l.followup === 'Tomorrow')
    .map((l) => ({ ...l, when: l.followup }));

  return (
    <div className="calendar-view panel">
      <h3>Upcoming follow-ups</h3>
      {events.length === 0 ? (
        <div className="empty-state">No events on the calendar this week.</div>
      ) : (
        events.map((e) => (
          <div key={e.id} className="calendar-event">
            <div className="calendar-date">{e.when}</div>
            <div>
              <div className="cell-name">{e.name}</div>
              <div className="meta">{e.prop} · Last contacted {formatDate(e.lastContacted)}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
