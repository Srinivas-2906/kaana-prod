import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  addProjectMember, createTransaction, createWorkItem, fetchActivity, fetchFinanceSummary, fetchProject,
  fetchProjectMembers, fetchTransactionMeta, fetchTransactions, fetchUsers, fetchWorkItems,
  removeProjectMember,
} from '../lib/api';
import { WorkBoard } from '../components/WorkBoard';
import { ProjectTabs } from '../components/ProjectTabs';
import { PlanView } from '../components/PlanView';
import { AttachmentPanel } from '../components/AttachmentPanel';
import { ProjectSharePanel, ProjectShareDialog } from '../components/ProjectShareDialog';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { currentMonth, todayISO } from '../lib/dates';
import type {
  ActivityEvent, FinanceSummary, Project, ProjectMember, ProjectTab, Transaction, TransactionMeta, User, WorkItem,
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
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txMeta, setTxMeta] = useState<TransactionMeta | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [creator, setCreator] = useState<Project | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [error, setError] = useState('');
  const month = currentMonth();
  const canEdit = project?.can_edit !== false;
  const canManage = Boolean(project?.can_manage);
  const [shareOpen, setShareOpen] = useState(false);

  function reloadItems() {
    if (!projectId) return;
    fetchWorkItems({ projectId }).then((w) => setItems(w.items)).catch((e) => setError(e.message));
  }

  useEffect(() => {
    if (!projectId) return;
    fetchProject(projectId).then((p) => setProject(p.project)).catch((e) => setError(e.message));
  }, [projectId]);

  useEffect(() => { reloadItems(); }, [projectId]);

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
    if (tab === 'finance') {
      Promise.all([
        fetchFinanceSummary(month, projectId),
        fetchTransactions({ month, projectId }),
        fetchTransactionMeta(),
      ]).then(([s, t, meta]) => {
        setFinance(s.summary);
        setTransactions(t.transactions);
        setTxMeta(meta);
      }).catch(console.error);
    }
  }, [tab, projectId, month, canManage]);

  async function onAddMember(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await addProjectMember(projectId, Number(fd.get('userId')), String(fd.get('role')));
    const m = await fetchProjectMembers(projectId);
    setMembers(m.members);
    e.currentTarget.reset();
  }

  async function onAddExpense(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await createTransaction({
      type: fd.get('type'),
      amount: Number(fd.get('amount')),
      category: fd.get('category'),
      description: fd.get('description') || null,
      transaction_date: fd.get('transaction_date') || todayISO(),
      payment_method: fd.get('payment_method'),
      paid_by: fd.get('paid_by'),
      project_id: projectId,
    });
    const [s, t] = await Promise.all([
      fetchFinanceSummary(month, projectId),
      fetchTransactions({ month, projectId }),
    ]);
    setFinance(s.summary);
    setTransactions(t.transactions);
    e.currentTarget.reset();
  }

  if (!projectId) return null;
  const basePath = `/projects/${projectId}`;
  const boardItems = items.filter((i) => i.item_type === 'story' || i.item_type === 'task' || i.item_type === 'work');
  const stories = items.filter((i) => i.item_type === 'story');

  return (
    <>
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: project?.color || '#ccc' }} />
          <h1 style={{ margin: 0, fontSize: '1.125rem' }}>{project?.name || 'Project'}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
              Your role is {project?.my_role || 'viewer'}. You can browse this project but cannot make changes.
            </p>
          </div>
        )}
        {project?.description && <p className="muted" style={{ marginTop: 0 }}>{project.description}</p>}
        <ProjectTabs basePath={basePath} />

        {tab === 'board' && (
          <>
            {canEdit && <BoardQuickAdd projectId={projectId} stories={stories} onAdded={reloadItems} />}
            <WorkBoard items={boardItems} onChange={reloadItems} readOnly={!canEdit} />
          </>
        )}

        {tab === 'plan' && (
          <PlanView fixedProjectId={projectId} showProjectFilter={false} showIdeaPool={false} />
        )}

        {tab === 'finance' && finance && txMeta && (
          <>
            <div className="grid-4" style={{ marginBottom: '1rem' }}>
              <div className="card"><div className="muted">Income</div><div className="stat-value" style={{ color: '#16a34a' }}>₹{finance.total_income.toLocaleString()}</div></div>
              <div className="card"><div className="muted">Expense</div><div className="stat-value" style={{ color: '#dc2626' }}>₹{finance.total_expense.toLocaleString()}</div></div>
              <div className="card"><div className="muted">Net</div><div className="stat-value">₹{finance.net.toLocaleString()}</div></div>
              <div className="card"><div className="muted">Balance</div><div className="stat-value">₹{finance.balance.toLocaleString()}</div></div>
            </div>
            <form className="card" style={{ marginBottom: '1rem' }} onSubmit={onAddExpense}>
              <h3 style={{ marginTop: 0 }}>Quick expense / income</h3>
              {canEdit ? (
                <>
                  <div className="form-row">
                    <select name="type" defaultValue="expense">
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                    <input name="amount" type="number" step="0.01" required placeholder="Amount" />
                    <select name="category" required>
                      {txMeta.categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input name="transaction_date" type="date" defaultValue={todayISO()} />
                  </div>
                  <div className="form-row" style={{ marginTop: '0.5rem' }}>
                    <select name="payment_method" defaultValue={txMeta.paymentMethods[0]}>
                      {txMeta.paymentMethods.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select name="paid_by" defaultValue={txMeta.paidByOptions[0]}>
                      {txMeta.paidByOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <input name="description" placeholder="Description" style={{ flex: 1 }} />
                    <button type="submit" className="btn btn-primary">Save</button>
                  </div>
                </>
              ) : (
                <p className="muted" style={{ margin: 0 }}>Finance entries are read-only for your role.</p>
              )}
            </form>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0 }}>This month</h3>
                <Link to={`/transactions?projectId=${projectId}`} className="btn btn-ghost">All expenses →</Link>
              </div>
              {transactions.map((tx) => (
                <div key={tx.id} className="tx-row">
                  <div>
                    <strong>{tx.category}</strong>
                    <div className="muted">{tx.transaction_date} · {tx.description || tx.payment_method}</div>
                  </div>
                  <strong style={{ color: tx.type === 'income' ? '#16a34a' : '#dc2626' }}>
                    {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
                  </strong>
                </div>
              ))}
              {!transactions.length && <p className="muted">No expenses this month.</p>}
            </div>
          </>
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
