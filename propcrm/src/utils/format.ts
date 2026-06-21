import type { Lead, SortKey } from '../types';

export function formatCr(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
  return `₹${Math.round(n / 100000)}L`;
}

export function parseBudget(str: string): number {
  const n = parseFloat(String(str).replace(/[^\d.]/g, ''));
  if (/cr/i.test(str)) return n * 10000000;
  if (/l/i.test(str)) return n * 100000;
  return n || 0;
}

export function scoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

export function scoreBorderColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function initials(name: string): string {
  return name.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export function filterLeads<T extends { name: string; phone: string; prop: string; source: string }>(
  list: T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (l) =>
      l.name.toLowerCase().includes(q) ||
      l.prop.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.source.toLowerCase().includes(q),
  );
}

export function sortLeads(list: Lead[], key: SortKey, dir: 1 | -1): Lead[] {
  return [...list].sort((a, b) => {
    let av: string | number = a[key];
    let bv: string | number = b[key];
    if (key === 'name') {
      av = a.name.toLowerCase();
      bv = b.name.toLowerCase();
    }
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
}
