import { Link } from 'react-router-dom';
import {
  INDUSTRIES,
  INDUSTRY_SHORT,
  type IndustryConfig,
  type IndustryId,
} from '../data/industries';
import { useIndustry } from '../context/IndustryContext';
import './hero-industry-strip.css';

const QUICK_PICKS: IndustryId[] = ['real-estate', 'clinic', 'salon', 'coaching', 'restaurant'];

function label(id: IndustryId, name: string) {
  return INDUSTRY_SHORT[id] ?? name;
}

export function HeroIndustryStrip() {
  const { industryId, setIndustryId } = useIndustry();
  const picks = QUICK_PICKS
    .map((id) => INDUSTRIES.find((ind) => ind.id === id))
    .filter((ind): ind is IndustryConfig => ind != null);

  return (
    <div className="hero-industry-strip" aria-label="Switch demo example">
      <p className="hero-industry-strip-label">
        See your business — demo updates instantly
      </p>
      <div className="hero-industry-strip-scroll-fade">
        <div className="hero-industry-strip-chips" role="listbox" aria-label="Example business">
        {picks.map((ind) => (
          <button
            key={ind.id}
            type="button"
            role="option"
            aria-selected={industryId === ind.id}
            className={`hero-industry-strip-chip${industryId === ind.id ? ' active' : ''}`}
            onClick={() => setIndustryId(ind.id)}
          >
            {label(ind.id, ind.name)}
          </button>
        ))}
        <Link to="/signup?industry=other" className="hero-industry-strip-chip hero-industry-strip-more">
          + Yours
        </Link>
        </div>
      </div>
    </div>
  );
}
