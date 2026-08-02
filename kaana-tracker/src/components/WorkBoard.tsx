import { useEffect, useMemo, useState } from 'react';
import { updateWorkItemStatus } from '../lib/api';
import { buildBoardHierarchy } from '../lib/boardHierarchy';
import { WorkItemCard } from './WorkItemCard';
import { IssuePanel } from './IssuePanel';
import type { WorkItem } from '../types';
import { WORK_STATUSES, statusLabel } from '../types';

export function WorkBoard({
  items: initial,
  onChange,
}: {
  items: WorkItem[];
  onChange?: () => void;
}) {
  const [items, setItems] = useState(initial);
  const [dragId, setDragId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const { roots, childrenByParent } = useMemo(() => buildBoardHierarchy(items), [items]);

  const byStatus = WORK_STATUSES.reduce(
    (acc, s) => {
      acc[s] = roots.filter((i) => i.status === s);
      return acc;
    },
    {} as Record<string, WorkItem[]>,
  );

  async function drop(status: string) {
    if (dragId == null) return;
    const item = items.find((i) => i.id === dragId);
    if (!item || item.status === status) return;
    setItems((prev) => prev.map((i) => (i.id === dragId ? { ...i, status } : i)));
    try {
      await updateWorkItemStatus(dragId, status);
      onChange?.();
    } catch {
      setItems(initial);
    }
    setDragId(null);
  }

  async function toggleSubtask(task: WorkItem) {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    setItems((prev) => prev.map((i) => (i.id === task.id ? { ...i, status: nextStatus } : i)));
    try {
      await updateWorkItemStatus(task.id, nextStatus);
      onChange?.();
    } catch {
      setItems(initial);
    }
  }

  return (
    <>
      <div className="kanban">
        {WORK_STATUSES.map((status) => (
          <div
            key={status}
            className="kanban-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => drop(status)}
          >
            <div className="kanban-col-head">
              {statusLabel(status)}
              <span className="muted">{byStatus[status].length}</span>
            </div>
            {byStatus[status].map((item) => (
              <div
                key={item.id}
                className="kanban-card-wrap"
                draggable
                onDragStart={() => setDragId(item.id)}
                onDragEnd={() => setDragId(null)}
              >
                <WorkItemCard
                  item={item}
                  subtasks={childrenByParent.get(item.id) || []}
                  onSelect={() => setSelectedId(item.id)}
                  onToggleSubtask={toggleSubtask}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {selectedId != null && (
        <IssuePanel
          itemId={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdate={onChange}
        />
      )}
    </>
  );
}
