import { useMemo, useState } from 'react';
import {
  INDUSTRIES,
  INDUSTRY_CATEGORIES,
  INDUSTRY_CATEGORY,
  INDUSTRY_SHORT,
  type IndustryCategory,
  type IndustryId,
} from '../data/industries';
import { useIndustry } from '../context/IndustryContext';
import { Search } from './KaanaIcons';
import { IndustryIconTile } from './IndustryIcon';
import './bento.css';
import './industry-picker.css';

function shortName(id: IndustryId, name: string) {
  return INDUSTRY_SHORT[id] ?? name;
}

/** Compact hero widget */
export function HeroIndustryStrip() {
  const { industry, industryId, setIndustryId } = useIndustry();
  const idx = INDUSTRIES.findIndex((i) => i.id === industryId);

  function prev() {
    setIndustryId(INDUSTRIES[(idx - 1 + INDUSTRIES.length) % INDUSTRIES.length].id);
  }

  function next() {
    setIndustryId(INDUSTRIES[(idx + 1) % INDUSTRIES.length].id);
  }

  return (
    <div className="hero-industry-widget">
      <p className="hero-industry-widget-label">Live preview</p>
      <div className="hero-industry-widget-inner">
        <button type="button" className="hero-industry-nav" onClick={prev} aria-label="Previous industry">
          ‹
        </button>
        <a href="#industry-explorer" className="hero-industry-current">
          <IndustryIconTile id={industryId} size={22} active />
          <span className="hero-industry-text">
            <strong>{industry.name}</strong>
            <span>{industry.tagline}</span>
          </span>
        </a>
        <button type="button" className="hero-industry-nav" onClick={next} aria-label="Next industry">
          ›
        </button>
      </div>
    </div>
  );
}

/** Bento grid industry picker — sidebar master panel */
export function IndustrySidebar({ onUserSelect }: { onUserSelect?: () => void }) {
  const { industryId, setIndustryId } = useIndustry();
  const [category, setCategory] = useState<IndustryCategory | 'all'>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = category === 'all'
      ? INDUSTRIES
      : INDUSTRIES.filter((i) => INDUSTRY_CATEGORY[i.id] === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.tagline.toLowerCase().includes(q),
      );
    }
    return list;
  }, [category, query]);

  return (
    <aside className="industry-sidebar" id="industry-picker">
      <div className="industry-sidebar-head">
        <h3>Your industry</h3>
        <p>{INDUSTRIES.length} verticals · bento pick</p>
      </div>

      <div className="industry-search industry-search-compact">
        <Search size={15} strokeWidth={2} aria-hidden="true" />
        <input
          type="search"
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search industries"
        />
      </div>

      <div className="industry-segments industry-segments-compact" role="tablist" aria-label="Category">
        {INDUSTRY_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={category === cat.id}
            className={`industry-segment ${category === cat.id ? 'active' : ''}`}
            onClick={() => setCategory(cat.id)}
          >
            {cat.label.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="industry-bento" role="tablist" aria-label="Industry">
        {filtered.length === 0 ? (
          <p className="industry-empty">No match</p>
        ) : (
          filtered.map((ind) => {
            const active = industryId === ind.id;
            return (
              <button
                key={ind.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`industry-bento-tile bento-cell bento-cell-interactive ${active ? 'active' : ''}`}
                onClick={() => {
                  onUserSelect?.();
                  setIndustryId(ind.id);
                }}
              >
                <IndustryIconTile id={ind.id} size={18} active={active} />
                <span className="industry-bento-name">{shortName(ind.id, ind.name)}</span>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
