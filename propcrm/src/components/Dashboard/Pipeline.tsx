import { useDroppable } from '@dnd-kit/core';
import type { Lead, Stage } from '../../types';
import { stageLabel } from '../../reducers/leadsReducer';
import { LeadCard } from './LeadCard';

const stageColors: Record<Stage, string> = {
  new: '#185FA5',
  contacted: '#854F0B',
  site: '#534AB7',
  negotiation: '#3B6D11',
};

const emptyMessages: Record<Stage, string> = {
  new: 'No new enquiries yet',
  contacted: 'No leads contacted yet',
  site: 'No site visits scheduled',
  negotiation: 'No leads in negotiation yet',
};

interface PipelineColumnProps {
  stage: Stage;
  leads: Lead[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAddLead: (stage: Stage) => void;
}

function PipelineColumn({ stage, leads, selectedId, onSelect, onAddLead }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage, data: { stage } });

  return (
    <div className={`pipe-col ${isOver ? 'drag-over' : ''}`}>
      <div className="pipe-head">
        <span className="pipe-label" style={{ color: stageColors[stage] }}>
          <span className="pipe-dot" style={{ background: stageColors[stage] }} />
          {stageLabel(stage)}
        </span>
        <span className="pipe-count">{leads.length}</span>
      </div>
      <div ref={setNodeRef} className="pipe-cards">
        {leads.length === 0 ? (
          <div className="pipe-empty">{emptyMessages[stage]}</div>
        ) : (
          leads.map((l) => (
            <LeadCard key={l.id} lead={l} selected={selectedId === l.id} onSelect={onSelect} />
          ))
        )}
      </div>
      <button type="button" className="col-add-btn" onClick={() => onAddLead(stage)}>
        + Add lead
      </button>
    </div>
  );
}

interface PipelineProps {
  leads: Lead[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAddLead: (stage: Stage) => void;
}

export function Pipeline({ leads, selectedId, onSelect, onAddLead }: PipelineProps) {
  const stages: Stage[] = ['new', 'contacted', 'site', 'negotiation'];

  return (
    <div className="pipeline">
      {stages.map((stage) => (
        <PipelineColumn
          key={stage}
          stage={stage}
          leads={leads.filter((l) => l.stage === stage)}
          selectedId={selectedId}
          onSelect={onSelect}
          onAddLead={onAddLead}
        />
      ))}
    </div>
  );
}
