export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Normalize API date/datetime strings to YYYY-MM-DD for inputs and display */
export function dateOnly(val: string | null | undefined) {
  if (!val) return '';
  const s = String(val);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toISOString().slice(0, 10);
}

export function monthStart(month: string) {
  return `${month}-01`;
}

export function monthEnd(month: string) {
  const [y, m] = month.split('-').map(Number);
  const last = new Date(y, m, 0).getDate();
  return `${month}-${String(last).padStart(2, '0')}`;
}

export function currentMonth() {
  return todayISO().slice(0, 7);
}

export function addMonths(month: string, delta: number) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function calendarDays(month: string) {
  const [y, m] = month.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const lastDay = new Date(y, m, 0).getDate();
  const startPad = first.getDay();
  const days: { date: string; inMonth: boolean }[] = [];

  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(y, m - 1, -i);
    days.push({ date: d.toISOString().slice(0, 10), inMonth: false });
  }
  for (let day = 1; day <= lastDay; day++) {
    days.push({ date: `${month}-${String(day).padStart(2, '0')}`, inMonth: true });
  }
  while (days.length % 7 !== 0) {
    const last = days[days.length - 1];
    const d = new Date(last.date);
    d.setDate(d.getDate() + 1);
    days.push({ date: d.toISOString().slice(0, 10), inMonth: false });
  }
  return days;
}

export function formatDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatMonthLabel(month: string) {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function addDays(iso: string, delta: number) {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

export function weekStartDate(ref = todayISO()) {
  const d = new Date(ref + 'T12:00:00');
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

export function weekDates(weekStart: string) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}
