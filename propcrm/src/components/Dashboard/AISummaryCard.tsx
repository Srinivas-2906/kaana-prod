import type { Lead } from '../../types';

interface AISummaryCardProps {
  leads: Lead[];
}

export function AISummaryCard({ leads }: AISummaryCardProps) {
  const followups = leads.filter((l) => l.followup === 'Today').length;
  const likelyClose = leads.filter((l) => l.stage === 'negotiation' && l.score >= 85).length;

  return (
    <div className="ai-summary-card">
      <div className="ai-summary-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.8 5.7 21l2.3-7-6-4.6h7.6z" />
        </svg>
      </div>
      <div>
        <div className="ai-summary-title">Daily AI summary</div>
        <div className="ai-summary-text">
          <strong>{followups} leads</strong> need follow-up today,{' '}
          <strong>{likelyClose || 1} deal{likelyClose === 1 ? '' : 's'}</strong> likely to close this week.
        </div>
      </div>
    </div>
  );
}
