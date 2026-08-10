import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { fetchProject } from '../lib/api';
import { projectDefaultTab } from '../types';

export function ProjectDefaultRedirect() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchProject(Number(id))
      .then((r) => setTab(projectDefaultTab(r.project.my_role)))
      .catch(() => setTab('board'));
  }, [id]);

  if (!tab) {
    return (
      <div className="page">
        <p className="muted">Loading project…</p>
      </div>
    );
  }

  return <Navigate to={tab} replace />;
}
