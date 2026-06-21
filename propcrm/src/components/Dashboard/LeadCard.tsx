import { useDraggable } from '@dnd-kit/core';
import type { Lead } from '../../types';
import { scoreBorderColor, scoreColor } from '../../utils/format';
import { whatsappHref } from '../../lib/whatsapp';

interface LeadCardProps {
  lead: Lead;
  selected: boolean;
  onSelect: (id: number) => void;
}

export function LeadCard({ lead, selected, onSelect }: LeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `lead-${lead.id}`,
    data: { leadId: lead.id, stage: lead.stage },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        borderLeftColor: scoreBorderColor(lead.score),
      }}
      className={`lead-card ${selected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={() => onSelect(lead.id)}
      {...listeners}
      {...attributes}
    >
      <div className="lead-card-top">
        <div>
          <div className="lead-name">{lead.name}</div>
          <div className="lead-prop">{lead.prop}</div>
        </div>
        <div className="score-tooltip-wrap">
          <span className="lead-score" style={{ color: scoreColor(lead.score) }}>
            {lead.score}
          </span>
          <div className="score-tooltip">
            <div className="score-tooltip-title">AI score breakdown</div>
            <div>Engagement: {lead.scoreBreakdown.engagement}/10</div>
            <div>Budget fit: {lead.scoreBreakdown.budgetFit}/10</div>
            <div>Timeline: {lead.scoreBreakdown.timeline}/10</div>
          </div>
        </div>
      </div>
      <div className="lead-meta">
        <span className="budget-val">{lead.budget}</span>
        <span className="days-tag">{lead.daysInStage} day{lead.daysInStage === 1 ? '' : 's'} here</span>
      </div>
      <div className="ai-action-line">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.8 5.7 21l2.3-7-6-4.6h7.6z" />
        </svg>
        {lead.aiNextAction}
      </div>
      {lead.phone && (
        <a
          className="lead-wa-link"
          href={whatsappHref(lead.phone, `Hi ${lead.name},`)}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          WhatsApp
        </a>
      )}
    </div>
  );
}
