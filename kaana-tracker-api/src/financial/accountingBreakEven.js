import { Decimal, toNumber } from './money.js';
import {
  countsAsActualExpense,
  countsAsActualIncome,
  countsInAccountingBreakEven,
  resolveLedgerType,
} from './ledgerClassification.js';

/**
 * Aggregate daily totals from eligible transactions.
 * Multiple transactions on same day are summed before break-even evaluation.
 */
function buildDailyTotals(transactions) {
  const byDate = new Map();

  for (const tx of transactions) {
    if (!countsInAccountingBreakEven(tx)) continue;
    const date = String(tx.transaction_date).slice(0, 10);
    if (!byDate.has(date)) {
      byDate.set(date, { income: new Decimal(0), expense: new Decimal(0) });
    }
    const day = byDate.get(date);
    const amt = new Decimal(tx.amount);
    if (resolveLedgerType(tx) === 'income') {
      day.income = day.income.plus(amt);
    } else {
      day.expense = day.expense.plus(amt);
    }
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, totals]) => ({ date, ...totals }));
}

export function computeActualTotals(transactions) {
  let expenses = new Decimal(0);
  let income = new Decimal(0);

  for (const tx of transactions) {
    const amt = new Decimal(tx.amount);
    if (countsAsActualExpense(tx)) expenses = expenses.plus(amt);
    if (countsAsActualIncome(tx)) income = income.plus(amt);
  }

  const profitLoss = income.minus(expenses);
  return {
    expenses: toNumber(expenses),
    income: toNumber(income),
    profitLoss: toNumber(profitLoss),
  };
}

export function computeAccountingBreakEven(transactions) {
  const actual = computeActualTotals(transactions);
  const totalIncome = new Decimal(actual.income);
  const totalExpenses = new Decimal(actual.expenses);

  const reached = totalIncome.gte(totalExpenses);
  const remaining = Decimal.max(totalExpenses.minus(totalIncome), 0);

  let breakEvenDate = null;
  if (reached) {
    const daily = buildDailyTotals(transactions);
    let cumIncome = new Decimal(0);
    let cumExpense = new Decimal(0);

    for (const day of daily) {
      cumIncome = cumIncome.plus(day.income);
      cumExpense = cumExpense.plus(day.expense);
      if (cumIncome.gte(cumExpense)) {
        breakEvenDate = day.date;
        break;
      }
    }
  }

  return {
    reached,
    breakEvenDate,
    remaining: toNumber(remaining),
    accountingNet: toNumber(totalIncome.minus(totalExpenses)),
  };
}

/** Legacy balance: all-time income minus expense (accounting types only) */
export function computeLegacyBalance(transactions) {
  let balance = new Decimal(0);
  for (const tx of transactions) {
    if (!countsInAccountingBreakEven(tx)) continue;
    const amt = new Decimal(tx.amount);
    if (resolveLedgerType(tx) === 'income') balance = balance.plus(amt);
    else balance = balance.minus(amt);
  }
  return toNumber(balance);
}

/** Filter transactions for month scope (YYYY-MM) */
export function filterByMonth(transactions, month) {
  if (!month) return transactions;
  return transactions.filter((tx) => String(tx.transaction_date).slice(0, 7) === month);
}

export function computeLegacyFinanceSummary(transactions, month = null) {
  const scoped = filterByMonth(transactions, month);
  const actual = computeActualTotals(scoped);
  const balance = computeLegacyBalance(transactions);

  return {
    total_income: actual.income,
    total_expense: actual.expenses,
    net: actual.profitLoss,
    balance,
  };
}
