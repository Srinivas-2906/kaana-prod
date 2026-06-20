import { INDUSTRIES, INDUSTRY_SHORT, type IndustryId } from '../data/industries';
import { IndustryIcon } from './IndustryIcon';
import './industry-filmstrip.css';

function label(id: IndustryId, name: string) {
  return INDUSTRY_SHORT[id] ?? name;
}

interface Props {
  activeId: IndustryId;
  onSelect: (id: IndustryId) => void;
  autoMode?: boolean;
}

/** Thin horizontal industry rail — never blocks the demo */
export function IndustryFilmstrip({ activeId, onSelect, autoMode }: Props) {
  return (
    <div className="industry-filmstrip-wrap">
      <div className="industry-filmstrip-head">
        <span className="industry-filmstrip-label">
          {autoMode ? 'Showing examples for each industry — click one to preview' : 'Showing template for'}
        </span>
        <span className="industry-filmstrip-count">Not an exhaustive list</span>
      </div>
      <div className="industry-filmstrip" role="tablist" aria-label="Industry">
        {INDUSTRIES.map((ind) => {
          const active = activeId === ind.id;
          return (
            <button
              key={ind.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`industry-film-chip ${active ? 'active' : ''}`}
              onClick={() => onSelect(ind.id)}
            >
              <IndustryIcon id={ind.id} size={16} />
              <span>{label(ind.id, ind.name)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
