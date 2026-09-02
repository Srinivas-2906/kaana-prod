import type { ProjectFinancialSummary } from '../../types';
import { formatINR, formatRateDecimal } from '../../lib/financeFormat';

type Props = {
  summary: ProjectFinancialSummary;
};

function Metric({ label, value, hint, color }: { label: string; value: string; hint?: string; color?: string }) {
  return (
    <div className="card finance-metric">
      <div className="muted finance-metric-label" title={hint}>{label}</div>
      <div className="stat-value finance-metric-value" style={color ? { color } : undefined}>{value}</div>
      {hint && <div className="muted finance-metric-hint">{hint}</div>}
    </div>
  );
}

export function BreakEvenPanel({ summary }: Props) {
  const { accountingBreakEven: abe, economicBreakEven: ebe, day365 } = summary;

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <h3 style={{ marginTop: 0 }}>Break-even</h3>
      <div className="grid-4">
        <Metric
          label="Accounting break-even"
          value={abe.reached ? 'Reached' : formatINR(abe.remaining)}
          hint={abe.reached && abe.breakEvenDate ? `Since ${abe.breakEvenDate}` : 'Revenue still required to cover expenses'}
          color={abe.reached ? '#16a34a' : undefined}
        />
        <Metric
          label="Economic break-even"
          value={ebe.reached ? 'Reached' : formatINR(ebe.remaining)}
          hint={`As of ${ebe.targetDate} at ${formatRateDecimal(ebe.annualAdjustmentRate)} capital adjustment rate`}
        />
        <Metric
          label="Day-365 economic"
          value={formatINR(day365.remaining)}
          hint={`Target ${day365.targetDate}`}
        />
        <Metric
          label="Capital adjustment rate"
          value={formatRateDecimal(summary.annualCapitalAdjustmentRate)}
          hint="Annual rate for time-adjusted break-even"
        />
      </div>
      {summary.revenueTarget != null && (
        <p className="muted" style={{ marginBottom: 0, marginTop: '0.75rem' }}>
          Revenue target (separate): {formatINR(summary.revenueTarget)}
        </p>
      )}
    </div>
  );
}
