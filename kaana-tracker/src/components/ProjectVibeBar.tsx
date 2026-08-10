import { useState } from 'react';
import { updateProjectVibe } from '../lib/api';

const STATUSES = [
  { emoji: 'green', message: 'On track — progressing as planned' },
  { emoji: 'amber', message: 'Waiting on client input' },
  { emoji: 'blue', message: 'In review — feedback welcome' },
  { emoji: 'indigo', message: 'Recently delivered — check updates' },
];

const DOT_CLASS: Record<string, string> = {
  green: 'status-dot-green',
  amber: 'status-dot-amber',
  blue: 'status-dot-blue',
  indigo: 'status-dot-indigo',
};

export function ProjectVibeBar({
  projectId,
  emoji,
  message,
  onUpdate,
  compact = false,
}: {
  projectId: number;
  emoji?: string | null;
  message?: string | null;
  onUpdate?: (emoji: string, msg: string) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function pickStatus(s: (typeof STATUSES)[number]) {
    setBusy(true);
    try {
      await updateProjectVibe(projectId, { emoji: s.emoji, message: s.message });
      onUpdate?.(s.emoji, s.message);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  const dotClass = emoji ? DOT_CLASS[emoji] || 'status-dot-indigo' : '';
  const displayText = message
    ? (compact ? message.split('—')[0].trim() : message)
    : (compact ? 'Status' : 'Set project status…');

  return (
    <div className={`project-status-bar${compact ? ' project-status-bar-compact' : ''}`}>
      <button
        type="button"
        className="project-status-current"
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        title={message || undefined}
      >
        {emoji && <span className={`project-status-dot ${dotClass}`} aria-hidden />}
        <span className="project-status-text">{displayText}</span>
        <span className="project-status-caret">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="project-status-picker">
          {STATUSES.map((s) => (
            <button
              key={s.emoji}
              type="button"
              className={`project-status-option${emoji === s.emoji ? ' active' : ''}`}
              onClick={() => pickStatus(s)}
              disabled={busy}
            >
              <span className={`project-status-dot ${DOT_CLASS[s.emoji]}`} aria-hidden />
              <span>{s.message}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
