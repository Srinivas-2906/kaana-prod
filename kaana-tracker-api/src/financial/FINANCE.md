# Kaana Tracker — Financial Semantics

This document defines the canonical financial model. All calculations must go through
`src/financial/financialEngine.js`. Do not duplicate formulas in routes or React components.

## Rate storage

`capital_adjustment_rate` is stored as a **decimal fraction**: `0.10` = 10%.
Never mix integer percents (10) with decimal fractions (0.10) in calculations.

## Transaction types (ledger_type)

| Type | Purpose |
|------|---------|
| `expense` | Operating project cost |
| `income` | Recognized project revenue |
| `capital_contribution` | Partner deposits cash into project/company — **not revenue** |
| `reimbursement` | Repays a partner for a prior expense — **does not add to expenses** |
| `withdrawal` | Partner takes cash out |
| `distribution` | Profit distribution to partners |

## Accounting break-even

```
accountingNet = totalIncome - totalExpenses
accountingBreakEvenReached = totalIncome >= totalExpenses
remainingAccountingBreakEven = max(totalExpenses - totalIncome, 0)
```

Only `expense` and `income` ledger types participate. Capital, reimbursements, withdrawals, and
distributions are excluded.

Break-even date: sort eligible transactions by date, aggregate per day, find first date where
cumulative income ≥ cumulative expenses.

## Economic / adjusted break-even

Each cash flow is adjusted independently to the target date:

```
adjustedValue = amount × (1 + annualRate) ^ (daysBetween(transactionDate, targetDate) / 365)
```

- `dayCountBasis = 365`
- Transaction on target date → exponent 0
- Transaction after target date → excluded from that target calculation
- Both expenses **and** income are adjusted consistently

```
economicPositionAtTarget = adjustedIncomeAtTarget - adjustedExpensesAtTarget
remainingEconomicBreakEven = max(adjustedExpensesAtTarget - adjustedIncomeAtTarget, 0)
```

Original transaction amounts are never mutated. Adjusted values are derived only.

## Partner net capital exposure

```
netExposure(partner) =
  personalExpensesPaid
  + capitalContributed
  - reimbursementsReceived
  - withdrawalsAndDistributions
```

- `personalExpensesPaid`: `expense` with `funding_source = partner_personal` (or legacy)
- Reimbursements reduce exposure but do **not** increase project expenses

## Revenue target

Optional business goal on the project (`clusters.revenue_target`). Separate from accounting
and economic break-even.

## Day 365

```
targetDate = projectStartDate + 365 calendar days
```

Not a separate formula — uses the same economic break-even engine with that target date.
