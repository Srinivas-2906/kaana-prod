import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  addProjectMember, createWorkItem, fetchActivity, fetchLabels, fetchProject,
  fetchProjectMembers, fetchProjectTopicUnreadSummary, fetchSprints, fetchUsers, fetchWorkItems,
  removeProjectMember,
} from '../lib/api';
import { ProjectFinancialDashboard } from '../components/finance/ProjectFinancialDashboard';
import { WorkBoard } from '../components/WorkBoard';
import { SprintBar } from '../components/SprintBar';
import { ProjectTabs } from '../components/ProjectTabs';
import { PlanView } from '../components/PlanView';
import { AttachmentPanel } from '../components/AttachmentPanel';
import { ProjectSharePanel, ProjectShareDialog } from '../components/ProjectShareDialog';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { ProjectUpdatesPanel } from '../components/ProjectUpdatesPanel';
import type { ActivityEvent, Label, Project, ProjectMember, ProjectTab, Sprint, User, WorkItem,
} from '../types';

function BoardQuickAdd({ projectId, stories, onAdded }: { projectId: number; stories: WorkItem[]; onAdded: () => void }) {
  const [title, setTitle] = useState('');
  const [itemType, setItemType] = useState<'story' | 'task'>('story');
  const [parentId, setParentId] = useState<number | ''>('');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await createWorkItem({
        title,
        item_type: itemType,
        status: 'backlog',
        priority: 'medium',
        cluster_id: projectId,
        parent_id: itemType === 'task' && parentId ? parentId : null,
      });
      setTitle('');
      setParentId('');
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  }

  return (
    <form className="card" style={{ marginBottom: '1rem' }} onSubmit={onSubmit}>
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      <div className="form-row">
        <input required placeholder="New story or task…" value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: 1 }} />
        <select value={itemType} onChange={(e) => setItemType(e.target.value as 'story' | 'task')}>
          <option value="story">Story</option>
          <option value="task">Task</option>
        </select>
        {itemType === 'task' && stories.length > 0 && (
          <select value={parentId} onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">No parent story</option>
            {stories.map((s) => <option key={s.id} value={s.id}>#{s.id} {s.title.slice(0, 40)}</option>)}
          </select>
        )}
        <button type="submit" className="btn btn-primary">Add</button>
      </div>
    </form>
  );
}

export function ProjectPage() {
  const { id, tab = 'board' } = useParams<{ id: string; tab?: ProjectTab }>();
  const projectId = Number(id);
  const [project, setProject] = useState<Project | null>(null);
  const [items, setItems] = useState<WorkItem[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [creator, setCreator] = useState<Project | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [unreadUpdates, setUnreadUpdates] = useState(0);
  const [error, setError] = useState('');
  const canEdit = project?.can_edit !== false;
  const canManage = Boolean(project?.can_manage);
  const [shareOpen, setShareOpen] = useState(false);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [sprintFilter, setSprintFilter] = useState<number | 'backlog' | 'all'>('all');
  const [labelFilter, setLabelFilter] = useState<number | ''>('');

  function reloadItems() {
    if (!projectId) return;
    const params: Parameters<typeof fetchWorkItems>[0] = { projectId };
    if (sprintFilter !== 'all') params.sprintId = sprintFilter;
    if (labelFilter) params.labelId = Number(labelFilter);
    fetchWorkItems(params).then((w) => setItems(w.items)).catch((e) => setError(e.message));
  }

  function reloadSprints() {
    if (!projectId) return;
    fetchSprints(projectId).then((r) => setSprints(r.sprints)).catch(console.error);
  }

  function reloadLabels() {
    if (!projectId) return;
    fetchLabels(projectId).then((r) => setLabels(r.labels)).catch(console.error);
  }

  useEffect(() => {
    if (!projectId) return;
    fetchProject(projectId).then((p) => setProject(p.project)).catch((e) => setError(e.message));
    fetchProjectTopicUnreadSummary(projectId)
      .then((r) => setUnreadUpdates(r.unread_count))
      .catch(() => {});
  }, [projectId]);

  useEffect(() => { reloadItems(); }, [projectId, sprintFilter, labelFilter]);

  useEffect(() => {
    if (!projectId || tab !== 'board') return undefined;
    reloadSprints();
    reloadLabels();
    const timer = window.setInterval(reloadItems, 20000);
    return () => window.clearInterval(timer);
  }, [projectId, tab, sprintFilter, labelFilter]);

  useEffect(() => {
    if (tab === 'people') {
      Promise.all([fetchProjectMembers(projectId), canManage ? fetchUsers(projectId) : Promise.resolve({ users: [] })])
        .then(([m, u]) => {
          setMembers(m.members);
          setCreator(m.creator);
          setUsers(u.users);
        }).catch(console.error);
    }
    if (tab === 'activity') {
      fetchActivity({ projectId, limit: 100 })
        .then((r) => setActivity(r.events))
        .catch(console.error);
    }
  }, [tab, projectId, canManage]);

  async function onAddMember(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await addProjectMember(projectId, Number(fd.get('userId')), String(fd.get('role')));
    const m = await fetchProjectMembers(projectId);
    setMembers(m.members);
    e.currentTarget.reset();
  }

  if (!projectId) return null;
  const basePath = `/projects/${projectId}`;
  const boardItems = items.filter((i) => i.item_type === 'story' || i.item_type === 'task' || i.item_type === 'work');
  const stories = items.filter((i) => i.item_type === 'story');

  return (
    <>
      <header className="topbar">
        <div className="topbar-title">
          <span className="project-dot" style={{ background: project?.color || '#ccc' }} />
          <h1>{project?.name || 'Project'}</h1>
        </div>
        <div className="topbar-actions">
          {canManage && (
            <button type="button" className="btn btn-ghost" onClick={() => setShareOpen(true)}>
              Share
            </button>
          )}
          <Link to="/projects" className="btn btn-ghost">All projects</Link>
        </div>
      </header>
      {project && (
        <ProjectShareDialog
          projectId={projectId}
          projectName={project.name}
          open={shareOpen}
          onClose={() => setShareOpen(false)}
        />
      )}
      <div className="page">
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        {!canEdit && (
          <div className="card" style={{ marginBottom: '1rem', borderLeft: '3px solid #f59e0b' }}>
            <strong>View-only access</strong>
            <p className="muted" style={{ margin: '0.25rem 0 0' }}>
              Your role is {project?.my_role || 'viewer'}. You can browse the board and post in Updates &amp; Q&amp;A, but cannot edit stories or finances.
            </p>
          </div>
        )}
        {project?.description && <p className="muted" style={{ marginTop: 0 }}>{project.description}</p>}
        <ProjectTabs
          basePath={basePath}
          unreadUpdates={unreadUpdates}
          highlightUpdates={project?.my_role === 'viewer'}
        />

        {tab === 'board' && (
          <>
            <SprintBar
              projectId={projectId}
              sprints={sprints}
              selectedSprintId={sprintFilter}
              onSelect={setSprintFilter}
              onChange={() => { reloadSprints(); reloadItems(); }}
              canEdit={canEdit}
            />
            <div className="board-filters">
              <label className="muted" style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                Label
                <select value={labelFilter} onChange={(e) => setLabelFilter(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">All labels</option>
                  {labels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </label>
              {project?.project_key && (
                <span className="muted" style={{ fontSize: '0.8125rem' }}>Project key: <strong>{project.project_key}</strong></span>
              )}
            </div>
            {canEdit && <BoardQuickAdd projectId={projectId} stories={stories} onAdded={reloadItems} />}
            <WorkBoard
              items={boardItems}
              onChange={reloadItems}
              readOnly={!canEdit}
              projectLabels={labels}
              sprints={sprints}
              onLabelCreated={reloadLabels}
            />
          </>
        )}

        {tab === 'updates' && (
          <ProjectUpdatesPanel
            projectId={projectId}
            projectName={project?.name || 'Project'}
            stories={stories}
            canEdit={canEdit}
            vibeEmoji={project?.vibe_emoji}
            vibeMessage={project?.vibe_message}
            onVibeUpdate={(emoji, message) => {
              setProject((p) => (p ? { ...p, vibe_emoji: emoji, vibe_message: message } : p));
            }}
            onUnreadChange={setUnreadUpdates}
          />
        )}

        {tab === 'plan' && (
          <PlanView fixedProjectId={projectId} showProjectFilter={false} showIdeaPool={false} />
        )}

        {tab === 'finance' && (
          <ProjectFinancialDashboard projectId={projectId} canEdit={canEdit} />
        )}

        {tab === 'people' && (
          <>
            <ProjectSharePanel projectId={projectId} projectName={project?.name || 'Project'} canManage={canManage} />
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ marginTop: 0 }}>Team</h3>
              {creator && (
                <div className="member-row">
                  <strong>{creator.created_by_name}</strong>
                  <span className="muted">Creator · Owner</span>
                </div>
              )}
              {members.map((m) => (
                <div key={m.id} className="member-row">
                  <div>
                    <strong>{m.name}</strong>
                    <span className="muted"> · {m.email}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="role-badge">{m.role}</span>
                    {canManage && m.role !== 'owner' && (
                      <button type="button" className="btn btn-ghost" onClick={() => removeProjectMember(projectId, m.user_id).then(() => fetchProjectMembers(projectId).then((r) => setMembers(r.members)))}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {canManage && (
              <form className="card" onSubmit={onAddMember}>
                <h3 style={{ marginTop: 0 }}>Add member</h3>
                <div className="form-row">
                  <select name="userId" required>
                    <option value="">Select user</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  <select name="role" defaultValue="contributor">
                    <option value="manager">Manager</option>
                    <option value="contributor">Contributor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button type="submit" className="btn btn-primary">Add</button>
                </div>
              </form>
            )}
            <div className="card" style={{ marginTop: '1rem' }}>
              <h3 style={{ marginTop: 0 }}>Project files</h3>
              <AttachmentPanel entityType="project" entityId={projectId} readOnly={!canEdit} />
            </div>
          </>
        )}

        {tab === 'activity' && (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Project activity</h3>
            <p className="muted">Who did what — invites, edits, status changes, and more.</p>
            <ActivityTimeline events={activity} />
          </div>
        )}
      </div>
    </>
  );
}
