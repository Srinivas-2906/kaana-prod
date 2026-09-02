import { FormEvent, useState } from 'react';
import { createSprint, updateSprint } from '../lib/api';
import type { Sprint } from '../types';

export function SprintBar({
  projectId,
  sprints,
  selectedSprintId,
  onSelect,
  onChange,
  canEdit,
}: {
  projectId: number;
  sprints: Sprint[];
  selectedSprintId: number | 'backlog' | 'all';
  onSelect: (id: number | 'backlog' | 'all') => void;
  onChange: () => void;
  canEdit: boolean;
}) {
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const active = sprints.find((s) => s.status === 'active');

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await createSprint(projectId, { name: name.trim(), status: 'planning' });
    setName('');
    setCreating(false);
    onChange();
  }

  async function activateSprint(sprintId: number) {
    await updateSprint(projectId, sprintId, { status: 'active' });
    onChange();
  }

  return (
    <div className="sprint-bar card" style={{ marginBottom: '1rem' }}>
      <div className="sprint-bar-tabs">
        <button
          type="button"
          className={`sprint-tab${selectedSprintId === 'all' ? ' sprint-tab-active' : ''}`}
          onClick={() => onSelect('all')}
        >
          All
        </button>
        <button
          type="button"
          className={`sprint-tab${selectedSprintId === 'backlog' ? ' sprint-tab-active' : ''}`}
          onClick={() => onSelect('backlog')}
        >
          Backlog
        </button>
        {sprints.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`sprint-tab${selectedSprintId === s.id ? ' sprint-tab-active' : ''}${s.status === 'active' ? ' sprint-tab-live' : ''}`}
            onClick={() => onSelect(s.id)}
            title={s.goal || undefined}
          >
            {s.name}
            {s.item_count != null && <span className="muted"> · {s.done_count || 0}/{s.item_count}</span>}
          </button>
        ))}
        {canEdit && !creating && (
          <button type="button" className="btn btn-ghost sprint-tab-add" onClick={() => setCreating(true)}>
            + Sprint
          </button>
        )}
      </div>
      {canEdit && creating && (
        <form className="sprint-create-row" onSubmit={onCreate}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sprint name…" required />
          <button type="submit" className="btn btn-primary">Create</button>
          <button type="button" className="btn btn-ghost" onClick={() => setCreating(false)}>Cancel</button>
        </form>
      )}
      {canEdit && active && selectedSprintId !== active.id && (
        <p className="muted sprint-bar-hint" style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem' }}>
          Active sprint: <strong>{active.name}</strong>
          {' · '}
          <button type="button" className="btn btn-ghost" style={{ padding: 0, minHeight: 0 }} onClick={() => onSelect(active.id)}>
            View
          </button>
        </p>
      )}
      {canEdit && selectedSprintId !== 'all' && selectedSprintId !== 'backlog' && typeof selectedSprintId === 'number' && (
        (() => {
          const sprint = sprints.find((s) => s.id === selectedSprintId);
          if (!sprint || sprint.status === 'active') return null;
          return (
            <button
              type="button"
              className="btn btn-ghost"
              style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}
              onClick={() => activateSprint(sprint.id)}
            >
              Start sprint
            </button>
          );
        })()
      )}
    </div>
  );
}
