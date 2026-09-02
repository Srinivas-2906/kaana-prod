/** Ledger transaction types */
export const LEDGER_TYPES = [
  'expense',
  'income',
  'capital_contribution',
  'reimbursement',
  'withdrawal',
  'distribution',
];

/** Legacy type column values (backward compat) */
export const LEGACY_TYPES = ['income', 'expense'];

export const FUNDING_SOURCES = ['company_account', 'partner_personal', 'legacy_unknown'];

export const TRANSACTION_STATUSES = ['active', 'void'];

export const DAY_COUNT_BASIS = 365;

/** Rate stored as decimal fraction: 0.10 = 10% */
export const DEFAULT_CAPITAL_ADJUSTMENT_RATE = 0.10;

export const LEDGER_TYPE_LABELS = {
  expense: 'Expense',
  income: 'Income',
  capital_contribution: 'Capital Contribution',
  reimbursement: 'Reimbursement',
  withdrawal: 'Withdrawal',
  distribution: 'Distribution',
};

/** Map ledger_type to legacy type column for backward compat inserts */
export function legacyTypeForLedger(ledgerType) {
  if (ledgerType === 'income') return 'income';
  if (ledgerType === 'expense') return 'expense';
  return 'expense';
}

/** Map funding_source to legacy paid_by for backward compat */
export function legacyPaidByForFunding(fundingSource, ledgerType) {
  if (ledgerType === 'income') return 'Company';
  if (fundingSource === 'company_account') return 'Company';
  if (fundingSource === 'partner_personal') return 'Partner';
  return 'Company';
}
