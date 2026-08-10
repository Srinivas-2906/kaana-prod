import { Fragment, type ReactNode } from 'react';

function parseInline(text: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(pattern).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('_') && part.endsWith('_')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="fmt-code">{part.slice(1, -1)}</code>;
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      const href = link[2];
      const safe = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:');
      if (!safe) return part;
      return (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="fmt-link">
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

type Block =
  | { type: 'p'; lines: string[] }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] };

function parseBlocks(text: string): Block[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i += 1;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i += 1;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }
    if (!line.trim()) {
      i += 1;
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^\s*[-*]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i])) {
      para.push(lines[i]);
      i += 1;
    }
    blocks.push({ type: 'p', lines: para });
  }
  return blocks;
}

export function FormattedContent({ text }: { text: string }) {
  if (!text.trim()) return null;
  const blocks = parseBlocks(text);
  return (
    <div className="fmt-content">
      {blocks.map((block, idx) => {
        if (block.type === 'ul') {
          return (
            <ul key={idx}>
              {block.items.map((item, j) => (
                <li key={j}>{parseInline(item)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === 'ol') {
          return (
            <ol key={idx}>
              {block.items.map((item, j) => (
                <li key={j}>{parseInline(item)}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={idx}>
            {block.lines.map((line, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {parseInline(line)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
