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

export type WorkItemContentSection = {
  id: string;
  title: string;
  hint: string;
  content: string;
  accent: 'overview' | 'notes' | 'custom' | 'purple' | 'green' | 'pink' | 'teal';
  builtin?: 'description' | 'implementation_notes';
};

export type WorkItem = {
  id: number;
  cluster_id: number | null;
  parent_id?: number | null;
  title: string;
  description: string | null;
  acceptance_criteria?: string | null;
  implementation_notes?: string | null;
  content_sections?: WorkItemContentSection[] | string | null;
  item_type: 'task' | 'story' | 'work' | 'idea';
  idea_stage?: string | null;
  status: string;
  priority: string;
  story_points?: number | null;
  due_date: string | null;
  start_date?: string | null;
  cluster_name: string | null;
  cluster_color: string | null;
  created_by_name: string;
  created_by?: number;
  owner_id?: number | null;
  owner_name?: string | null;
};

export type WorkStats = {
  total: number;
  open_count: number;
  in_progress: number;
  due_today: number;
  overdue: number;
};

export type CalendarEntry = {
  kind: 'work' | 'idea';
  role?: 'start' | 'due' | 'scheduled';
  id: number;
  title: string;
  item_type?: string;
  status?: string;
  priority?: string;
  color: string;
  cluster_name?: string | null;
  link: string;
};

export type DayAgenda = {
  ideas: WorkItem[];
  stories: WorkItem[];
  tasks: WorkItem[];
  work: WorkItem[];
  board_ideas: WhiteboardNote[];
};

export type DaybookSummary = {
  date: string;
  agenda: DayAgenda;
  transactions: Transaction[];
  discussions: Discussion[];
  journal: JournalEntry[];
  decisions: Decision[];
  activity: ActivityEvent[];
  reminders: Reminder[];
  overdue: WorkItem[];
  counts: {
    work: number;
    board_ideas: number;
    transactions: number;
    discussions: number;
    journal: number;
    decisions: number;
    activity: number;
    reminders: number;
    overdue: number;
  };
};

export type DayMeta = {
  work: number;
  finance: number;
  reminders: number;
  discussions: number;
  activity: number;
};

export type CalendarGlimpse = {
  type: 'work' | 'finance' | 'reminder' | 'discussion' | 'decision' | 'idea' | 'created' | 'status' | 'updated' | 'activity' | 'attachment';
  label: string;
  sub?: string;
  color?: string;
  link?: string;
};

export type CalendarDayGlimpses = {
  items: CalendarGlimpse[];
  total: number;
  overflow: number;
  activityCount?: number;
};

export type Attachment = {
  id: number;
  entity_type: string;
  entity_id: number;
  file_name: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  uploaded_by: number;
  uploaded_by_name: string;
  created_at: string;
};

export type EntityVersion = {
  id: number;
  entity_type: string;
  entity_id: number;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  actor_id: number;
  actor_name: string;
  created_at: string;
};

export type Reminder = {
  id: number;
  title: string;
  notes: string | null;
  reminder_date: string;
  reminder_time: string | null;
  project_id: number | null;
  work_item_id: number | null;
  created_by_name: string;
  project_name?: string | null;
  completed_at: string | null;
};

export type ActivityEvent = {
  id: number;
  event_type: string;
  entity_type: string;
  entity_id: number | null;
  project_id: number | null;
  actor_id: number;
  actor_name: string;
  summary: string;
  payload: Record<string, unknown> | null;
  created_at: string;
};

export type JournalEntry = {
  id: number;
  entry_date: string;
  project_id: number | null;
  author_id: number;
  author_name: string;
  project_name?: string | null;
  content: string;
  blockers: string | null;
  learnings: string | null;
  next_steps: string | null;
  created_at: string;
};

export type Decision = {
  id: number;
  project_id: number | null;
  title: string;
  rationale: string | null;
  status: 'proposed' | 'approved' | 'superseded' | 'rejected';
  decided_at: string | null;
  work_item_id: number | null;
  created_by_name: string;
  project_name?: string | null;
  created_at: string;
};

export type ProjectMember = {
  id: number;
  project_id: number;
  user_id: number;
  role: 'owner' | 'manager' | 'contributor' | 'viewer';
  name: string;
  email: string;
};

export type EntityLink = {
  id: number;
  source_type: string;
  source_id: number;
  target_type: string;
  target_id: number;
  link_type: string;
  created_by_name: string;
  created_at: string;
};

export const IDEA_STAGES = ['captured', 'refining', 'needs_input', 'approved', 'rejected', 'paused'] as const;

export type Transaction = {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string | null;
  transaction_date: string;
  payment_method: string;
  paid_by: string;
  project_id?: number | null;
  created_by_name: string;
};

export type FinanceSummary = {
  total_income: number;
  total_expense: number;
  net: number;
  balance: number;
};

export type TransactionMeta = {
  categories: string[];
  paymentMethods: string[];
  paidByOptions: string[];
};

export type Discussion = {
  id: number;
  entity_type: string;
  entity_id: number | null;
  content: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
};

export type Whiteboard = {
  id: number;
  title: string;
  description: string | null;
  created_by: number;
  created_by_name: string;
  note_count?: number;
  updated_at?: string;
};

export type WhiteboardNote = {
  id: number;
  whiteboard_id: number;
  content: string;
  color: string;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
  scheduled_date?: string | null;
  author_name?: string;
  board_title?: string;
};

export const WORK_STATUSES = ['backlog', 'todo', 'in_progress', 'review', 'done'] as const;
export const WORK_ITEM_TYPES = ['task', 'story', 'work', 'idea'] as const;
export const WORK_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export const NOTE_COLORS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa', '#e9d5ff'];

export const PROJECT_TABS = [
  'board',
  'plan',
  'finance',
  'people',
] as const;

export type ProjectTab = (typeof PROJECT_TABS)[number];

export function workTypeColor(type: string) {
  return { idea: '#eab308', story: '#8b5cf6', task: '#3b82f6', work: '#22c55e' }[type] || '#64748b';
}

export function statusLabel(status: string) {
  return status.replace(/_/g, ' ');
}

export function calendarEntryLabel(title: string, max = 28) {
  return title.length > max ? `${title.slice(0, max - 2)}…` : title;
}
