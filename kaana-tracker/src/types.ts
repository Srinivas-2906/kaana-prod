export type User = {
  id: number;
  name: string;
  email: string;
};

export type Project = {
  id: number;
  name: string;
  description: string | null;
  color: string;
  created_by: number;
  created_by_name: string;
  item_count: number;
  open_count: number;
};

export type WorkItem = {
  id: number;
  cluster_id: number | null;
  title: string;
  description: string | null;
  item_type: 'task' | 'story' | 'work' | 'idea';
  status: string;
  priority: string;
  due_date: string | null;
  cluster_name: string | null;
  cluster_color: string | null;
  created_by_name: string;
};

export type WorkStats = {
  total: number;
  open_count: number;
  in_progress: number;
  due_today: number;
  overdue: number;
};

export const PROJECT_TABS = [
  'overview',
  'timeline',
  'ideas',
  'plan',
  'board',
  'whiteboard',
  'decisions',
  'people',
  'finance',
  'settings',
] as const;

export type ProjectTab = (typeof PROJECT_TABS)[number];
