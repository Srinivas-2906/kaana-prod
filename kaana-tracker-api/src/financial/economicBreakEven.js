import { Decimal, toNumber } from './money.js';
import { adjustCashFlow, daysBetween } from './cashFlowAdjustment.js';
import {
  countsInEconomicBreakEven,
  resolveLedgerType,
} from './ledgerClassification.js';

function filterUntilTarget(transactions, targetDate) {
  return transactions.filter((tx) => {
    if (!countsInEconomicBreakEven(tx)) return false;
    const date = String(tx.transaction_date).slice(0, 10);
    return daysBetween(date, targetDate) >= 0 && date <= targetDate;
  });
}

export function computeEconomicBreakEven(transactions, targetDate, annualRate) {
  const rate = new Decimal(annualRate ?? 0);
  const eligible = filterUntilTarget(transactions, targetDate);

  let nominalExpenses = new Decimal(0);
  let nominalIncome = new Decimal(0);
  let adjustedExpenses = new Decimal(0);
  let adjustedIncome = new Decimal(0);

  for (const tx of eligible) {
    const amt = new Decimal(tx.amount);
    const date = String(tx.transaction_date).slice(0, 10);
    const adjusted = adjustCashFlow(amt, date, targetDate, rate);
    const lt = resolveLedgerType(tx);

    if (lt === 'expense') {
      nominalExpenses = nominalExpenses.plus(amt);
      adjustedExpenses = adjustedExpenses.plus(adjusted);
    } else if (lt === 'income') {
      nominalIncome = nominalIncome.plus(amt);
      adjustedIncome = adjustedIncome.plus(adjusted);
    }
  }

  const economicPosition = adjustedIncome.minus(adjustedExpenses);
  const remaining = Decimal.max(adjustedExpenses.minus(adjustedIncome), 0);
  const reached = adjustedIncome.gte(adjustedExpenses);

  return {
    targetDate,
    annualAdjustmentRate: rate.toNumber(),
    nominalExpensesUntilTarget: toNumber(nominalExpenses),
    nominalIncomeUntilTarget: toNumber(nominalIncome),
    adjustedExpenses: toNumber(adjustedExpenses),
    adjustedIncome: toNumber(adjustedIncome),
    economicNetPosition: toNumber(economicPosition),
    remaining: toNumber(remaining),
    reached,
  };
}
