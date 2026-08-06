import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchActivity, fetchFinanceSummary, fetchProjects, fetchWorkStats } from '../lib/api';
import { currentMonth, todayISO } from '../lib/dates';
import type { ActivityEvent, FinanceSummary, Project, WorkStats } from '../types';
import { ActivityTimeline } from '../components/ActivityTimeline';

export function HubPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<WorkStats | null>(null);
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [error, setError] = useState('');
  const today = todayISO();
  const month = currentMonth();

  useEffect(() => {
    Promise.all([
      fetchWorkStats(),
      fetchProjects(),
      fetchActivity({ date: today, limit: 12 }),
      fetchFinanceSummary(month),
    ])
      .then(([s, p, act, fin]) => {
        // Landing behavior:
        // - If user has no projects, send them straight to Projects to create one
        // - If user has exactly one project (common for shared/guest accounts), open it directly
        if (p.projects.length === 0) {
          navigate('/projects', { replace: true });
          return;
        }
        if (p.projects.length === 1) {
          navigate(`/projects/${p.projects[0].id}/board`, { replace: true });
          return;
        }

        setStats(s.stats);
        setProjects(p.projects.slice(0, 5));
        setActivity(act.events);
        setFinance(fin.summary);
      })
      .catch((e) => setError(e.message));
  }, [today, month, navigate]);

  return (
    <>
      <header className="topbar">
        <h1 style={{ margin: 0, fontSize: '1.125rem' }}>Hub</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/plan?date=${today}`} className="btn btn-ghost">Calendar</Link>
          <Link to="/transactions" className="btn btn-ghost">Expenses</Link>
        </div>
      </header>
      <div className="page">
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          <Link to="/my-work" className="card card-link">
            <div className="muted">Open work</div>
            <div className="stat-value">{stats?.open_count ?? '—'}</div>
          </Link>
          <Link to="/my-work" className="card card-link">
            <div className="muted">In progress</div>
            <div className="stat-value">{stats?.in_progress ?? '—'}</div>
          </Link>
          <Link to={`/plan?date=${today}`} className="card card-link">
            <div className="muted">Due today</div>
            <div className="stat-value">{stats?.due_today ?? '—'}</div>
          </Link>
          <Link to="/transactions" className="card card-link">
            <div className="muted">Month expense</div>
            <div className="stat-value" style={{ color: '#dc2626' }}>₹{finance?.total_expense.toLocaleString() ?? '—'}</div>
          </Link>
        </div>

        {activity.length > 0 && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1rem', margin: 0 }}>Today&apos;s activity</h2>
              <Link to={`/plan?date=${today}`} className="btn btn-ghost">Calendar →</Link>
            </div>
            <ActivityTimeline events={activity} />
          </div>
        )}

        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Projects</h2>
        <div className="grid-2">
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}/board`} className="card card-link" style={{ borderLeft: `4px solid ${p.color}` }}>
              <strong>{p.name}</strong>
              <p className="muted">{p.open_count} open · {p.item_count} total</p>
            </Link>
          ))}
          <Link to="/projects" className="card muted card-link" style={{ display: 'grid', placeItems: 'center' }}>View all projects →</Link>
        </div>
      </div>
    </>
  );
}
