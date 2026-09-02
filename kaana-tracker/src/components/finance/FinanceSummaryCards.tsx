import { formatINR } from '../../lib/financeFormat';
import type { FinanceSummary } from '../../types';

type Props = {
  summary: FinanceSummary;
  netLabel?: string;
};

export function FinanceSummaryCards({ summary, netLabel = 'Net' }: Props) {
  return (
    <div className="grid-4" style={{ marginBottom: '1rem' }}>
      <div className="card">
        <div className="muted">Income</div>
        <div className="stat-value" style={{ color: '#16a34a' }}>{formatINR(summary.total_income)}</div>
      </div>
      <div className="card">
        <div className="muted">Expense</div>
        <div className="stat-value" style={{ color: '#dc2626' }}>{formatINR(summary.total_expense)}</div>
      </div>
      <div className="card">
        <div className="muted">{netLabel}</div>
        <div className="stat-value">{formatINR(summary.net)}</div>
      </div>
      <div className="card">
        <div className="muted">Balance</div>
        <div className="stat-value">{formatINR(summary.balance)}</div>
      </div>
    </div>
  );
}
