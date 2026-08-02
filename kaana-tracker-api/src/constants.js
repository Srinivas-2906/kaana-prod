export const WORK_ITEM_TYPES = ['task', 'story', 'work', 'idea'];
export const WORK_STATUSES = ['backlog', 'todo', 'in_progress', 'review', 'done'];
export const WORK_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
export const DISCUSSION_ENTITY_TYPES = ['cluster', 'work_item', 'whiteboard', 'general'];

export const CATEGORIES = [
  'Client Payment', 'Intern Payment', 'Software', 'Marketing',
  'Travel', 'Equipment', 'Office', 'Miscellaneous',
];
export const PAYMENT_METHODS = ['UPI', 'Cash', 'Bank Transfer', 'Card'];
export const PAID_BY_OPTIONS = ['Company', 'Kaana', 'Partner'];

export const NOTE_COLORS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa', '#e9d5ff'];

export const CLUSTER_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f97316',
  '#22c55e', '#14b8a6', '#eab308', '#64748b',
];

export function workTypeColor(type) {
  return { idea: '#eab308', story: '#8b5cf6', task: '#3b82f6', work: '#22c55e' }[type] || '#64748b';
}
