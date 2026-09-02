import { Decimal } from './money.js';
import { DAY_COUNT_BASIS } from './constants.js';

/**
 * Parse YYYY-MM-DD as UTC date-only (no timezone drift).
 */
export function parseDateOnly(dateStr) {
  if (!dateStr) throw new Error('Date required');
  const s = String(dateStr).slice(0, 10);
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
