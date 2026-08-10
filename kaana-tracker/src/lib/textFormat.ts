export function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder = 'text',
) {
  const { value, selectionStart: start, selectionEnd: end } = textarea;
  const selected = value.slice(start, end) || placeholder;
  const next = value.slice(0, start) + before + selected + after + value.slice(end);
  const cursorStart = start + before.length;
  const cursorEnd = cursorStart + selected.length;
  return { next, cursorStart, cursorEnd };
}

export function prefixSelectedLines(textarea: HTMLTextAreaElement, prefix: string) {
  const { value, selectionStart, selectionEnd } = textarea;
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
  const lineEnd = value.indexOf('\n', selectionEnd);
  const end = lineEnd === -1 ? value.length : lineEnd;
  const block = value.slice(lineStart, end);
  const lines = block.split('\n');
  const allPrefixed = lines.every((line) => line.startsWith(prefix));
  const updated = lines
    .map((line) => (allPrefixed ? line.slice(prefix.length) : prefix + line))
    .join('\n');
  const next = value.slice(0, lineStart) + updated + value.slice(end);
  return { next, cursorStart: lineStart, cursorEnd: lineStart + updated.length };
}

export function insertLink(textarea: HTMLTextAreaElement) {
  const { value, selectionStart: start, selectionEnd: end } = textarea;
  const label = value.slice(start, end) || 'link text';
  const snippet = `[${label}](https://)`;
  const next = value.slice(0, start) + snippet + value.slice(end);
  const urlStart = start + label.length + 3;
  return { next, cursorStart: urlStart, cursorEnd: urlStart + 8 };
}

export function applyTextareaUpdate(
  textarea: HTMLTextAreaElement,
  next: string,
  cursorStart: number,
  cursorEnd: number,
  onChange: (value: string) => void,
) {
  onChange(next);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(cursorStart, cursorEnd);
  });
}
