import { formatCr } from '../../utils/format';
import { useCountUp, useCountUpDecimal } from '../../hooks/useCountUp';

interface StatsCardsProps {
  leadCount: number;
  pipelineValue: number;
  siteVisits: number;
  negotiations: number;
  followupsToday: number;
  hotLeads: number;
}

export function StatsCards({
  leadCount,
  pipelineValue,
  siteVisits,
  negotiations,
  followupsToday,
  hotLeads,
}: StatsCardsProps) {
  const count = useCountUp(leadCount);
  const pipeline = useCountUpDecimal(pipelineValue / 10000000);
  const sites = useCountUp(siteVisits);
  const deals = useCountUp(negotiations);

  return (
    <div className="stat-row">
      <div className="stat-card">
        <div className="stat-icon blue">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          </svg>
        </div>
        <div className="stat-val">{count}</div>
        <div className="stat-lbl">Active leads</div>
        <div className="stat-trend up">{hotLeads} hot this week</div>
      </div>
      <div className="stat-card">
        <div className="stat-icon green">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 7H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div className="stat-val">{formatCr(pipeline * 10000000)}</div>
        <div className="stat-lbl">Pipeline value</div>
        <div className="stat-trend up">Live from pipeline</div>
      </div>
      <div className="stat-card">
        <div className="stat-icon amber">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18M5 21V7l7-4 7 4v14" />
          </svg>
        </div>
        <div className="stat-val">{sites}</div>
        <div className="stat-lbl">Site visits active</div>
        <div className="stat-trend up">{followupsToday} follow-ups today</div>
      </div>
      <div className="stat-card">
        <div className="stat-icon red">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
          </svg>
        </div>
        <div className="stat-val">{deals}</div>
        <div className="stat-lbl">In negotiation</div>
        <div className="stat-trend down">{followupsToday} callbacks due</div>
      </div>
    </div>
  );
}
