import { authHeaders, clearToken } from './auth';
import type { Project, User, WorkItem, WorkStats } from '../types';

const API = import.meta.env.VITE_TRACKER_API || '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      ...init,
      headers: { ...authHeaders(), ...(init?.headers || {}) },
    });
  } catch {
    throw new Error('Cannot reach tracker API. Start kaana-tracker-api on port 3011.');
  }
  if (res.status === 401) {
    clearToken();
    throw new Error('Unauthorized');
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

export function fetchWorkItems(params?: { projectId?: number; itemType?: string; mine?: boolean }) {
  const q = new URLSearchParams();
  if (params?.projectId) q.set('projectId', String(params.projectId));
  if (params?.itemType) q.set('itemType', params.itemType);
  if (params?.mine) q.set('mine', 'true');
  const qs = q.toString();
  return request<{ items: WorkItem[] }>(`/work-items${qs ? `?${qs}` : ''}`);
}
