import { authHeaders, clearLegacyToken, isClerkEnabled } from './auth';
import type {
  Attachment,
  CalendarDayGlimpses,
  CalendarEntry,
  DayAgenda,
  DaybookSummary,
  DayMeta,
  Discussion,
  EntityVersion,
  FinanceSummary,
  Project,
  Transaction,
  TransactionMeta,
  User,
  Whiteboard,
  WhiteboardNote,
  WorkItem,
  WorkStats,
} from '../types';

const API = import.meta.env.VITE_TRACKER_API || '/api';

function safeRedirectUrl(pathname: string, search: string) {
  const p = `${pathname || '/'}${search || ''}`;
  return p.startsWith('/') ? p : '/';
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    const headers = await authHeaders();
    res = await fetch(`${API}${path}`, {
      ...init,
      headers: { ...headers, ...(init?.headers || {}) },
    });
  } catch {
    throw new Error('Cannot reach tracker API. Start kaana-tracker-api on port 3011.');
  }
  if (res.status === 401) {
    clearLegacyToken();
    if (isClerkEnabled() && !window.location.pathname.startsWith('/login')) {
      const redirectBack = safeRedirectUrl(window.location.pathname, window.location.search);
      const loginUrl = `/login?redirect_url=${encodeURIComponent(redirectBack)}`;
      // If Clerk session is stale/unauthorized, sign out to prevent "already signed in" 400s.
      const clerk = (window as unknown as { Clerk?: { signOut?: (opts?: { redirectUrl?: string }) => Promise<void> } }).Clerk;
      if (clerk?.signOut) {
        clerk.signOut({ redirectUrl: loginUrl }).catch(() => { window.location.href = loginUrl; });
      } else {
        window.location.href = loginUrl;
      }
    }
    throw new Error('Session expired. Please sign in again.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json() as Promise<T>;
}

export function fetchMe() {
  return request<{ user: User }>('/auth/me');
}

export function fetchProjects() {
  return request<{ projects: Project[] }>('/projects');
}

export function fetchProject(id: number) {
  return request<{ project: Project }>(`/projects/${id}`);
}

export function createProject(data: { name: string; description?: string; color?: string }) {
  return request<{ project: Project }>('/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function fetchWorkStats() {
  return request<{ stats: WorkStats }>('/work-items/stats');
}

type WorkItemFilters = {
  projectId?: number;
  itemType?: string;
  ideaStage?: string;
  parentId?: number;
  mine?: boolean;
  status?: string;
  excludeDone?: boolean;
  from?: string;
  to?: string;
  date?: string;
};

export function fetchWorkItems(params?: WorkItemFilters) {
  const q = new URLSearchParams();
  if (params?.projectId) q.set('projectId', String(params.projectId));
  if (params?.itemType) q.set('itemType', params.itemType);
  if (params?.ideaStage) q.set('ideaStage', params.ideaStage);
  if (params?.parentId != null) q.set('parentId', String(params.parentId));
  if (params?.mine) q.set('mine', 'true');
  if (params?.status) q.set('status', params.status);
  if (params?.excludeDone) q.set('excludeDone', 'true');
  if (params?.from) q.set('from', params.from);
  if (params?.to) q.set('to', params.to);
  if (params?.date) q.set('date', params.date);
  const qs = q.toString();
  return request<{ items: WorkItem[] }>(`/work-items${qs ? `?${qs}` : ''}`);
}

export function fetchWorkItem(id: number) {
  return request<{ item: WorkItem; links: import('../types').EntityLink[] }>(`/work-items/${id}`);
}

export function createWorkItem(data: Partial<WorkItem>) {
  return request<{ item: WorkItem }>('/work-items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function updateWorkItem(id: number, data: Partial<WorkItem>) {
  return request<{ item: WorkItem }>(`/work-items/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function updateWorkItemStatus(id: number, status: string) {
  return request<{ item: WorkItem }>(`/work-items/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export function deleteWorkItem(id: number) {
  return request<{ ok: boolean }>(`/work-items/${id}`, { method: 'DELETE' });
}

export function fetchCalendarMap(from: string, to: string, projectId?: number, itemType?: string) {
  const q = new URLSearchParams({ from, to });
  if (projectId) q.set('projectId', String(projectId));
  if (itemType) q.set('itemType', itemType);
  return request<{ map: Record<string, CalendarEntry[]> }>(`/plan/calendar?${q}`);
}

export function fetchDayAgenda(date: string, projectId?: number, itemType?: string) {
  const q = new URLSearchParams({ date });
  if (projectId) q.set('projectId', String(projectId));
  if (itemType) q.set('itemType', itemType);
  return request<{ agenda: DayAgenda }>(`/plan/agenda?${q}`);
}

export function fetchDaybookSummary(date: string, projectId?: number) {
  const q = new URLSearchParams({ date });
  if (projectId) q.set('projectId', String(projectId));
  return request<{ summary: DaybookSummary }>(`/plan/daybook?${q}`);
}

export function fetchDayMeta(from: string, to: string, projectId?: number) {
  const q = new URLSearchParams({ from, to });
  if (projectId) q.set('projectId', String(projectId));
  return request<{ meta: Record<string, DayMeta> }>(`/plan/day-meta?${q}`);
}

export function fetchCalendarGlimpses(from: string, to: string, projectId?: number, itemType?: string) {
  const q = new URLSearchParams({ from, to });
  if (projectId) q.set('projectId', String(projectId));
  if (itemType) q.set('itemType', itemType);
  return request<{ glimpses: Record<string, CalendarDayGlimpses>; heat: Record<string, number> }>(`/plan/glimpses?${q}`);
}

export function fetchIdeaPool(limit = 12) {
  return request<{ notes: WhiteboardNote[] }>(`/plan/idea-pool?limit=${limit}`);
}

export function scheduleWhiteboardNote(noteId: number, date: string | null) {
  return request<{ note: WhiteboardNote }>('/plan/schedule-note', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noteId, date }),
  });
}

export function promoteNoteToWork(noteId: number, options: Record<string, unknown>) {
  return request<{ item: WorkItem }>('/plan/promote-note', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noteId, ...options }),
  });
}

export function fetchTransactionMeta() {
  return request<TransactionMeta>('/transactions/meta');
}

export function fetchFinanceSummary(month?: string, projectId?: number) {
  const q = new URLSearchParams();
  if (month) q.set('month', month);
  if (projectId) q.set('projectId', String(projectId));
  const qs = q.toString();
  return request<{ summary: FinanceSummary }>(`/transactions/summary${qs ? `?${qs}` : ''}`);
}

export function fetchTransactions(params?: { type?: string; month?: string; date?: string; projectId?: number }) {
  const q = new URLSearchParams();
  if (params?.type) q.set('type', params.type);
  if (params?.month) q.set('month', params.month);
  if (params?.date) q.set('date', params.date);
  if (params?.projectId) q.set('projectId', String(params.projectId));
  const qs = q.toString();
  return request<{ transactions: Transaction[] }>(`/transactions${qs ? `?${qs}` : ''}`);
}

export function createTransaction(data: Record<string, unknown>) {
  return request<{ transaction: Transaction }>('/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function fetchDiscussions(params?: { entityType?: string; entityId?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.entityType) q.set('entityType', params.entityType);
  if (params?.entityId != null) q.set('entityId', String(params.entityId));
  if (params?.limit) q.set('limit', String(params.limit));
  const qs = q.toString();
  return request<{ discussions: Discussion[] }>(`/discussions${qs ? `?${qs}` : ''}`);
}

export function postDiscussion(data: { entityType: string; entityId?: number | null; content: string }) {
  return request<{ discussion: Discussion }>('/discussions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function fetchWhiteboards() {
  return request<{ whiteboards: Whiteboard[] }>('/whiteboards');
}

export function fetchWhiteboard(id: number) {
  return request<{ whiteboard: Whiteboard; notes: WhiteboardNote[] }>(`/whiteboards/${id}`);
}

export function createWhiteboard(data: { title: string; description?: string }) {
  return request<{ whiteboard: Whiteboard }>('/whiteboards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function createWhiteboardNote(whiteboardId: number, data: Partial<WhiteboardNote>) {
  return request<{ note: WhiteboardNote }>(`/whiteboards/${whiteboardId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function updateWhiteboardNote(noteId: number, data: Partial<WhiteboardNote>) {
  return request<{ note: WhiteboardNote }>(`/whiteboards/notes/${noteId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function deleteWhiteboardNote(noteId: number) {
  return request<{ ok: boolean }>(`/whiteboards/notes/${noteId}`, { method: 'DELETE' });
}

export function fetchActivity(params?: {
  projectId?: number; entityType?: string; entityId?: number;
  date?: string; from?: string; to?: string; limit?: number;
}) {
  const q = new URLSearchParams();
  if (params?.projectId) q.set('projectId', String(params.projectId));
  if (params?.entityType) q.set('entityType', params.entityType);
  if (params?.entityId) q.set('entityId', String(params.entityId));
  if (params?.date) q.set('date', params.date);
  if (params?.from) q.set('from', params.from);
  if (params?.to) q.set('to', params.to);
  if (params?.limit) q.set('limit', String(params.limit));
  const qs = q.toString();
  return request<{ events: import('../types').ActivityEvent[] }>(`/activity${qs ? `?${qs}` : ''}`);
}

export function fetchEntityStateAt(entityType: string, entityId: number, asOf: string) {
  const q = new URLSearchParams({ entityType, entityId: String(entityId), asOf });
  return request<{ state: Record<string, string>; asOf: string }>(`/activity/state?${q}`);
}

export function fetchEntityVersions(entityType: string, entityId: number, limit = 100) {
  const q = new URLSearchParams({ entityType, entityId: String(entityId), limit: String(limit) });
  return request<{ versions: EntityVersion[] }>(`/activity/versions?${q}`);
}

export function fetchAttachments(entityType: string, entityId: number) {
  const q = new URLSearchParams({ entityType, entityId: String(entityId) });
  return request<{ attachments: Attachment[] }>(`/attachments?${q}`);
}

export async function uploadAttachment(entityType: string, entityId: number, file: File) {
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return request<{ attachment: Attachment }>('/attachments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      entityType,
      entityId,
      data,
      contentType: file.type,
      originalName: file.name,
    }),
  });
}

export function deleteAttachment(id: number) {
  return request<{ ok: boolean }>(`/attachments/${id}`, { method: 'DELETE' });
}

export function attachmentDownloadUrl(id: number) {
  const API = import.meta.env.VITE_TRACKER_API || '/api';
  return `${API}/attachments/${id}/download`;
}

export function fetchJournal(params?: { date?: string; projectId?: number }) {
  const q = new URLSearchParams();
  if (params?.date) q.set('date', params.date);
  if (params?.projectId) q.set('projectId', String(params.projectId));
  const qs = q.toString();
  return request<{ entries: import('../types').JournalEntry[] }>(`/journal${qs ? `?${qs}` : ''}`);
}

export function createJournalEntry(data: Record<string, unknown>) {
  return request<{ entry: import('../types').JournalEntry }>('/journal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function fetchDecisions(params?: { projectId?: number; status?: string; date?: string }) {
  const q = new URLSearchParams();
  if (params?.projectId) q.set('projectId', String(params.projectId));
  if (params?.status) q.set('status', params.status);
  if (params?.date) q.set('date', params.date);
  const qs = q.toString();
  return request<{ decisions: import('../types').Decision[] }>(`/decisions${qs ? `?${qs}` : ''}`);
}

export function createDecision(data: Record<string, unknown>) {
  return request<{ decision: import('../types').Decision }>('/decisions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function updateDecisionStatus(id: number, status: string) {
  return request<{ decision: import('../types').Decision }>(`/decisions/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export function fetchProjectMembers(projectId: number) {
  return request<{ members: import('../types').ProjectMember[]; creator: Project | null }>(`/projects/${projectId}/members`);
}

export function addProjectMember(projectId: number, userId: number, role: string) {
  return request<{ member: import('../types').ProjectMember }>(`/projects/${projectId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, role }),
  });
}

export function removeProjectMember(projectId: number, userId: number) {
  return request<{ ok: boolean }>(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' });
}

export function fetchUsers(projectId?: number) {
  const qs = projectId ? `?projectId=${projectId}` : '';
  return request<{ users: User[] }>(`/projects/meta/users${qs}`);
}

export function fetchProjectInvites(projectId: number) {
  return request<{ invites: import('../types').ProjectInvite[] }>(`/projects/${projectId}/invites`);
}

export function createProjectInvite(
  projectId: number,
  role: 'viewer' | 'contributor' | 'manager',
  email?: string,
) {
  return request<{ invite: import('../types').ProjectInvite; emailWarning?: string }>(`/projects/${projectId}/invites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role,
      expiresInDays: 14,
      maxUses: 1,
      ...(email ? { email } : {}),
    }),
  });
}

export function revokeProjectInvite(projectId: number, inviteId: number) {
  return request<{ ok: boolean }>(`/projects/${projectId}/invites/${inviteId}`, { method: 'DELETE' });
}

export function fetchInvitePreview(token: string) {
  return request<{ invite: import('../types').InvitePreview }>(`/invites/${token}`);
}

export function acceptProjectInvite(token: string) {
  return request<{ projectId: number; role: string; projectUrl: string }>(`/invites/${token}/accept`, {
    method: 'POST',
  });
}

export function promoteIdeaToStory(ideaId: number, data?: Record<string, unknown>) {
  return request<{ item: WorkItem }>(`/work-items/${ideaId}/promote-story`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data || {}),
  });
}

export function fetchReminders(params?: { date?: string; projectId?: number; upcoming?: boolean }) {
  const q = new URLSearchParams();
  if (params?.date) q.set('date', params.date);
  if (params?.projectId) q.set('projectId', String(params.projectId));
  if (params?.upcoming) q.set('upcoming', 'true');
  const qs = q.toString();
  return request<{ reminders: import('../types').Reminder[] }>(`/reminders${qs ? `?${qs}` : ''}`);
}

export function createReminder(data: Record<string, unknown>) {
  return request<{ reminder: import('../types').Reminder }>('/reminders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function completeReminder(id: number) {
  return request<{ reminder: import('../types').Reminder }>(`/reminders/${id}/complete`, { method: 'PATCH' });
}
