import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CATEGORY_HUBS,
  INDUSTRY_SHORT,
  MORE_INDUSTRIES,
  getIndustriesByCategory,
  type IndustryCategory,
  type IndustryId,
} from '../data/industries';
import { getIndustryImages } from '../lib/images';
import { CategoryIcon, IndustryIcon, MoreIndustryIcon } from './IndustryIcon';
import { DemoHeroPhone } from './demos/ProductDemos';
import { Sparkles } from './KaanaIcons';
import { useIndustry } from '../context/IndustryContext';
import './demo-wall.css';

interface Props {
  onPick?: (id: IndustryId) => void;
}

function shortLabel(id: IndustryId, name: string) {
  return INDUSTRY_SHORT[id] ?? name;
}

/**
 * Open industry explorer — category-first, examples not limits.
 * Shows templates + custom path; never implies "only 12 industries".
 */
export function DemoWall({ onPick }: Props) {
  const { industry, industryId, setIndustryId } = useIndustry();
  const initialCategory =
    CATEGORY_HUBS.find((c) =>
      getIndustriesByCategory(c.id).some((i) => i.id === industryId),
    )?.id ?? 'property';

  const [activeCategory, setActiveCategory] = useState<IndustryCategory>(initialCategory);

  const categoryExamples = useMemo(
    () => getIndustriesByCategory(activeCategory),
    [activeCategory],
  );

  const heroImage = getIndustryImages(industryId).hero;

  function pickExample(id: IndustryId) {
    setIndustryId(id);
    onPick?.(id);
  }

  function pickCategory(cat: IndustryCategory) {
    setActiveCategory(cat);
    const first = getIndustriesByCategory(cat)[0];
    if (first) setIndustryId(first.id);
  }

  return (
    <section className="industry-open" id="demo-wall">
      <div className="container industry-open-head">
        <p className="ultimate-kicker">Works for any business</p>
        <h2 className="ultimate-title">
          <span className="title-line">If you sell or book</span>
          <span className="title-line ultimate-accent">on WhatsApp, Kaana fits.</span>
        </h2>
        <p className="ultimate-desc industry-open-desc">
          We ship ready-made bot, inbox, CRM, and mini-site templates for common verticals —
          and configure <strong>your exact business</strong> in onboarding. The demos below are
          examples, not a limit.
        </p>
      </div>

      <div className="container industry-open-grid">
        {/* Category hubs */}
        <div className="industry-open-categories">
          <p className="industry-open-label">Start with a category</p>
          <div className="industry-category-grid">
            {CATEGORY_HUBS.map((hub) => {
              const active = activeCategory === hub.id;
              const count = getIndustriesByCategory(hub.id).length;
              return (
                <button
                  key={hub.id}
                  type="button"
                  className={`industry-category-card ${active ? 'active' : ''}`}
                  onClick={() => pickCategory(hub.id)}
                >
                  <span className="industry-category-icon">
                    <CategoryIcon id={hub.id} size={22} />
                  </span>
                  <div className="industry-category-text">
                    <strong>{hub.label}</strong>
                    <span>{hub.pitch}</span>
                  </div>
                  <span className="industry-category-meta">
                    {count} example{count === 1 ? '' : 's'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Example chips — explicitly labeled */}
          <div className="industry-examples">
            <p className="industry-open-label">
              Example templates in {CATEGORY_HUBS.find((c) => c.id === activeCategory)?.label}
            </p>
            <div className="industry-example-chips" role="tablist" aria-label="Example industry">
              {categoryExamples.map((ind) => (
                <button
                  key={ind.id}
                  type="button"
                  role="tab"
                  aria-selected={industryId === ind.id}
                  className={`industry-example-chip ${industryId === ind.id ? 'active' : ''}`}
                  onClick={() => pickExample(ind.id)}
                >
                  <IndustryIcon id={ind.id} size={15} />
                  {shortLabel(ind.id, ind.name)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live spotlight — one preview, not a wall of 12 */}
        <div className="industry-spotlight">
          <div className="industry-spotlight-visual">
            <img
              className="industry-spotlight-bg"
              src={heroImage}
              alt=""
              loading="lazy"
            />
            <div className="industry-spotlight-phone">
              <DemoHeroPhone industry={industry} />
            </div>
            <span className="industry-spotlight-badge">Example preview</span>
          </div>
          <div className="industry-spotlight-copy">
            <p className="industry-spotlight-eyebrow">Same setup for every business</p>
            <h3>{industry.name}</h3>
            <p>{industry.tagline}</p>
            <ul className="industry-spotlight-stack">
              <li>WhatsApp bot</li>
              <li>Team inbox</li>
              <li>CRM pipeline</li>
              <li>Mini-site</li>
            </ul>
            <Link to={`/signup?industry=${industryId}`} className="btn btn-accent">
              Start with this template →
            </Link>
          </div>
        </div>
      </div>

      {/* Open-ended — clients we don't list yet */}
      <div className="container industry-open-tail">
        <div className="industry-custom-card">
          <span className="industry-custom-icon">
            <Sparkles size={24} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div className="industry-custom-text">
            <h3>Your industry isn&apos;t listed? That&apos;s normal.</h3>
            <p>
              Travel, insurance, weddings, logistics, NGOs — or something unique to you.
              Sign up as <strong>Custom</strong> and we map bot flows, CRM stages, and your page in onboarding.
            </p>
          </div>
          <Link to="/signup?industry=other" className="btn btn-ghost">
            Start as custom business
          </Link>
        </div>

        <div className="industry-also">
          <p className="industry-open-label">Businesses already like yours</p>
          <div className="industry-also-tags">
            {MORE_INDUSTRIES.filter((i) => i.name !== 'Custom / Other').map((i) => (
              <span key={i.name} className="industry-also-tag">
                <MoreIndustryIcon name={i.name} size={14} />
                {i.name}
              </span>
            ))}
            <span className="industry-also-tag industry-also-tag-more">+ yours</span>
          </div>
        </div>
      </div>
    </section>
  );
}
