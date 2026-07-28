const CLINIC_TZ = 'Asia/Kolkata';

export function clinicTodayYmd(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: CLINIC_TZ });
}

export function apptDayKey(iso: string): string {
  return iso.slice(0, 10);
}

export function isApptToday(iso: string): boolean {
  return apptDayKey(iso) === clinicTodayYmd();
}

export function isApptTomorrow(iso: string): boolean {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return apptDayKey(iso) === d.toLocaleDateString('en-CA', { timeZone: CLINIC_TZ });
}

/** Short day label — Today, Tomorrow, or Wed 30 Jul */
export function formatApptDayLabel(iso: string): string {
  if (isApptToday(iso)) return 'Today';
  if (isApptTomorrow(iso)) return 'Tomorrow';
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function formatApptTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** Day + time for lists — e.g. "Tomorrow · 10:00 AM" */
export function formatApptWhen(iso: string): string {
  return `${formatApptDayLabel(iso)} · ${formatApptTime(iso)}`;
}

export function formatTodayHeader(): string {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: CLINIC_TZ,
  });
}
