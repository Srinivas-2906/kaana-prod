import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProjects, fetchWorkStats } from '../lib/api';
import type { Project, WorkStats } from '../types';

export function HubPage() {
  const [stats, setStats] = useState<WorkStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchWorkStats(), fetchProjects()])
      .then(([s, p]) => {
        setStats(s.stats);
        setProjects(p.projects.slice(0, 5));
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <header className="topbar">
        <h1 style={{ margin: 0, fontSize: '1.125rem' }}>Hub</h1>
      </header>
      <div className="page">
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          <div className="card"><div className="muted">Open work</div><div className="stat-value">{stats?.open_count ?? '—'}</div></div>
          <div className="card"><div className="muted">In progress</div><div className="stat-value">{stats?.in_progress ?? '—'}</div></div>
          <div className="card"><div className="muted">Due today</div><div className="stat-value">{stats?.due_today ?? '—'}</div></div>
          <div className="card"><div className="muted">Overdue</div><div className="stat-value" style={{ color: stats?.overdue ? '#dc2626' : undefined }}>{stats?.overdue ?? '—'}</div></div>
        </div>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Projects</h2>
        <div className="grid-2">
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}/overview`} className="card" style={{ borderLeft: `4px solid ${p.color}` }}>
              <strong>{p.name}</strong>
              <p className="muted">{p.open_count} open · {p.item_count} total</p>
            </Link>
          ))}
          <Link to="/projects" className="card muted" style={{ display: 'grid', placeItems: 'center' }}>View all projects →</Link>
        </div>
      </div>
    </>
  );
}
