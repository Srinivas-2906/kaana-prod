import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchCalendarGlimpses, fetchIdeaPool, fetchProjects, promoteNoteToWork, scheduleWhiteboardNote,
} from '../lib/api';
import {
  addMonths, calendarDays, formatMonthLabel, monthEnd, monthStart, todayISO,
} from '../lib/dates';
import { usePlanParams } from '../hooks/usePlanParams';
import { CalendarDayCell } from './CalendarDayCell';
import { DayDetailPanel } from './DayDetailPanel';
import { PlanQuickAddForm } from './PlanQuickAddForm';
import type { CalendarDayGlimpses, Project, WhiteboardNote } from '../types';
import { WORK_ITEM_TYPES } from '../types';

type PlanViewProps = {
  fixedProjectId?: number;
  showProjectFilter?: boolean;
  showIdeaPool?: boolean;
  headerExtra?: React.ReactNode;
};

export function PlanView({
  fixedProjectId,
  showProjectFilter = true,
  showIdeaPool = true,
  headerExtra,
}: PlanViewProps) {
  const plan = usePlanParams({ fixedProjectId });
  const { date, month, projectId, itemType, setDate, setMonth, setProjectId, setItemType } = plan;

  const [glimpses, setGlimpses] = useState<Record<string, CalendarDayGlimpses>>({});
  const [heat, setHeat] = useState<Record<string, number>>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [ideaPool, setIdeaPool] = useState<WhiteboardNote[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const reload = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (showProjectFilter && !fixedProjectId) {
      fetchProjects().then((r) => setProjects(r.projects)).catch(console.error);
    }
  }, [showProjectFilter, fixedProjectId]);

  useEffect(() => {
    const from = monthStart(month);
    const to = monthEnd(month);
    fetchCalendarGlimpses(from, to, projectId, itemType || undefined)
      .then((r) => {
        setGlimpses(r.glimpses);
        setHeat(r.heat || {});
      })
      .catch(console.error);
  }, [month, projectId, itemType, refreshKey]);

  useEffect(() => {
    if (!showIdeaPool) return;
    fetchIdeaPool(8).then((r) => setIdeaPool(r.notes)).catch(console.error);
  }, [showIdeaPool, refreshKey]);

  const days = calendarDays(month);

  async function onScheduleNote(noteId: number) {
    await scheduleWhiteboardNote(noteId, date);
    reload();
  }

  async function onPromoteNote(noteId: number) {
    await promoteNoteToWork(noteId, {
      cluster_id: projectId || null,
      due_date: date,
      start_date: date,
    });
    reload();
  }

  return (
    <>
      {headerExtra}
      <div className="plan-toolbar">
        {showProjectFilter && !fixedProjectId && (
          <select value={projectId ?? ''} onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : undefined)}>
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
        <select value={itemType} onChange={(e) => setItemType(e.target.value)}>
          <option value="">All types</option>
          {WORK_ITEM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button type="button" className="btn btn-ghost" onClick={() => setMonth(addMonths(month, -1))}>←</button>
        <strong>{formatMonthLabel(month)}</strong>
        <button type="button" className="btn btn-ghost" onClick={() => setMonth(addMonths(month, 1))}>→</button>
        <button type="button" className="btn btn-ghost" onClick={() => setDate(todayISO())}>Today</button>
      </div>

      <div className="calendar-legend muted">
        <span>Activity heat = darker green on busy days</span>
        <span>▸ Work</span>
        <span>₹ Expense</span>
        <span>↔ Status</span>
        <span>💬 Comment</span>
        <span>📎 File</span>
      </div>

      <div className="calendar-grid calendar-grid-rich">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="calendar-dow muted">{d}</div>
        ))}
        {days.map(({ date: cellDate, inMonth }) => (
          <CalendarDayCell
            key={cellDate}
            dayNum={Number(cellDate.slice(8))}
            inMonth={inMonth}
            isSelected={cellDate === date}
            isToday={cellDate === todayISO()}
            glimpse={glimpses[cellDate]}
            activityCount={heat[cellDate] || glimpses[cellDate]?.activityCount || 0}
            onSelect={() => setDate(cellDate)}
          />
        ))}
      </div>

      <PlanQuickAddForm
        selectedDate={date}
        projectId={projectId}
        lockProject={!!fixedProjectId}
        onAdded={reload}
      />

      <div className="card day-detail-card">
        <DayDetailPanel date={date} projectId={projectId} onReload={reload} />
      </div>

      {showIdeaPool && ideaPool.length > 0 && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3 style={{ marginTop: 0 }}>Idea pool</h3>
          <p className="muted">Unscheduled whiteboard notes — schedule or promote to work.</p>
          <div className="idea-pool">
            {ideaPool.map((note) => (
              <div key={note.id} className="idea-pool-item" style={{ borderLeftColor: note.color }}>
                <div>{note.content.slice(0, 100)}</div>
                <div className="muted">{note.board_title}</div>
                <div className="idea-pool-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => onScheduleNote(note.id)}>Schedule here</button>
                  <button type="button" className="btn btn-primary" onClick={() => onPromoteNote(note.id)}>→ Task</button>
                  <Link to={`/whiteboards/${note.whiteboard_id}`} className="btn btn-ghost">Board</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
