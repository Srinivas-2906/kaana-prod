import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Maximize2 } from 'lucide-react';
import {
  fetchDiscussions, fetchUsers, fetchWorkItem, postDiscussion,
  updateWorkItem, updateWorkItemStatus,
} from '../lib/api';
import { dateOnly } from '../lib/dates';
import type { Discussion, User, WorkItem } from '../types';
import { WORK_PRIORITIES, WORK_STATUSES, statusLabel, workTypeColor } from '../types';
import { AttachmentPanel } from './AttachmentPanel';
import { SubtaskSection } from './SubtaskSection';

export function IssuePanel({
  itemId,
  onClose,
  onUpdate,
  readOnly = false,
}: {
  itemId: number;
  onClose: () => void;
  onUpdate?: () => void;
  readOnly?: boolean;
}) {
  const navigate = useNavigate();
  const [item, setItem] = useState<WorkItem | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  function load() {
    fetchWorkItem(itemId).then((r) => setItem(r.item)).catch(console.error);
    fetchDiscussions({ entityType: 'work_item', entityId: itemId, limit: 50 })
      .then((r) => setDiscussions(r.discussions.reverse()))
      .catch(console.error);
  }

  useEffect(() => {
    load();
    fetchWorkItem(itemId).then((r) => {
      const projectId = r.item.cluster_id;
      if (projectId && !readOnly) {
        fetchUsers(projectId).then((res) => setUsers(res.users)).catch(console.error);
      }
    }).catch(console.error);
  }, [itemId, readOnly]);

  async function saveField(patch: Partial<WorkItem>) {
    if (!item) return;
    setError('');
    try {
      const result = await updateWorkItem(item.id, { ...item, ...patch });
      setItem(result.item);
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  }

  async function onComment(e: FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setError('');
    try {
      await postDiscussion({ entityType: 'work_item', entityId: itemId, content: comment });
      setComment('');
      load();
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  }

  function openFullPage() {
    navigate(`/work/${itemId}`);
    onClose();
  }

  if (!item) {
    return (
      <div className="issue-panel">
        <div className="issue-panel-inner"><p className="muted">Loading…</p></div>
      </div>
    );
  }

  const accent = item.cluster_color || workTypeColor(item.item_type);
  const due = dateOnly(item.due_date);

  return (
    <>
      <button type="button" className="issue-backdrop" aria-label="Close" onClick={onClose} />
      <aside className="issue-panel">
        <div className="issue-panel-inner">
          <header className="issue-panel-head">
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className="issue-type-badge" style={{ background: accent }}>#{item.id} · {item.item_type}</span>
              <h2 style={{ margin: '0.5rem 0 0', fontSize: '1.125rem' }}>{item.title}</h2>
              <p className="muted">{item.cluster_name || 'No project'}</p>
            </div>
            <div className="issue-panel-actions">
              <button type="button" className="btn btn-primary issue-expand-btn" onClick={openFullPage} title="Open full page">
                <Maximize2 size={16} />
                Full page
              </button>
              <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Close">×</button>
            </div>
          </header>

          <div className="issue-meta grid-2">
            <label>
              Status
              <select
                value={item.status}
                disabled={readOnly}
                onChange={async (e) => {
                  if (readOnly) return;
                  await updateWorkItemStatus(item.id, e.target.value);
                  load();
                  onUpdate?.();
                }}
              >
                {WORK_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
              </select>
            </label>
            <label>
              Assignee
              <select
                value={item.owner_id ?? ''}
                disabled={readOnly}
                onChange={(e) => saveField({ owner_id: e.target.value ? Number(e.target.value) : null })}
              >
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </label>
            <label>
              Story points
              <input
                type="number"
                min={0}
                max={100}
                disabled={readOnly}
                value={item.story_points ?? ''}
                onChange={(e) => saveField({ story_points: e.target.value ? Number(e.target.value) : null })}
              />
            </label>
            <label>
              Priority
              <select value={item.priority} disabled={readOnly} onChange={(e) => saveField({ priority: e.target.value })}>
                {WORK_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <label>
              Due
              <input
                type="date"
                disabled={readOnly}
                value={due}
                onChange={(e) => saveField({ due_date: e.target.value || null })}
              />
            </label>
          </div>

          <SubtaskSection
            parent={item}
            compact
            readOnly={readOnly}
            onNavigate={(id) => { navigate(`/work/${id}`); onClose(); }}
            onChanged={onUpdate}
          />

          <label className="issue-field">
            Description
            <textarea
              rows={3}
              readOnly={readOnly}
              defaultValue={item.description || ''}
              onBlur={(e) => {
                if (readOnly) return;
                if (e.target.value !== (item.description || '')) saveField({ description: e.target.value });
              }}
            />
          </label>

          <label className="issue-field">
            Acceptance criteria
            <textarea
              rows={3}
              readOnly={readOnly}
              defaultValue={item.acceptance_criteria || ''}
              placeholder="Given… When… Then…"
              onBlur={(e) => {
                if (readOnly) return;
                if (e.target.value !== (item.acceptance_criteria || '')) saveField({ acceptance_criteria: e.target.value });
              }}
            />
          </label>

          <div className="issue-comments">
            <h4 className="agenda-heading">Discussion ({discussions.length})</h4>
            <div className="comment-thread">
              {discussions.map((d) => (
                <div key={d.id} className="comment-bubble">
                  <strong>{d.created_by_name}</strong>
                  <span className="muted"> · {new Date(d.created_at).toLocaleString()}</span>
                  <p style={{ margin: '0.375rem 0 0', whiteSpace: 'pre-wrap' }}>{d.content}</p>
                </div>
              ))}
            </div>
            <form onSubmit={onComment} className="comment-compose">
              {error && <p style={{ color: '#dc2626' }}>{error}</p>}
              {!readOnly && (
                <>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment…" rows={3} />
                  <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Comment</button>
                </>
              )}
            </form>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <h4 className="agenda-heading">Attachments</h4>
            <AttachmentPanel entityType="work_item" entityId={itemId} onChange={onUpdate} readOnly={readOnly} />
          </div>
        </div>
      </aside>
    </>
  );
}
