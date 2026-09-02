import { addCalendarDays } from './cashFlowAdjustment.js';
import { computeEconomicBreakEven } from './economicBreakEven.js';
import { computeActualTotals } from './accountingBreakEven.js';
import { toNumber } from './money.js';
import { Decimal } from './money.js';

/**
 * Build cumulative trajectory points from project start to target date.
 * Default intervals: Day 0, 30, 60, 90, ... up to target.
 */
export function computeTrajectory(transactions, projectStartDate, targetDate, annualRate, intervalDays = 30) {
  const start = projectStartDate;
  const totalDays = Math.max(0, Math.round(
    (new Date(targetDate + 'T00:00:00Z').getTime() - new Date(start + 'T00:00:00Z').getTime()) / 86400000,
  ));

  const points = [];
  const seen = new Set();

  function addPoint(dayOffset) {
    const date = addCalendarDays(start, dayOffset);
    if (seen.has(date)) return;
    seen.add(date);

    const economic = computeEconomicBreakEven(transactions, date, annualRate);
    const actual = computeActualTotals(
      transactions.filter((tx) => String(tx.transaction_date).slice(0, 10) <= date),
    );

    points.push({
      date,
      dayOffset,
      nominalExpenses: actual.expenses,
      nominalIncome: actual.income,
      adjustedExpenses: economic.adjustedExpenses,
      adjustedIncome: economic.adjustedIncome,
      remainingEconomicBreakEven: economic.remaining,
    });
  }

  addPoint(0);
  for (let d = intervalDays; d < totalDays; d += intervalDays) {
    addPoint(d);
  }
  addPoint(totalDays);

  return points.sort((a, b) => a.dayOffset - b.dayOffset);
}

export function computeDay365Summary(transactions, projectStartDate, annualRate) {
  const targetDate = addCalendarDays(projectStartDate, 365);
  const economic = computeEconomicBreakEven(transactions, targetDate, annualRate);
  return {
    targetDate,
    ...economic,
  };
}
