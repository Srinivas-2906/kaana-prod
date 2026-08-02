import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, ChevronDown, ChevronRight, ClipboardList, Square } from 'lucide-react';
import { dateOnly } from '../lib/dates';
import { taskProgress } from '../lib/boardHierarchy';
import type { WorkItem } from '../types';
import { statusLabel, workTypeColor } from '../types';

function initials(name?: string | null) {
  if (!name) return '?';
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

function SubtaskRow({
  task,
  onSelect,
  onToggleDone,
}: {
  task: WorkItem;
  onSelect?: (item: WorkItem) => void;
  onToggleDone?: (task: WorkItem) => void;
}) {
  const isDone = task.status === 'done';

  return (
    <div className={`work-card-subtask${isDone ? ' work-card-subtask-done' : ''}`}>
      <button
        type="button"
        className="work-card-subtask-check"
        onClick={() => onToggleDone?.(task)}
        aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
      >
        {isDone ? <CheckSquare size={14} /> : <Square size={14} />}
      </button>
      <ClipboardList size={12} className="work-card-subtask-icon" aria-hidden />
      <button
        type="button"
        className="work-card-subtask-title"
        onClick={() => onSelect?.(task)}
      >
        {task.title}
      </button>
    </div>
  );
}

function CardMain({
  item,
  subtaskTotal,
  subtaskDone,
  commentCount,
  attachmentCount,
}: {
  item: WorkItem;
  subtaskTotal: number;
  subtaskDone: number;
  commentCount?: number;
  attachmentCount?: number;
}) {
  return (
    <>
      <div className="work-card-top">
        <span className="work-card-id">#{item.id}</span>
        <span className="work-card-type">{item.item_type}</span>
        {item.story_points != null && item.story_points > 0 && (
          <span className="work-card-points">{item.story_points} pt</span>
        )}
        {subtaskTotal > 0 && (
          <span className="work-card-task-count" title={`${subtaskDone} of ${subtaskTotal} tasks done`}>
            <ClipboardList size={11} />
            {subtaskDone}/{subtaskTotal}
          </span>
        )}
        {item.owner_name && (
          <span className="work-card-assignee" title={item.owner_name}>{initials(item.owner_name)}</span>
        )}
      </div>
      <div className="work-card-title">{item.title}</div>
      <div className="muted work-card-meta">
        {statusLabel(item.status)}
        {item.priority !== 'medium' && ` · ${item.priority}`}
        {item.due_date && ` · due ${dateOnly(item.due_date)}`}
        {commentCount ? ` · 💬 ${commentCount}` : ''}
        {attachmentCount ? ` · 📎 ${attachmentCount}` : ''}
      </div>
    </>
  );
}

function SubtaskDropdown({
  subtasks,
  onSelect,
  onToggleSubtask,
}: {
  subtasks: WorkItem[];
  onSelect?: (item: WorkItem) => void;
  onToggleSubtask?: (task: WorkItem) => void;
}) {
  const { done, total } = taskProgress(subtasks);
  const [expanded, setExpanded] = useState(total > 0);

  if (!total) return null;

  return (
    <div className="work-card-subtasks">
      <button
        type="button"
        className="work-card-subtasks-toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span>Tasks</span>
        <span className="work-card-subtasks-badge">{done}/{total}</span>
      </button>
      {expanded && (
        <div className="work-card-subtasks-list">
          {subtasks.map((task) => (
            <SubtaskRow
              key={task.id}
              task={task}
              onSelect={onSelect}
              onToggleDone={onToggleSubtask}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function WorkItemCard({
  item,
  subtasks = [],
  onSelect,
  onToggleSubtask,
  commentCount,
  attachmentCount,
}: {
  item: WorkItem;
  subtasks?: WorkItem[];
  onSelect?: (item: WorkItem) => void;
  onToggleSubtask?: (task: WorkItem) => void;
  commentCount?: number;
  attachmentCount?: number;
}) {
  const accent = item.cluster_color || workTypeColor(item.item_type);
  const { done, total } = taskProgress(subtasks);
  const main = (
    <CardMain
      item={item}
      subtaskTotal={total}
      subtaskDone={done}
      commentCount={commentCount}
      attachmentCount={attachmentCount}
    />
  );
  const tasks = (
    <SubtaskDropdown
      subtasks={subtasks}
      onSelect={onSelect}
      onToggleSubtask={onToggleSubtask}
    />
  );

  if (onSelect) {
    return (
      <div className="work-card work-card-with-tasks" style={{ borderLeftColor: accent }}>
        <div
          className="work-card-main work-card-btn"
          role="button"
          tabIndex={0}
          onClick={() => onSelect(item)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect(item);
            }
          }}
        >
          {main}
        </div>
        {tasks}
      </div>
    );
  }

  return (
    <div className="work-card work-card-with-tasks" style={{ borderLeftColor: accent }}>
      <Link to={`/work/${item.id}`} className="work-card-main">
        {main}
      </Link>
      {tasks}
    </div>
  );
}
