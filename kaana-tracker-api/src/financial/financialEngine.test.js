import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { adjustCashFlow, daysBetween, addCalendarDays } from './cashFlowAdjustment.js';
import { toNumber } from './money.js';
import { computeAccountingBreakEven, computeActualTotals } from './accountingBreakEven.js';
import { computeEconomicBreakEven } from './economicBreakEven.js';
import { computePartnerExposure } from './partnerExposure.js';
import { buildFinancialSummary, simulateFinancialSummary } from './financialEngine.js';

const tx = (overrides) => ({
  amount: 100,
  transaction_date: '2026-01-01',
  ledger_type: 'expense',
  type: 'expense',
  status: 'active',
  funding_source: 'company_account',
  partner_user_id: null,
  ...overrides,
});

describe('cashFlowAdjustment', () => {
  it('adjusts expense at Day 365 with 10% rate', () => {
    const adjusted = adjustCashFlow(100000, '2026-01-01', '2027-01-01', 0.10);
    assert.ok(Math.abs(toNumber(adjusted) - 110000) < 1, `Expected ~110000, got ${toNumber(adjusted)}`);
  });

  it('handles multiple expenses at different dates', () => {
    const t1 = adjustCashFlow(100000, '2026-01-01', '2027-01-01', 0.10);
    const t2 = adjustCashFlow(50000, '2026-04-11', '2027-01-01', 0.10);
    assert.ok(toNumber(t1) > 100000);
    assert.ok(toNumber(t2) > 50000);
    assert.ok(toNumber(t2) < toNumber(t1));
  });

  it('returns nominal at 0% rate', () => {
    const adjusted = adjustCashFlow(50000, '2026-01-01', '2027-01-01', 0);
    assert.equal(toNumber(adjusted), 50000);
  });

  it('zero adjustment on same day', () => {
    const adjusted = adjustCashFlow(75000, '2026-06-15', '2026-06-15', 0.10);
    assert.equal(toNumber(adjusted), 75000);
  });

  it('excludes transaction after target (daysBetween negative)', () => {
    const adjusted = adjustCashFlow(50000, '2027-02-01', '2027-01-01', 0.10);
    assert.equal(toNumber(adjusted), 0);
  });

  it('handles leap year day count', () => {
    const days = daysBetween('2024-02-28', '2024-03-01');
    assert.equal(days, 2);
  });
});

describe('accountingBreakEven', () => {
  it('handles no expenses', () => {
    const result = computeAccountingBreakEven([
      tx({ ledger_type: 'income', type: 'income', amount: 50000, transaction_date: '2026-02-01' }),
    ]);
    assert.equal(result.reached, true);
    assert.equal(result.remaining, 0);
  });

  it('handles no income', () => {
    const result = computeAccountingBreakEven([
      tx({ amount: 80000 }),
    ]);
    assert.equal(result.reached, false);
    assert.equal(result.remaining, 80000);
  });

  it('detects income greater than expenses', () => {
    const result = computeAccountingBreakEven([
      tx({ amount: 50000 }),
      tx({ ledger_type: 'income', type: 'income', amount: 80000, transaction_date: '2026-03-01' }),
    ]);
    assert.equal(result.reached, true);
    assert.equal(result.remaining, 0);
  });

  it('detects exact accounting break-even equality', () => {
    const result = computeAccountingBreakEven([
      tx({ amount: 50000, transaction_date: '2026-01-01' }),
      tx({ ledger_type: 'income', type: 'income', amount: 50000, transaction_date: '2026-02-01' }),
    ]);
    assert.equal(result.reached, true);
    assert.equal(result.breakEvenDate, '2026-02-01');
  });

  it('finds break-even date when crossed during project', () => {
    const result = computeAccountingBreakEven([
      tx({ amount: 30000, transaction_date: '2026-01-01' }),
      tx({ amount: 30000, transaction_date: '2026-02-01' }),
      tx({ ledger_type: 'income', type: 'income', amount: 40000, transaction_date: '2026-02-15' }),
      tx({ ledger_type: 'income', type: 'income', amount: 30000, transaction_date: '2026-03-01' }),
    ]);
    assert.equal(result.reached, true);
    assert.ok(result.breakEvenDate);
  });

  it('excludes capital contribution from revenue', () => {
    const actual = computeActualTotals([
      tx({ amount: 100000, ledger_type: 'capital_contribution' }),
      tx({ ledger_type: 'income', type: 'income', amount: 50000, transaction_date: '2026-02-01' }),
      tx({ amount: 40000 }),
    ]);
    assert.equal(actual.income, 50000);
    assert.equal(actual.expenses, 40000);
  });

  it('excludes reimbursement from doubling expenses', () => {
    const actual = computeActualTotals([
      tx({ id: 1, amount: 20000, partner_user_id: 5, funding_source: 'partner_personal' }),
      tx({ id: 2, amount: 20000, ledger_type: 'reimbursement', type: 'expense', linked_transaction_id: 1 }),
    ]);
    assert.equal(actual.expenses, 20000);
  });

  it('excludes withdrawal from operating expenses', () => {
    const actual = computeActualTotals([
      tx({ amount: 50000 }),
      tx({ amount: 10000, ledger_type: 'withdrawal' }),
    ]);
    assert.equal(actual.expenses, 50000);
  });
});

describe('economicBreakEven', () => {
  it('adjusts both income and expenses', () => {
    const result = computeEconomicBreakEven([
      tx({ amount: 100000, transaction_date: '2026-01-01' }),
      tx({ ledger_type: 'income', type: 'income', amount: 40000, transaction_date: '2026-06-01' }),
    ], '2027-01-01', 0.10);
    assert.ok(result.adjustedExpenses > result.nominalExpensesUntilTarget);
    assert.ok(result.adjustedIncome > result.nominalIncomeUntilTarget);
    assert.ok(result.remaining > 0);
  });

  it('excludes transactions after target date', () => {
    const result = computeEconomicBreakEven([
      tx({ amount: 50000, transaction_date: '2026-01-01' }),
      tx({ amount: 99999, transaction_date: '2027-06-01' }),
    ], '2027-01-01', 0.10);
    assert.equal(result.nominalExpensesUntilTarget, 50000);
  });
});

describe('partnerExposure', () => {
  it('computes net exposure with reimbursements', () => {
    const result = computePartnerExposure([
      tx({ amount: 75000, partner_user_id: 1, funding_source: 'partner_personal' }),
      tx({ amount: 200000, ledger_type: 'capital_contribution', partner_user_id: 1 }),
      tx({ amount: 25000, ledger_type: 'reimbursement', partner_user_id: 1 }),
    ], { 1: 'Partner A' });

    const p = result.partners.find((x) => x.partnerUserId === 1);
    assert.equal(p.personalExpensesPaid, 75000);
    assert.equal(p.capitalContributed, 200000);
    assert.equal(p.reimbursementsReceived, 25000);
    assert.equal(p.netCapitalExposure, 250000);
  });
});

describe('financialEngine parity', () => {
  const cashFlows = [
    { amount: 100000, date: '2026-01-01', ledger_type: 'expense', type: 'expense' },
    { amount: 50000, date: '2026-04-11', ledger_type: 'expense', type: 'expense' },
    { amount: 50000, date: '2026-10-28', ledger_type: 'expense', type: 'expense' },
    { amount: 80000, date: '2026-06-15', ledger_type: 'income', type: 'income' },
  ];

  const input = {
    projectStartDate: '2026-01-01',
    targetDate: '2027-01-01',
    annualCapitalAdjustmentRate: 0.10,
    cashFlows,
  };

  it('project summary and calculator produce identical results', () => {
    const transactions = cashFlows.map((cf, i) => ({
      ...cf,
      transaction_date: cf.date,
      status: 'active',
      funding_source: 'company_account',
      id: i + 1,
    }));

    const projectSummary = buildFinancialSummary({
      transactions,
      projectStartDate: input.projectStartDate,
      targetDate: input.targetDate,
      capitalAdjustmentRate: input.annualCapitalAdjustmentRate,
      economicBreakEvenEnabled: true,
    });

    const calcSummary = simulateFinancialSummary(input);

    assert.equal(projectSummary.actual.expenses, calcSummary.actual.expenses);
    assert.equal(projectSummary.actual.income, calcSummary.actual.income);
    assert.equal(
      projectSummary.economicBreakEven.adjustedExpenses,
      calcSummary.economicBreakEven.adjustedExpenses,
    );
    assert.equal(
      projectSummary.economicBreakEven.adjustedIncome,
      calcSummary.economicBreakEven.adjustedIncome,
    );
    assert.equal(
      projectSummary.accountingBreakEven.remaining,
      calcSummary.accountingBreakEven.remaining,
    );
    assert.equal(
      projectSummary.economicBreakEven.remaining,
      calcSummary.economicBreakEven.remaining,
    );
  });

  it('Day 365 resolves to projectStartDate + 365 days', () => {
    const target = addCalendarDays('2026-01-01', 365);
    assert.equal(target, '2027-01-01');
    const summary = simulateFinancialSummary({ ...input, targetDate: target });
    assert.equal(summary.day365.targetDate, target);
  });
});

import { toDecimal } from './money.js';

describe('money precision', () => {
  it('rejects negative amounts', () => {
    assert.throws(() => toDecimal(-100), /positive/);
  });

  it('rejects zero amounts', () => {
    assert.throws(() => toDecimal(0), /positive/);
  });
});
