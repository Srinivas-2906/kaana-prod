import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchProject, fetchWorkItems } from '../lib/api';
import { ProjectTabs } from '../components/ProjectTabs';
import type { Project, ProjectTab, WorkItem } from '../types';

export function ProjectPage() {
  const { id, tab = 'overview' } = useParams<{ id: string; tab?: ProjectTab }>();
  const projectId = Number(id);
  const [project, setProject] = useState<Project | null>(null);
  const [items, setItems] = useState<WorkItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) return;
    Promise.all([
      fetchProject(projectId),
      fetchWorkItems({ projectId, itemType: tab === 'ideas' ? 'idea' : undefined }),
    ])
      .then(([p, w]) => {
        setProject(p.project);
        setItems(w.items);
      })
      .catch((e) => setError(e.message));
  }, [projectId, tab]);

  if (!projectId) return null;
  const basePath = `/projects/${projectId}`;

  return (
    <>
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: project?.color || '#ccc' }} />
          <h1 style={{ margin: 0, fontSize: '1.125rem' }}>{project?.name || 'Project'}</h1>
        </div>
        <Link to="/projects" className="btn btn-ghost">All projects</Link>
      </header>
      <div className="page">
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        {project?.description && <p className="muted" style={{ marginTop: 0 }}>{project.description}</p>}
        <ProjectTabs basePath={basePath} />

        {tab === 'overview' && (
          <div className="grid-2">
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Active work</h3>
              {items.filter((i) => i.status !== 'done').slice(0, 8).map((item) => (
                <div key={item.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <strong>{item.title}</strong>
                  <div className="muted">{item.item_type} · {item.status}</div>
                </div>
              ))}
              {!items.length && <p className="muted">No work yet.</p>}
            </div>
            <div className="card muted">
              Timeline, decisions, and finance tabs will fill in as migration continues (see TRACKER_MIGRATION.md).
            </div>
          </div>
        )}

        {tab === 'ideas' && (
          <div className="grid-2">
            {items.map((idea) => (
              <div key={idea.id} className="card" style={{ borderLeft: '4px solid #eab308' }}>
                <strong>{idea.title}</strong>
                <p className="muted">{idea.status} · {idea.created_by_name}</p>
              </div>
            ))}
            {!items.length && <p className="muted">No ideas in this project yet.</p>}
          </div>
        )}

        {!['overview', 'ideas'].includes(tab) && (
          <div className="card muted">
            <strong>{tab}</strong> tab — coming in migration Phase M1. PHP version still available at tracker.kaana.in until cutover.
          </div>
        )}
      </div>
    </>
  );
}
