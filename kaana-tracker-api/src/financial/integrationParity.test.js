import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildFinancialSummary, simulateFinancialSummary, computeLegacyFinanceSummary } from './financialEngine.js';
import { addCalendarDays } from './cashFlowAdjustment.js';

/**
 * Integration scenario from spec:
 * Project begins 2026-01-01
 * Expenses: 100k Jan 1, 50k Apr 11, 50k Oct 28
 * Revenue: 80k Jun 15
 * Rate 10%, Day 365 target
 */
describe('integration parity', () => {
  const projectStartDate = '2026-01-01';
  const targetDate = addCalendarDays(projectStartDate, 365);
  const rate = 0.10;

  const cashFlows = [
    { amount: 100000, date: '2026-01-01', ledger_type: 'expense', type: 'expense' },
    { amount: 50000, date: '2026-04-11', ledger_type: 'expense', type: 'expense' },
    { amount: 50000, date: '2026-10-28', ledger_type: 'expense', type: 'expense' },
    { amount: 80000, date: '2026-06-15', ledger_type: 'income', type: 'income' },
  ];

  const transactions = cashFlows.map((cf, i) => ({
    ...cf,
    transaction_date: cf.date,
    status: 'active',
    funding_source: 'company_account',
    id: i + 1,
  }));

  it('project financial service matches calculator simulate', () => {
    const projectResult = buildFinancialSummary({
      transactions,
      projectStartDate,
      targetDate,
      capitalAdjustmentRate: rate,
      economicBreakEvenEnabled: true,
    });

    const calcResult = simulateFinancialSummary({
      cashFlows,
      projectStartDate,
      targetDate,
      annualCapitalAdjustmentRate: rate,
    });

    assert.equal(projectResult.actual.expenses, calcResult.actual.expenses);
    assert.equal(projectResult.actual.income, calcResult.actual.income);
    assert.equal(
      projectResult.economicBreakEven.nominalExpensesUntilTarget,
      calcResult.economicBreakEven.nominalExpensesUntilTarget,
    );
    assert.equal(
      projectResult.economicBreakEven.nominalIncomeUntilTarget,
      calcResult.economicBreakEven.nominalIncomeUntilTarget,
    );
    assert.equal(
      projectResult.economicBreakEven.adjustedExpenses,
      calcResult.economicBreakEven.adjustedExpenses,
    );
    assert.equal(
      projectResult.economicBreakEven.adjustedIncome,
      calcResult.economicBreakEven.adjustedIncome,
    );
    assert.equal(
      projectResult.accountingBreakEven.remaining,
      calcResult.accountingBreakEven.remaining,
    );
    assert.equal(
      projectResult.economicBreakEven.remaining,
      calcResult.economicBreakEven.remaining,
    );
  });

  it('legacy finance summary shape is derivable from engine', () => {
    const legacy = computeLegacyFinanceSummary(transactions);
    assert.equal(legacy.total_expense, 200000);
    assert.equal(legacy.total_income, 80000);
    assert.equal(legacy.net, -120000);
  });
});
