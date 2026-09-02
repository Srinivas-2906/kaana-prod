import { Decimal } from './money.js';
import { DAY_COUNT_BASIS } from './constants.js';

/**
 * Normalize DB/API values to YYYY-MM-DD (handles Date objects from mysql2).
 */
export function toDateOnlyString(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new Error('Invalid date');
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, '0');
    const d = String(value.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const parsed = new Date(s);
  if (Number.isNaN(parsed.getTime())) throw new Error('Invalid date');
  return toDateOnlyString(parsed);
}

/**
 * Parse YYYY-MM-DD as UTC date-only (no timezone drift).
 */
export function parseDateOnly(dateStr) {
  const s = toDateOnlyString(dateStr);
  if (!s) throw new Error('Date required');
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) throw new Error('Invalid date');
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatDateOnly(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Calendar day difference: targetDate - transactionDate */
export function daysBetween(fromDateStr, toDateStr) {
  const from = parseDateOnly(fromDateStr);
  const to = parseDateOnly(toDateStr);
  const msPerDay = 86400000;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
}

export function addCalendarDays(dateStr, days) {
  const d = parseDateOnly(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return formatDateOnly(d);
}

/**
 * adjustedValue = amount × (1 + annualRate) ^ (days / dayCountBasis)
 * Returns Decimal; no rounding until presentation.
 */
export function adjustCashFlow(amount, transactionDate, targetDate, annualRate) {
  const amt = new Decimal(amount);
  const rate = new Decimal(annualRate ?? 0);
  const days = daysBetween(transactionDate, targetDate);

  if (days < 0) {
    return new Decimal(0);
  }
  if (days === 0 || rate.isZero()) {
    return amt;
  }

  const exponent = new Decimal(days).div(DAY_COUNT_BASIS);
  const factor = rate.plus(1).pow(exponent);
  return amt.times(factor);
}
