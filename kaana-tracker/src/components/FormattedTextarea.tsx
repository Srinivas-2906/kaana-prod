import { useRef } from 'react';
import { Bold, Italic, Link, List, ListOrdered, Code } from 'lucide-react';
import {
  applyTextareaUpdate,
  insertLink,
  prefixSelectedLines,
  wrapSelection,
} from '../lib/textFormat';

type Tool = 'bold' | 'italic' | 'bullet' | 'numbered' | 'link' | 'code';

const TOOLS: { id: Tool; icon: typeof Bold; label: string; shortcut?: string }[] = [
  { id: 'bold', icon: Bold, label: 'Bold', shortcut: '⌘B' },
  { id: 'italic', icon: Italic, label: 'Italic', shortcut: '⌘I' },
  { id: 'bullet', icon: List, label: 'Bullet list' },
  { id: 'numbered', icon: ListOrdered, label: 'Numbered list' },
  { id: 'link', icon: Link, label: 'Link' },
  { id: 'code', icon: Code, label: 'Inline code' },
];

export function FormattedTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function runTool(tool: Tool) {
    const el = ref.current;
    if (!el) return;

    let result: { next: string; cursorStart: number; cursorEnd: number };
    switch (tool) {
      case 'bold':
        result = wrapSelection(el, '**', '**', 'bold text');
        break;
      case 'italic':
        result = wrapSelection(el, '*', '*', 'italic text');
        break;
      case 'code':
        result = wrapSelection(el, '`', '`', 'code');
        break;
      case 'bullet':
        result = prefixSelectedLines(el, '- ');
        break;
      case 'numbered':
        result = prefixSelectedLines(el, '1. ');
        break;
      case 'link':
        result = insertLink(el);
        break;
      default:
        return;
    }
    applyTextareaUpdate(el, result.next, result.cursorStart, result.cursorEnd, onChange);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;
    if (e.key === 'b') {
      e.preventDefault();
      runTool('bold');
    } else if (e.key === 'i') {
      e.preventDefault();
      runTool('italic');
    }
  }

  return (
    <div className="fmt-textarea-wrap">
      <div className="fmt-toolbar" role="toolbar" aria-label="Formatting">
        {TOOLS.map(({ id, icon: Icon, label, shortcut }) => (
          <button
            key={id}
            type="button"
            className="fmt-toolbar-btn"
            title={shortcut ? `${label} (${shortcut})` : label}
            aria-label={label}
            onClick={() => runTool(id)}
          >
            <Icon size={15} />
          </button>
        ))}
      </div>
      <textarea
        ref={ref}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={rows}
        className="fmt-textarea"
      />
      <p className="fmt-hint muted">Select text to format · ⌘B bold · ⌘I italic</p>
    </div>
  );
}
