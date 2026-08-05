import { FormEvent, useEffect, useState, type CSSProperties } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Calendar,
  MessageSquare, Paperclip, Sparkles, User as UserIcon, X,
} from 'lucide-react';
import {
  deleteWorkItem, fetchDiscussions, fetchEntityVersions,
  fetchProject, fetchProjects, fetchUsers, fetchWorkItem,
  postDiscussion, promoteIdeaToStory, updateWorkItem,
} from '../lib/api';
import type { Discussion, EntityVersion, Project, User, WorkItem } from '../types';
import { WORK_ITEM_TYPES, WORK_PRIORITIES, WORK_STATUSES, workTypeColor } from '../types';
import {
  businessPriorityLabel, businessStatusLabel, businessTypeLabel, HISTORY_FIELD_LABELS,
} from '../lib/workLabels';
import { AttachmentPanel } from '../components/AttachmentPanel';
import { SubtaskSection } from '../components/SubtaskSection';
import { WorkItemSections } from '../components/WorkItemSections';
import { dateOnly } from '../lib/dates';
import { defaultSectionsFromItem, sectionsToWorkItemPatch } from '../lib/workSections';
import type { WorkItemContentSection } from '../types';

type SidebarTab = 'details' | 'history' | 'attachments';

const SIDEBAR_TABS: { id: SidebarTab; label: string }[] = [
  { id: 'details', label: 'Overview' },
  { id: 'history', label: 'Timeline' },
  { id: 'attachments', label: 'Files' },
];

export function WorkItemPage() {
  const { id } = useParams<{ id: string }>();
  const itemId = Number(id);
  const navigate = useNavigate();
  const [item, setItem] = useState<WorkItem | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [versions, setVersions] = useState<EntityVersion[]>([]);
  const [parentItem, setParentItem] = useState<WorkItem | null>(null);
  const [comment, setComment] = useState('');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('details');
  const [sections, setSections] = useState<WorkItemContentSection[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function goBack() {
    if (project) navigate(`/projects/${project.id}/board`);
    else navigate('/my-work');
  }

  function loadDiscussions() {
    fetchDiscussions({ entityType: 'work_item', entityId: itemId })
      .then((r) => setDiscussions(r.discussions))
      .catch(console.error);
  }

  function reloadItem() {
    fetchWorkItem(itemId).then((w) => {
      setItem(w.item);
      setSections(defaultSectionsFromItem(w.item));
      if (w.item.parent_id) {
        fetchWorkItem(w.item.parent_id).then((p) => setParentItem(p.item)).catch(() => setParentItem(null));
      } else {
        setParentItem(null);
      }
    }).catch((e) => setError(e.message));
    fetchEntityVersions('work_item', itemId).then((r) => setVersions(r.versions)).catch(console.error);
  }

  useEffect(() => {
    if (!itemId) return;
    Promise.all([fetchWorkItem(itemId), fetchProjects()])
      .then(async ([w, p]) => {
        setItem(w.item);
        setSections(defaultSectionsFromItem(w.item));
        setProjects(p.projects);
        if (w.item.cluster_id) {
          fetchProject(w.item.cluster_id).then(async (r) => {
            setProject(r.project);
            if (r.project.can_edit !== false) {
              try {
                const u = await fetchUsers(w.item.cluster_id!);
                setUsers(u.users);
              } catch {
                setUsers([]);
              }
            }
          }).catch(console.error);
        }
        if (w.item.parent_id) {
          fetchWorkItem(w.item.parent_id).then((pr) => setParentItem(pr.item)).catch(() => setParentItem(null));
        }
      }).catch((e) => setError(e.message));
    loadDiscussions();
    fetchEntityVersions('work_item', itemId).then((r) => setVersions(r.versions)).catch(console.error);
  }, [itemId]);

  async function saveSections(nextSections: WorkItemContentSection[]) {
    if (!item) return;
    setSections(nextSections);
    await patch(sectionsToWorkItemPatch(nextSections));
  }

  async function patch(partial: Partial<WorkItem>) {
    if (!item) return;
    const changed = Object.entries(partial).some(([k, v]) => {
      const oldVal = item[k as keyof WorkItem];
      if (k === 'content_sections') {
        return JSON.stringify(oldVal ?? null) !== JSON.stringify(v ?? null);
      }
      return String(oldVal ?? '') !== String(v ?? '');
    });
    if (!changed) return;
    setSaving(true);
    setError('');
    try {
      const result = await updateWorkItem(item.id, { ...item, ...partial });
      setItem(result.item);
      if (partial.content_sections) {
        setSections(defaultSectionsFromItem(result.item));
      }
      fetchEntityVersions('work_item', itemId).then((r) => setVersions(r.versions)).catch(console.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save — try again');
    } finally {
      setSaving(false);
    }
  }

  async function onComment(e: FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    await postDiscussion({ entityType: 'work_item', entityId: itemId, content: comment });
    setComment('');
    loadDiscussions();
  }

  if (!itemId) return null;

  if (!item) {
    return (
      <div className="wi-page wi-page-loading">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  const accent = project?.color || item.cluster_color || workTypeColor(item.item_type);
  const typeLabel = businessTypeLabel(item.item_type);

  return (
    <div className="wi-page" style={{ '--wi-accent': accent } as CSSProperties}>
      <div className="wi-accent-bar" />

      <div className="wi-topbar">
        <button type="button" className="wi-close-btn" onClick={goBack}>
          <ArrowLeft size={18} />
          <span>Back to board</span>
        </button>
        <nav className="wi-breadcrumb">
          {project && (
            <>
              <Link to={`/projects/${project.id}/board`}>{project.name}</Link>
              <span className="wi-crumb-sep">›</span>
            </>
          )}
          <span className="wi-breadcrumb-current">{typeLabel}</span>
        </nav>
        <div className="wi-topbar-actions">
          {saving && <span className="wi-saving">Saving…</span>}
          <button type="button" className="wi-close-icon" onClick={goBack} aria-label="Close">
            <X size={20} />
          </button>
        </div>
      </div>

      {error && <p className="wi-error">{error}</p>}

      <div className="wi-header">
        <input
          className="wi-title-input"
          value={item.title}
          onChange={(e) => setItem({ ...item, title: e.target.value })}
          onBlur={(e) => {
            const t = e.target.value.trim();
            if (t) patch({ title: t });
          }}
          placeholder="Name this idea or action…"
          aria-label="Title"
        />

        <div className="wi-header-row">
          <label className="wi-meta-chip">
            <UserIcon size={15} />
            <select
              value={item.owner_id ?? ''}
              onChange={(e) => patch({ owner_id: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">Who&apos;s on this?</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </label>
          <span className="wi-meta-chip wi-meta-static">
            <MessageSquare size={15} />
            {discussions.length} note{discussions.length !== 1 ? 's' : ''}
          </span>
          <label className="wi-meta-chip">
            <Sparkles size={15} />
            <select
              value={item.item_type}
              onChange={(e) => patch({ item_type: e.target.value as WorkItem['item_type'] })}
            >
              {WORK_ITEM_TYPES.filter((t) => t !== 'idea').map((t) => (
                <option key={t} value={t}>{businessTypeLabel(t)}</option>
              ))}
            </select>
          </label>
          {!project && (
            <label className="wi-meta-chip">
              <select
                value={item.cluster_id ?? ''}
                onChange={(e) => patch({ cluster_id: e.target.value ? Number(e.target.value) : null })}
              >
                <option value="">Pick a project</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
          )}
        </div>
      </div>

      <div className="wi-layout">
        <main className="wi-main">
          <WorkItemSections
            sections={sections}
            onChange={setSections}
            onSave={saveSections}
          />

          {item.item_type === 'idea' && (
            <section className="wi-section wi-section-promote">
              <button
                type="button"
                className="btn btn-primary"
                onClick={async () => {
                  const r = await promoteIdeaToStory(item.id);
                  if (r.item) navigate(`/work/${r.item.id}`);
                }}
              >
                Turn this spark into a big idea →
              </button>
            </section>
          )}

          <section className="wi-section wi-discussion-section">
            <h3 className="wi-section-title"><MessageSquare size={16} /> Team notes</h3>
            <p className="wi-section-hint">Updates, questions, and decisions</p>
            <form onSubmit={onComment} className="wi-discussion-compose">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share an update or ask the team something…"
                rows={3}
              />
              <button type="submit" className="btn btn-primary">Post note</button>
            </form>
            <div className="wi-discussion-thread">
              {discussions.map((d) => (
                <article key={d.id} className="wi-discussion-item">
                  <div className="wi-discussion-avatar">{d.created_by_name.charAt(0)}</div>
                  <div>
                    <header>
                      <strong>{d.created_by_name}</strong>
                      <span className="muted"> · {new Date(d.created_at).toLocaleString()}</span>
                    </header>
                    <p>{d.content}</p>
                  </div>
                </article>
              ))}
              {!discussions.length && <p className="muted wi-empty-note">No team notes yet — be the first.</p>}
            </div>
          </section>
        </main>

        <aside className="wi-sidebar">
          <div className="wi-sidebar-tabs">
            {SIDEBAR_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`wi-sidebar-tab${sidebarTab === t.id ? ' active' : ''}`}
                onClick={() => setSidebarTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {sidebarTab === 'details' && (
            <div className="wi-sidebar-body">
              <div className="wi-sidebar-group">
                <h4 className="wi-sidebar-heading">Schedule & focus</h4>
                <label className="wi-sidebar-field">
                  Where is it?
                  <select value={item.status} onChange={(e) => patch({ status: e.target.value })}>
                    {WORK_STATUSES.map((s) => (
                      <option key={s} value={s}>{businessStatusLabel(s)}</option>
                    ))}
                  </select>
                </label>
                <label className="wi-sidebar-field">
                  Effort size
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="1–10"
                    value={item.story_points ?? ''}
                    onChange={(e) => setItem({ ...item, story_points: e.target.value ? Number(e.target.value) : null })}
                    onBlur={(e) => patch({ story_points: e.target.value ? Number(e.target.value) : null })}
                  />
                </label>
                <label className="wi-sidebar-field">
                  How important?
                  <select value={item.priority} onChange={(e) => patch({ priority: e.target.value })}>
                    {WORK_PRIORITIES.map((p) => (
                      <option key={p} value={p}>{businessPriorityLabel(p)}</option>
                    ))}
                  </select>
                </label>
                <label className="wi-sidebar-field">
                  Start when
                  <input
                    type="date"
                    value={dateOnly(item.start_date)}
                    onChange={(e) => patch({ start_date: e.target.value || null })}
                  />
                </label>
                <label className="wi-sidebar-field">
                  Target by
                  <input
                    type="date"
                    value={dateOnly(item.due_date)}
                    onChange={(e) => patch({ due_date: e.target.value || null })}
                  />
                </label>
                {(item.due_date || item.start_date) && (
                  <Link
                    to={`/plan?date=${dateOnly(item.due_date || item.start_date)}${project ? `&projectId=${project.id}` : ''}`}
                    className="wi-calendar-link"
                  >
                    <Calendar size={14} />
                    See on calendar
                  </Link>
                )}
              </div>

              <div className="wi-sidebar-group wi-sidebar-tasks">
                <SubtaskSection parent={item} onChanged={reloadItem} variant="business" />
                {parentItem && (
                  <div className="wi-related-row wi-parent-link">
                    <span className="muted">Part of</span>
                    <Link to={`/work/${parentItem.id}`}>{parentItem.title}</Link>
                  </div>
                )}
              </div>

              <div className="wi-sidebar-group">
                <h4 className="wi-sidebar-heading">Started by</h4>
                <p className="wi-creator">{item.created_by_name}</p>
              </div>

              <button
                type="button"
                className="wi-delete-link"
                onClick={async () => {
                  if (!confirm('Remove this item permanently?')) return;
                  await deleteWorkItem(item.id);
                  goBack();
                }}
              >
                Remove this item
              </button>
            </div>
          )}

          {sidebarTab === 'history' && (
            <div className="wi-sidebar-body wi-history-body">
              <p className="wi-section-hint" style={{ padding: '0 0.25rem 0.75rem' }}>Every change, in order</p>
              {versions.length ? versions.map((v) => (
                <div key={v.id} className="history-row">
                  <div className="muted">{new Date(v.created_at).toLocaleString()}</div>
                  <div className="muted">{v.actor_name}</div>
                  <div style={{ fontSize: '0.8125rem' }}>
                    <strong>{HISTORY_FIELD_LABELS[v.field_name] || v.field_name}</strong>
                    {' updated '}
                    {v.old_value ? <span className="history-old">{v.old_value}</span> : '—'}
                    {' → '}
                    {v.new_value ? <span className="history-new">{v.new_value}</span> : '—'}
                  </div>
                </div>
              )) : <p className="muted">No updates recorded yet.</p>}
            </div>
          )}

          {sidebarTab === 'attachments' && (
            <div className="wi-sidebar-body">
              <p className="wi-section-hint" style={{ marginBottom: '0.75rem' }}>
                <Paperclip size={14} style={{ verticalAlign: -2 }} /> Receipts, docs, screenshots
              </p>
              <AttachmentPanel entityType="work_item" entityId={itemId} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
