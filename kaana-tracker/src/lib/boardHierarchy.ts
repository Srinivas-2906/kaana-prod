import type { WorkItem } from '../types';

export function buildBoardHierarchy(items: WorkItem[]) {
  const byId = new Map(items.map((item) => [item.id, item]));

  function isRoot(item: WorkItem) {
    if (!item.parent_id) return true;
    return !byId.has(item.parent_id);
  }

  const roots = items.filter(isRoot);
  const childrenByParent = new Map<number, WorkItem[]>();

  for (const item of items) {
    if (!item.parent_id || !byId.has(item.parent_id)) continue;
    const list = childrenByParent.get(item.parent_id) || [];
    list.push(item);
    childrenByParent.set(item.parent_id, list);
  }

  for (const [parentId, children] of childrenByParent) {
    childrenByParent.set(
      parentId,
      [...children].sort((a, b) => a.id - b.id),
    );
  }

  return { roots, childrenByParent };
}

export function taskProgress(tasks: WorkItem[]) {
  const done = tasks.filter((t) => t.status === 'done').length;
  return { done, total: tasks.length };
}
