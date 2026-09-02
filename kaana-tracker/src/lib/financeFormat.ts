import type { LedgerType, Transaction } from '../types';

export function formatINR(amount: number, opts?: { sign?: boolean; ledgerType?: LedgerType | string }) {
  const formatted = `₹${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  if (!opts?.sign) return formatted;
  const lt = opts.ledgerType || 'expense';
  const positive = lt === 'income' || lt === 'capital_contribution';
  const prefix = amount < 0 ? '-' : positive ? '+' : '-';
  return `${prefix}${formatted.replace('₹', '₹')}`;
}

export function ledgerTypeLabel(lt: string) {
  const labels: Record<string, string> = {
    expense: 'Expense',
    income: 'Income',
    capital_contribution: 'Capital Contribution',
    reimbursement: 'Reimbursement',
    withdrawal: 'Withdrawal',
    distribution: 'Distribution',
  };
  return labels[lt] || lt;
}

export function isIncomeLike(tx: Transaction) {
  const lt = tx.ledger_type || tx.type;
  return lt === 'income';
}

export function txAmountColor(tx: Transaction) {
  return isIncomeLike(tx) ? '#16a34a' : '#dc2626';
}

export function formatRateDecimal(rate: number) {
  return `${(rate * 100).toFixed(1)}%`;
}

export function addDaysISO(dateStr: string, days: number) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const RATE_PRESETS = [
  { label: 'Conservative (6%)', value: 0.06 },
  { label: 'Standard (10%)', value: 0.10 },
  { label: 'Founder target (12%)', value: 0.12 },
  { label: 'Inflation-oriented (8%)', value: 0.08 },
];
