/** Business-friendly labels (not dev/ADO jargon) */

export function businessTypeLabel(type: string) {
  return ({
    story: 'Big idea',
    task: 'Action step',
    work: 'Work item',
    idea: 'Spark',
  } as Record<string, string>)[type] || type;
}

export function businessStatusLabel(status: string) {
  return ({
    backlog: 'In the bank',
    todo: 'Ready to go',
    in_progress: 'In progress',
    review: 'Checking',
    done: 'Done',
  } as Record<string, string>)[status] || status.replace(/_/g, ' ');
}

export function businessPriorityLabel(priority: string) {
  return ({
    low: 'When you can',
    medium: 'Normal',
    high: 'Important',
    urgent: 'Urgent',
  } as Record<string, string>)[priority] || priority;
}

export const HISTORY_FIELD_LABELS: Record<string, string> = {
  title: 'Name',
  status: 'Status',
  priority: 'Priority',
  due_date: 'Target date',
  start_date: 'Start date',
  owner_id: 'Owner',
  story_points: 'Effort size',
  acceptance_criteria: 'Success checklist',
  implementation_notes: 'How-to notes',
  parent_id: 'Part of',
  description: 'Overview',
};
