import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDiscussions, fetchProjects } from '../lib/api';
import type { Discussion, Project } from '../types';

export function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchDiscussions({ limit: 100 }).then((r) => setDiscussions(r.discussions)).catch(console.error);
    fetchProjects().then((r) => setProjects(r.projects)).catch(console.error);
  }, []);

  return (
    <>
      <header className="topbar"><h1 style={{ margin: 0, fontSize: '1.125rem' }}>Discussions</h1></header>
      <div className="page">
        <div className="card" style={{ marginBottom: '1rem' }}>
          <p className="muted" style={{ marginTop: 0 }}>
            Discussions happen on board cards — open a project board and click any issue to comment inline (Jira-style).
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {projects.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}/board`} className="btn btn-primary">
                {p.name} board
              </Link>
            ))}
          </div>
        </div>

        <h2 style={{ fontSize: '1rem' }}>Recent comments across projects</h2>
        {discussions.map((d) => (
          <div key={d.id} className="comment-bubble card" style={{ marginBottom: '0.5rem' }}>
            <div className="muted">{d.created_by_name} · {new Date(d.created_at).toLocaleString()}</div>
            <p style={{ margin: '0.25rem 0 0', whiteSpace: 'pre-wrap' }}>{d.content}</p>
            {d.entity_type === 'work_item' && d.entity_id && (
              <Link to={`/work/${d.entity_id}`} className="muted">Open issue →</Link>
            )}
          </div>
        ))}
        {!discussions.length && <p className="muted">No comments yet.</p>}
      </div>
    </>
  );
}
