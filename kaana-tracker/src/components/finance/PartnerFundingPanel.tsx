import type { PartnerFunding } from '../../types';
import { formatINR } from '../../lib/financeFormat';

type Props = {
  partners: PartnerFunding[];
  totalCapitalContributions: number;
};

export function PartnerFundingPanel({ partners, totalCapitalContributions }: Props) {
  if (!partners.length) {
    return (
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginTop: 0 }}>Founder / partner contributions</h3>
        <p className="muted">No partner funding recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <h3 style={{ marginTop: 0 }}>Founder / partner contributions</h3>
      <p className="muted">Total capital contributions: {formatINR(totalCapitalContributions)}</p>
      <div className="finance-partner-grid">
        {partners.map((p) => (
          <div key={p.partnerUserId ?? p.partnerName} className="finance-partner-card">
            <strong>{p.partnerName}</strong>
            <div className="muted">Personal expenses: {formatINR(p.personalExpensesPaid)}</div>
            <div className="muted">Capital contributed: {formatINR(p.capitalContributed)}</div>
            <div className="muted">Reimbursements: {formatINR(p.reimbursementsReceived)}</div>
            <div><strong>Net exposure: {formatINR(p.netCapitalExposure)}</strong></div>
          </div>
        ))}
      </div>
    </div>
  );
}
