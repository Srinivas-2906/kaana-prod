export function deriveProjectKey(name) {
  const words = String(name || '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length >= 2) {
    return `${words[0].slice(0, 4)}${words[1].slice(0, 2)}`.toUpperCase().slice(0, 8);
  }
  const compact = String(name || 'PROJ').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return (compact || 'PROJ').slice(0, 8);
}

export function formatIssueKey(projectKey, workItemId) {
  const key = String(projectKey || 'ITEM').toUpperCase();
  return `${key}-${workItemId}`;
}
