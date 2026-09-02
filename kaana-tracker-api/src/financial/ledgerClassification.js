import { LEDGER_TYPES } from './constants.js';

/** Normalize ledger type from row (prefer ledger_type, fall back to type) */
export function resolveLedgerType(row) {
  const lt = row.ledger_type || row.type;
  if (LEDGER_TYPES.includes(lt)) return lt;
  if (lt === 'income') return 'income';
  if (lt === 'expense') return 'expense';
  return 'expense';
}

export function isActive(row) {
  return (row.status || 'active') === 'active';
}

export function countsAsActualExpense(row) {
  return isActive(row) && resolveLedgerType(row) === 'expense';
}

export function countsAsActualIncome(row) {
  return isActive(row) && resolveLedgerType(row) === 'income';
}

export function countsInAccountingBreakEven(row) {
  const lt = resolveLedgerType(row);
  return isActive(row) && (lt === 'expense' || lt === 'income');
}

export function countsInEconomicBreakEven(row) {
  return countsInAccountingBreakEven(row);
}

export function countsInPartnerExposure(row) {
  const lt = resolveLedgerType(row);
  return isActive(row) && [
    'expense',
    'capital_contribution',
    'reimbursement',
    'withdrawal',
    'distribution',
  ].includes(lt);
}

export function isPartnerPersonalExpense(row) {
  return isActive(row)
    && resolveLedgerType(row) === 'expense'
    && (row.funding_source === 'partner_personal' || row.funding_source === 'legacy_unknown');
}
