import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createProject, fetchProjects } from '../lib/api';
import type { Project } from '../types';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#14b8a6'];

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState('');

  function load() {
    fetchProjects().then((r) => setProjects(r.projects)).catch((e) => setError(e.message));
  }

  useEffect(() => { load(); }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { project } = await createProject({ name, color });
      window.location.href = `/projects/${project.id}/board`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  }

  return (
    <>
      <header className="topbar"><h1 style={{ margin: 0, fontSize: '1.125rem' }}>Projects</h1></header>
      <div className="page">
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        <div className="grid-2">
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {projects.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}/board`} className="card" style={{ borderLeft: `4px solid ${p.color}` }}>
                <strong style={{ fontSize: '1.0625rem' }}>{p.name}</strong>
                {p.description && <p className="muted">{p.description}</p>}
                <p className="muted">{p.open_count} open · {p.item_count} total</p>
              </Link>
            ))}
          </div>
          <form className="card" onSubmit={onCreate}>
            <h3 style={{ marginTop: 0 }}>New project</h3>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', marginBottom: '0.75rem' }} />
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: color === c ? '2px solid #0f172a' : '2px solid transparent', cursor: 'pointer' }} />
              ))}
            </div>
            <button type="submit" className="btn btn-primary">Create project</button>
          </form>
        </div>
      </div>
    </>
  );
}
