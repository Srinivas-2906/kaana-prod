import type { FinancialTrajectoryPoint } from '../../types';
import { formatINR } from '../../lib/financeFormat';

type Props = {
  points: FinancialTrajectoryPoint[];
};

export function FinancialTrajectoryChart({ points }: Props) {
  if (!points.length) {
    return (
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Break-even trajectory</h3>
        <p className="muted">Add transactions to see trajectory.</p>
      </div>
    );
  }

  const width = 640;
  const height = 220;
  const pad = { top: 16, right: 16, bottom: 32, left: 56 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const maxY = Math.max(
    ...points.map((p) => Math.max(p.adjustedExpenses, p.adjustedIncome, p.remainingEconomicBreakEven)),
    1,
  );

  const x = (i: number) => pad.left + (i / Math.max(points.length - 1, 1)) * innerW;
  const y = (v: number) => pad.top + innerH - (v / maxY) * innerH;

  function line(key: keyof Pick<FinancialTrajectoryPoint, 'adjustedExpenses' | 'adjustedIncome' | 'remainingEconomicBreakEven'>, color: string) {
    const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p[key])}`).join(' ');
    return <path d={d} fill="none" stroke={color} strokeWidth={2} />;
  }

  return (
    <div className="card finance-chart-wrap">
      <h3 style={{ marginTop: 0 }}>Break-even trajectory</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="finance-chart" role="img" aria-label="Financial trajectory chart">
        <line x1={pad.left} y1={pad.top + innerH} x2={pad.left + innerW} y2={pad.top + innerH} stroke="#e2e8f0" />
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + innerH} stroke="#e2e8f0" />
        {line('adjustedExpenses', '#dc2626')}
        {line('adjustedIncome', '#16a34a')}
        {line('remainingEconomicBreakEven', '#6366f1')}
        {points.filter((_, i) => i === 0 || i === points.length - 1 || i % 2 === 0).map((p) => (
          <text key={p.date} x={x(points.indexOf(p))} y={height - 8} textAnchor="middle" fontSize={10} fill="#64748b">
            {p.date.slice(5)}
          </text>
        ))}
      </svg>
      <div className="finance-chart-legend">
        <span><i style={{ background: '#dc2626' }} /> Adjusted expenses</span>
        <span><i style={{ background: '#16a34a' }} /> Adjusted income</span>
        <span><i style={{ background: '#6366f1' }} /> Remaining economic BE</span>
      </div>
      <p className="muted finance-chart-foot">Peak remaining: {formatINR(Math.max(...points.map((p) => p.remainingEconomicBreakEven)))}</p>
    </div>
  );
}
