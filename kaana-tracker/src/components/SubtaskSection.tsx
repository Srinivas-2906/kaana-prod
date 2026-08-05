import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, ClipboardList, Plus, Search, Square, X } from 'lucide-react';
import { createWorkItem, fetchWorkItem, fetchWorkItems, updateWorkItem } from '../lib/api';
import type { WorkItem } from '../types';
import { statusLabel } from '../types';
import { businessStatusLabel } from '../lib/workLabels';

function matchesQuery(item: WorkItem, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (String(item.id).includes(q)) return true;
  if (item.title.toLowerCase().includes(q)) return true;
  if (`#${item.id}`.includes(q)) return true;
  return false;
}

function SubtaskPicker({
  parent,
  existingIds,
  onClose,
  onChanged,
}: {
  parent: WorkItem;
  existingIds: Set<number>;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [query, setQuery] = useState('');
  const [pool, setPool] = useState<WorkItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = parent.cluster_id ? { projectId: parent.cluster_id } : {};
    fetchWorkItems(params).then((r) => setPool(r.items)).catch(console.error);
  }, [parent.cluster_id]);

  const results = useMemo(() => {
    return pool.filter((item) => {
      if (item.id === parent.id) return false;
      if (existingIds.has(item.id)) return false;
      if (item.parent_id === parent.id) return false;
      return matchesQuery(item, query);
    }).slice(0, 12);
  }, [pool, parent.id, existingIds, query]);

  async function linkExisting(child: WorkItem) {
    setBusy(true);
    setError('');
    try {
      const full = await fetchWorkItem(child.id);
      await updateWorkItem(child.id, {
        ...full.item,
        parent_id: parent.id,
        item_type: 'task',
      });
      onChanged();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to link task');
    } finally {
      setBusy(false);
    }
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setBusy(true);
    setError('');
    try {
      await createWorkItem({
        title: newTitle.trim(),
        item_type: 'task',
        status: 'todo',
        priority: parent.priority || 'medium',
        cluster_id: parent.cluster_id,
        parent_id: parent.id,
      });
      setNewTitle('');
      onChanged();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create task');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="subtask-picker-backdrop" aria-label="Close" onClick={onClose} />
      <div className="subtask-picker" role="dialog" aria-label="Add task">
        <header className="subtask-picker-head">
          <h3>Add task</h3>
          <button type="button" className="btn btn-ghost" onClick={onClose}><X size={18} /></button>
        </header>

        <div className="subtask-picker-search">
          <Search size={16} />
          <input
            autoFocus
            placeholder="Search by #number or name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {error && <p className="subtask-picker-error">{error}</p>}

        <div className="subtask-picker-list">
          {results.length ? results.map((item) => (
            <button
              key={item.id}
              type="button"
              className="subtask-picker-row"
              disabled={busy}
              onClick={() => linkExisting(item)}
            >
              <span className="subtask-picker-id">#{item.id}</span>
              <span className="subtask-picker-title">{item.title}</span>
              <span className="muted">{statusLabel(item.status)}</span>
            </button>
          )) : (
            <p className="muted subtask-picker-empty">
              {query ? 'No matching tasks.' : 'Type to search existing work items.'}
            </p>
          )}
        </div>

        <form className="subtask-picker-create" onSubmit={onCreate}>
          <div className="muted" style={{ marginBottom: '0.375rem', fontSize: '0.8125rem' }}>
            Or create a new task
          </div>
          <div className="form-row">
            <input
              placeholder="Task title…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" disabled={busy || !newTitle.trim()}>
              Create
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export function SubtaskSection({
  parent,
  compact,
  onNavigate,
  onChanged,
  variant = 'default',
  readOnly = false,
}: {
  parent: WorkItem;
  compact?: boolean;
  onNavigate?: (id: number) => void;
  onChanged?: () => void;
  variant?: 'default' | 'business';
  readOnly?: boolean;
}) {
  const [tasks, setTasks] = useState<WorkItem[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  function reload() {
    fetchWorkItems({ parentId: parent.id })
      .then((r) => setTasks(r.items.filter((t) => t.item_type === 'task' || t.parent_id === parent.id)))
      .catch(console.error);
  }

  useEffect(() => { reload(); }, [parent.id]);

  async function toggleDone(task: WorkItem) {
    if (readOnly) return;
    setTogglingId(task.id);
    try {
      const full = await fetchWorkItem(task.id);
      const nextStatus = task.status === 'done' ? 'todo' : 'done';
      await updateWorkItem(task.id, { ...full.item, status: nextStatus });
      reload();
      onChanged?.();
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingId(null);
    }
  }

  async function unlink(child: WorkItem) {
    if (readOnly) return;
    const full = await fetchWorkItem(child.id);
    await updateWorkItem(child.id, { ...full.item, parent_id: null });
    reload();
    onChanged?.();
  }

  const done = tasks.filter((t) => t.status === 'done').length;
  const useBusinessLabels = variant === 'business';

  return (
    <div className="task-section">
      <div className="task-section-head">
        <h4 className="task-section-title">Tasks</h4>
        {tasks.length > 0 && (
          <span className="task-progress" title={`${done} of ${tasks.length} complete`}>
            <ClipboardList size={14} />
            {done}/{tasks.length}
          </span>
        )}
      </div>

      {!readOnly && (
        <button type="button" className="task-add-link" onClick={() => setPickerOpen(true)}>
          <Plus size={14} />
          Add Task
        </button>
      )}

      <ul className="task-list">
        {tasks.map((t) => {
          const isDone = t.status === 'done';
          const title = (
            <span className={`task-title${isDone ? ' task-title-done' : ''}`}>{t.title}</span>
          );
          return (
            <li key={t.id} className={`task-row${isDone ? ' task-row-done' : ''}`}>
              <button
                type="button"
                className="task-check"
                disabled={readOnly || togglingId === t.id}
                onClick={() => toggleDone(t)}
                aria-label={isDone ? 'Mark task incomplete' : 'Mark task complete'}
              >
                {isDone ? <CheckSquare size={16} /> : <Square size={16} />}
              </button>
              <ClipboardList size={14} className="task-icon" aria-hidden />
              {onNavigate ? (
                <button type="button" className="task-link" onClick={() => onNavigate(t.id)}>
                  {title}
                </button>
              ) : (
                <Link to={`/work/${t.id}`} className="task-link">
                  {title}
                </Link>
              )}
              {!compact && (
                <span className="task-status muted">
                  {useBusinessLabels ? businessStatusLabel(t.status) : statusLabel(t.status)}
                </span>
              )}
              {!compact && !readOnly && (
                <button
                  type="button"
                  className="btn btn-ghost task-unlink"
                  onClick={() => unlink(t)}
                  title="Remove from parent"
                >
                  ×
                </button>
              )}
            </li>
          );
        })}
        {!tasks.length && (
          <li className="task-empty muted">
            No tasks yet — add one to break this work down.
          </li>
        )}
      </ul>

      {pickerOpen && (
        <SubtaskPicker
          parent={parent}
          existingIds={new Set(tasks.map((t) => t.id))}
          onClose={() => setPickerOpen(false)}
          onChanged={() => { reload(); onChanged?.(); }}
        />
      )}
    </div>
  );
}
