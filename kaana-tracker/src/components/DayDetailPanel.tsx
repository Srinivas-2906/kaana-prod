import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDaybookSummary, createReminder, completeReminder } from '../lib/api';
import { formatDate, todayISO } from '../lib/dates';
import { DayAgendaPanel } from './DayAgendaPanel';
import { ActivityTimeline } from './ActivityTimeline';
import { JournalForm } from './JournalForm';
import type { DaybookSummary } from '../types';

type Tab = 'overview' | 'work' | 'finance' | 'activity' | 'discussions' | 'reminders';

export function DayDetailPanel({
  date,
  projectId,
  onReload,
}: {
  date: string;
  projectId?: number;
  onReload?: () => void;
}) {
  const [summary, setSummary] = useState<DaybookSummary | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [reminderTitle, setReminderTitle] = useState('');
  const isToday = date === todayISO();
  const isPast = date < todayISO();

  function load() {
    fetchDaybookSummary(date, projectId).then((r) => setSummary(r.summary)).catch(console.error);
    onReload?.();
  }

  useEffect(() => {
    load();
    setTab('overview');
  }, [date, projectId]);

  async function addReminder(e: FormEvent) {
    e.preventDefault();
    if (!reminderTitle.trim()) return;
    await createReminder({
      title: reminderTitle.trim(),
      reminder_date: date,
      project_id: projectId || null,
    });
    setReminderTitle('');
    load();
  }

  if (!summary) return <p className="muted">Loading day…</p>;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'work', label: 'Work', count: summary.counts.work + summary.counts.board_ideas },
    { id: 'finance', label: 'Finance', count: summary.counts.transactions },
    { id: 'discussions', label: 'Comments', count: summary.counts.discussions },
    { id: 'reminders', label: 'Reminders', count: summary.counts.reminders },
    { id: 'activity', label: 'Activity', count: summary.counts.activity },
  ];

  const totalItems = Object.values(summary.counts).reduce((a, b) => a + b, 0);

  return (
    <div className="day-detail">
      <div className="day-detail-header">
        <div>
          <h3 style={{ margin: 0 }}>{formatDate(date)}</h3>
          <p className="muted" style={{ margin: '0.25rem 0 0' }}>
            {isToday ? 'Today' : isPast ? 'Past' : 'Upcoming'} · {totalItems} items
            {summary.counts.overdue > 0 && (
              <span style={{ color: '#dc2626' }}> · {summary.counts.overdue} overdue</span>
            )}
          </p>
        </div>
      </div>

      <div className="day-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}{t.count ? ` (${t.count})` : ''}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="day-overview-grid">
          <div className="day-stat-card"><span className="muted">Work</span><strong>{summary.counts.work}</strong></div>
          <div className="day-stat-card"><span className="muted">Finance</span><strong>{summary.counts.transactions}</strong></div>
          <div className="day-stat-card"><span className="muted">Comments</span><strong>{summary.counts.discussions}</strong></div>
          <div className="day-stat-card"><span className="muted">Reminders</span><strong>{summary.counts.reminders}</strong></div>
          <div className="day-stat-card"><span className="muted">Decisions</span><strong>{summary.counts.decisions}</strong></div>
          <div className="day-stat-card"><span className="muted">Activity</span><strong>{summary.counts.activity}</strong></div>
        </div>
      )}

      {tab === 'work' && (
        <>
          {summary.overdue && summary.overdue.length > 0 && (
            <div className="day-section">
              <h4 className="agenda-heading" style={{ color: '#dc2626' }}>Overdue</h4>
              {summary.overdue.map((item) => (
                <Link key={item.id} to={`/work/${item.id}`} className="agenda-item">
                  {item.title} <span className="muted">· due {item.due_date}</span>
                </Link>
              ))}
            </div>
          )}
          <DayAgendaPanel agenda={summary.agenda} />
        </>
      )}

      {tab === 'finance' && (
        <div className="day-section">
          {summary.transactions.length ? summary.transactions.map((tx) => (
            <div key={tx.id} className="tx-row">
              <div>
                <strong>{tx.category}</strong>
                {tx.description && <span className="muted"> — {tx.description}</span>}
              </div>
              <strong style={{ color: tx.type === 'income' ? '#16a34a' : '#dc2626' }}>
                {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
              </strong>
            </div>
          )) : <p className="muted">No transactions on this day.</p>}
          <Link to="/transactions" className="btn btn-ghost" style={{ marginTop: '0.75rem' }}>All transactions →</Link>
        </div>
      )}

      {tab === 'discussions' && (
        <div className="day-section">
          {summary.discussions.length ? summary.discussions.map((d) => (
            <div key={d.id} className="comment-bubble">
              <div className="muted">{d.created_by_name} · {new Date(d.created_at).toLocaleTimeString()}</div>
              <p style={{ margin: '0.25rem 0 0', whiteSpace: 'pre-wrap' }}>{d.content}</p>
              {d.entity_type === 'work_item' && d.entity_id && (
                <Link to={`/work/${d.entity_id}`} className="muted">View on board →</Link>
              )}
            </div>
          )) : <p className="muted">No comments on this day. Open a board card to discuss work items.</p>}
        </div>
      )}

      {tab === 'reminders' && (
        <div className="day-section">
          <form className="form-row" onSubmit={addReminder} style={{ marginBottom: '1rem' }}>
            <input
              placeholder="New reminder…"
              value={reminderTitle}
              onChange={(e) => setReminderTitle(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary">Add</button>
          </form>
          {summary.reminders?.length ? summary.reminders.map((r) => (
            <div key={r.id} className={`reminder-row${r.completed_at ? ' done' : ''}`}>
              <div>
                <strong>{r.title}</strong>
                {r.notes && <p className="muted">{r.notes}</p>}
                {r.reminder_time && <span className="muted">{r.reminder_time}</span>}
              </div>
              {!r.completed_at && (
                <button type="button" className="btn btn-ghost" onClick={() => completeReminder(r.id).then(load)}>Done</button>
              )}
            </div>
          )) : <p className="muted">No reminders for this day.</p>}
        </div>
      )}

      {tab === 'activity' && (
        <div className="day-section">
          <ActivityTimeline events={summary.activity} />
        </div>
      )}

      {(tab === 'overview' || isToday || isPast) && tab !== 'reminders' && (
        <div style={{ marginTop: '1rem' }}>
          <JournalForm date={date} projectId={projectId} onSaved={load} />
        </div>
      )}
    </div>
  );
}
