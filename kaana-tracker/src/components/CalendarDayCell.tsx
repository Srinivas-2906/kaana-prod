import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { CalendarDayGlimpses } from '../types';

const TYPE_ICON: Record<string, string> = {
  work: '▸',
  idea: '💡',
  finance: '₹',
  reminder: '🔔',
  discussion: '💬',
  decision: '⚖',
  created: '＋',
  status: '↔',
  updated: '✎',
  activity: '•',
  attachment: '📎',
};

function heatLevel(count: number) {
  if (count >= 8) return 4;
  if (count >= 5) return 3;
  if (count >= 3) return 2;
  if (count >= 1) return 1;
  return 0;
}

export function CalendarDayCell({
  dayNum,
  inMonth,
  isSelected,
  isToday,
  glimpse,
  activityCount = 0,
  onSelect,
}: {
  dayNum: number;
  inMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  glimpse?: CalendarDayGlimpses;
  activityCount?: number;
  onSelect: () => void;
}) {
  const items = glimpse?.items ?? [];
  const overflow = glimpse?.overflow ?? 0;
  const heat = heatLevel(activityCount || glimpse?.activityCount || 0);

  return (
    <button
      type="button"
      className={`calendar-cell${inMonth ? '' : ' muted-cell'}${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}${items.length ? ' has-items' : ''}${heat ? ` heat-${heat}` : ''}`}
      onClick={onSelect}
    >
      <div className="calendar-cell-top">
        <span className="calendar-day">{dayNum}</span>
        {glimpse && glimpse.total > 0 && (
          <span className="calendar-count">{glimpse.total}</span>
        )}
      </div>

      <div className="calendar-glimpses">
        {items.map((g, i) => {
          const inner = (
            <>
              <span className="glimpse-icon">{TYPE_ICON[g.type] || '·'}</span>
              <span className="glimpse-text">
                <span className="glimpse-label">{g.label}</span>
                {g.sub && <span className="glimpse-sub">{g.sub}</span>}
              </span>
            </>
          );
          const cls = `calendar-glimpse calendar-glimpse-${g.type}`;
          const style: CSSProperties = {};
          if (g.color) {
            if (g.type === 'finance') {
              style.borderLeftColor = g.color;
              style.background = g.color === '#16a34a' ? '#dcfce7' : '#fee2e2';
            } else {
              style.borderLeftColor = g.color;
            }
          }

          if (g.link) {
            return (
              <Link
                key={i}
                to={g.link}
                className={cls}
                style={style}
                onClick={(e) => e.stopPropagation()}
              >
                {inner}
              </Link>
            );
          }
          return (
            <div key={i} className={cls} style={style}>
              {inner}
            </div>
          );
        })}
        {overflow > 0 && (
          <div className="calendar-glimpse-more muted">+{overflow} more</div>
        )}
      </div>
    </button>
  );
}
