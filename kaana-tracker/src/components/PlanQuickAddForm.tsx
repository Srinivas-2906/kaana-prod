import { FormEvent, useState } from 'react';
import { createWorkItem, fetchProjects } from '../lib/api';
import { useEffect } from 'react';
import type { Project } from '../types';
import { WORK_ITEM_TYPES } from '../types';

type Props = {
  selectedDate: string;
  projectId?: number;
  lockProject?: boolean;
  onAdded: () => void;
};

export function PlanQuickAddForm({ selectedDate, projectId, lockProject, onAdded }: Props) {
  const [title, setTitle] = useState('');
  const [itemType, setItemType] = useState<'task' | 'idea' | 'story' | 'work'>('task');
  const [clusterId, setClusterId] = useState<number | ''>(projectId ?? '');
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (lockProject) return;
    fetchProjects().then((r) => setProjects(r.projects)).catch(console.error);
  }, [lockProject]);

  useEffect(() => {
    if (projectId) setClusterId(projectId);
  }, [projectId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await createWorkItem({
        title,
        item_type: itemType,
        status: itemType === 'idea' ? 'backlog' : 'todo',
        priority: 'medium',
        cluster_id: clusterId || null,
        start_date: selectedDate,
        due_date: selectedDate,
      });
      setTitle('');
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  }

  return (
    <form className="card plan-quick-add" onSubmit={onSubmit}>
      <div className="muted" style={{ marginBottom: '0.5rem' }}>
        Add to <strong>{selectedDate}</strong>
      </div>
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      <div className="form-row">
        <input
          required
          placeholder="Title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1 }}
        />
        <select value={itemType} onChange={(e) => setItemType(e.target.value as typeof itemType)}>
          {WORK_ITEM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        {!lockProject && (
          <select value={clusterId} onChange={(e) => setClusterId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">No project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
        <button type="submit" className="btn btn-primary">Add</button>
      </div>
    </form>
  );
}

export function QuickAddForm({
  projectId,
  scheduleDate,
  onAdded,
}: {
  projectId: number;
  scheduleDate?: string;
  onAdded: () => void;
}) {
  const [title, setTitle] = useState('');
  const [itemType, setItemType] = useState<'task' | 'idea' | 'story' | 'work'>('task');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const date = scheduleDate || new Date().toISOString().slice(0, 10);
      await createWorkItem({
        title,
        item_type: itemType,
        status: itemType === 'idea' ? 'backlog' : 'todo',
        priority: 'medium',
        cluster_id: projectId,
        start_date: date,
        due_date: date,
      });
      setTitle('');
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  }

  return (
    <form className="card" style={{ marginBottom: '1rem' }} onSubmit={onSubmit}>
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      <div className="form-row">
        <input required placeholder="Quick add title…" value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: 1 }} />
        <select value={itemType} onChange={(e) => setItemType(e.target.value as typeof itemType)}>
          {WORK_ITEM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button type="submit" className="btn btn-primary">Add</button>
      </div>
      {scheduleDate && <p className="muted">Scheduled for {scheduleDate}</p>}
    </form>
  );
}
