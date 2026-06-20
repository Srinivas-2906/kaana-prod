import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CATEGORY_HUBS,
  INDUSTRY_SHORT,
  getIndustriesByCategory,
  type IndustryCategory,
  type IndustryId,
} from '../data/industries';
import { useIndustry } from '../context/IndustryContext';
import { SetupWalkthroughCard } from './SetupWalkthroughCard';
import './home-industry.css';

function label(id: IndustryId, name: string) {
  return INDUSTRY_SHORT[id] ?? name;
}

export function HomeIndustrySection() {
  const { industryId, setIndustryId } = useIndustry();
  const initialCat =
    CATEGORY_HUBS.find((c) => getIndustriesByCategory(c.id).some((i) => i.id === industryId))?.id
    ?? 'property';
  const [category, setCategory] = useState<IndustryCategory>(initialCat);
  const examples = useMemo(() => getIndustriesByCategory(category), [category]);

  function pickCategory(cat: IndustryCategory) {
    setCategory(cat);
    const first = getIndustriesByCategory(cat)[0];
    if (first) setIndustryId(first.id);
  }

  return (
    <section id="industries" className="home-industry">
      <div className="container">
        <div className="home-industry-grid">
          <div className="home-industry-left">
            <p className="ultimate-kicker">Industries</p>
            <h2 className="ultimate-title home-industry-title">
              <span className="title-line">Works for</span>
              <span className="title-line ultimate-accent">your business</span>
            </h2>
            <p className="ultimate-desc home-industry-desc">
              Pick an example — demos update instantly. We configure Kaana for clinics, brokers, salons, and more.
            </p>

            <div className="home-industry-pick">
              <div className="home-industry-scroll-fade">
                <div className="home-industry-tabs" role="tablist" aria-label="Industry category">
                  {CATEGORY_HUBS.map((hub) => (
                    <button
                      key={hub.id}
                      type="button"
                      role="tab"
                      aria-selected={category === hub.id}
                      className={`home-industry-tab ${category === hub.id ? 'active' : ''}`}
                      onClick={() => pickCategory(hub.id)}
                    >
                      {hub.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="home-industry-scroll-fade">
                <div className="home-industry-chips" role="listbox" aria-label="Example business">
                  {examples.map((ind) => (
                    <button
                      key={ind.id}
                      type="button"
                      role="option"
                      aria-selected={industryId === ind.id}
                      className={`home-industry-chip ${industryId === ind.id ? 'active' : ''}`}
                      onClick={() => setIndustryId(ind.id)}
                    >
                      {label(ind.id, ind.name)}
                    </button>
                  ))}
                  <Link to="/signup?industry=other" className="home-industry-chip home-industry-custom">
                    + Your business
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="home-industry-right">
            <SetupWalkthroughCard />
          </div>
        </div>
      </div>
    </section>
  );
}
