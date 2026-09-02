import {
  computeActualTotals,
  computeAccountingBreakEven,
  computeLegacyFinanceSummary,
  filterByMonth,
} from './accountingBreakEven.js';
import { computeEconomicBreakEven } from './economicBreakEven.js';
import { computePartnerExposure } from './partnerExposure.js';
import { computeTrajectory, computeDay365Summary } from './trajectory.js';
import { addCalendarDays } from './cashFlowAdjustment.js';
import { DEFAULT_CAPITAL_ADJUSTMENT_RATE } from './constants.js';

/**
 * Canonical financial summary from in-memory transactions + settings.
 * Used by project API and calculator simulation — single source of truth.
 */
export function buildFinancialSummary({
  transactions = [],
  currency = 'INR',
  projectStartDate,
  economicBreakEvenEnabled = false,
  capitalAdjustmentRate = null,
  targetDate = null,
  revenueTarget = null,
  partnerNames = {},
  includeTrajectory = true,
  month = null,
}) {
  const activeTx = transactions.filter((tx) => (tx.status || 'active') === 'active');
  const startDate = projectStartDate || (activeTx.length
    ? activeTx.map((t) => String(t.transaction_date).slice(0, 10)).sort()[0]
    : new Date().toISOString().slice(0, 10));

  const rate = capitalAdjustmentRate ?? DEFAULT_CAPITAL_ADJUSTMENT_RATE;
  const resolvedTarget = targetDate || addCalendarDays(startDate, 365);

  const actual = month
    ? computeActualTotals(filterByMonth(activeTx, month))
    : computeActualTotals(activeTx);

  const accountingBreakEven = computeAccountingBreakEven(activeTx);
  const economicBreakEven = computeEconomicBreakEven(activeTx, resolvedTarget, rate);
  const day365 = computeDay365Summary(activeTx, startDate, rate);
  const funding = computePartnerExposure(activeTx, partnerNames);

  const trajectory = includeTrajectory
    ? computeTrajectory(activeTx, startDate, resolvedTarget, rate)
    : [];

  return {
    currency,
    actual,
    accountingBreakEven,
    economicBreakEven: {
      enabled: economicBreakEvenEnabled,
      ...economicBreakEven,
    },
    day365,
    funding,
    trajectory,
    revenueTarget: revenueTarget != null ? Number(revenueTarget) : null,
    projectStartDate: startDate,
    targetDate: resolvedTarget,
    annualCapitalAdjustmentRate: rate,
  };
}

export { computeLegacyFinanceSummary };

/** Convert cash flow inputs (calculator) to transaction-like rows */
export function cashFlowsToTransactions(cashFlows) {
  return cashFlows.map((cf, i) => ({
    id: cf.id ?? `sim-${i}`,
    amount: cf.amount,
    transaction_date: cf.date || cf.transaction_date,
    ledger_type: cf.ledger_type || cf.type,
    type: cf.type || cf.ledger_type,
    status: 'active',
    funding_source: cf.funding_source || 'company_account',
    partner_user_id: cf.partner_user_id || null,
  }));
}

export function simulateFinancialSummary(input) {
  const transactions = cashFlowsToTransactions(input.cashFlows || []);
  return buildFinancialSummary({
    transactions,
    currency: input.currency || 'INR',
    projectStartDate: input.projectStartDate,
    economicBreakEvenEnabled: true,
    capitalAdjustmentRate: input.annualCapitalAdjustmentRate ?? input.capitalAdjustmentRate,
    targetDate: input.targetDate,
    partnerNames: input.partnerNames || {},
    includeTrajectory: input.includeTrajectory !== false,
  });
}
