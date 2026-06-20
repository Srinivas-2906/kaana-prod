import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useIndustry } from '../context/IndustryContext';
import { INDUSTRIES } from '../data/industries';
import { prefersReducedMotion } from '../lib/motion';
import {
  DemoWhatsAppBot,
  DemoBotIQ,
  DemoCRM,
  DemoMiniSite,
} from './demos/ProductDemos';
import { IndustryFilmstrip } from './IndustryFilmstrip';
import { SHOWCASE_ICONS } from './KaanaIcons';
import './showcase.css';

type TabKey = 'bot' | 'inbox' | 'crm' | 'minisite';

const TABS: { key: TabKey; label: string; short: string; iconKey: string; Demo: typeof DemoWhatsAppBot }[] = [
  { key: 'bot', label: 'WhatsApp Bot', short: 'Bot', iconKey: 'bot', Demo: DemoWhatsAppBot },
  { key: 'inbox', label: 'Team Inbox', short: 'Inbox', iconKey: 'inbox', Demo: DemoBotIQ },
  { key: 'crm', label: 'CRM Pipeline', short: 'CRM', iconKey: 'crm', Demo: DemoCRM },
  { key: 'minisite', label: 'Mini-site', short: 'Page', iconKey: 'minisite', Demo: DemoMiniSite },
];

export function ProductShowcase() {
  const { industry, industryId, setIndustryId } = useIndustry();
  const [activeTab, setActiveTab] = useState<TabKey>('bot');
  const [userLocked, setUserLocked] = useState(false);
  const lockedRef = useRef(false);
  const tabIdxRef = useRef(0);
  const cyclesRef = useRef(0);

  useEffect(() => {
    lockedRef.current = userLocked;
  }, [userLocked]);

  // Auto-cycle industries until user picks one
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ms = 3200;
    const id = window.setInterval(() => {
      if (lockedRef.current) return;
      cyclesRef.current += 1;
      // Play through a few changes then stop (less overwhelming, more “real product”).
      if (cyclesRef.current > 10) {
        window.clearInterval(id);
        return;
      }
      const idx = INDUSTRIES.findIndex((i) => i.id === industryId);
      const next = INDUSTRIES[(idx + 1) % INDUSTRIES.length]?.id;
      if (next) setIndustryId(next);
    }, ms);
    return () => window.clearInterval(id);
  }, [industryId, setIndustryId]);

  // Auto-cycle product tabs (GIF-like showcase)
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ms = 4500;
    const id = window.setInterval(() => {
      if (lockedRef.current) return;
      tabIdxRef.current = (tabIdxRef.current + 1) % TABS.length;
      setActiveTab(TABS[tabIdxRef.current].key);
    }, ms);
    return () => window.clearInterval(id);
  }, []);

  const tab = TABS.find((t) => t.key === activeTab)!;
  const block = industry.showcase[activeTab];
  const TabIcon = SHOWCASE_ICONS[tab.iconKey];
  const Demo = tab.Demo;

  function lockAndSelectIndustry(id: typeof industryId) {
    setUserLocked(true);
    setIndustryId(id);
  }

  function lockAndSelectTab(key: TabKey) {
    setUserLocked(true);
    tabIdxRef.current = TABS.findIndex((t) => t.key === key);
    setActiveTab(key);
  }

  return (
    <section id="features" className="showcase showcase-theater">
      <div className="container showcase-theater-head">
        <p className="ultimate-kicker">Product demo</p>
        <h2 className="ultimate-title">
          <span className="title-line">See how it</span>
          <span className="title-line ultimate-accent">works</span>
        </h2>
        <p className="ultimate-desc">
          Automatic replies, shared inbox, lead tracking, and share page — pick a business type to see examples.
        </p>
      </div>

      <div className="showcase-theater-shell" id="industry-explorer">
        {/* Tab rail — top, never blocks demo */}
        <div className="showcase-tab-rail" role="tablist" aria-label="Product">
          {TABS.map(({ key, label, short, iconKey }) => {
            const Icon = SHOWCASE_ICONS[iconKey];
            const active = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                className={`showcase-tab-pill ${active ? 'active' : ''}`}
                onClick={() => lockAndSelectTab(key)}
              >
                {Icon && <Icon size={16} strokeWidth={2} aria-hidden="true" />}
                <span className="showcase-tab-full">{label}</span>
                <span className="showcase-tab-short">{short}</span>
                {active && !userLocked ? <span className="showcase-tab-live" /> : null}
              </button>
            );
          })}
          {!userLocked ? (
            <span className="showcase-auto-badge">Auto-play</span>
          ) : null}
        </div>

        {/* Full-width demo stage */}
        <div className="showcase-theater-stage" key={`${industryId}-${activeTab}`}>
          <div className="showcase-theater-copy">
            <p className="showcase-tag">
              {TabIcon && <TabIcon size={14} strokeWidth={2.5} aria-hidden="true" />}
              {industry.name} · {tab.label}
            </p>
            <h3>{block.title}</h3>
            <p className="showcase-desc">{block.desc}</p>
            <ul className="showcase-bullets">
              {block.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <Link to={`/signup?industry=${industryId}`} className="btn btn-accent">
              Start setup →
            </Link>
          </div>

          <div className="showcase-theater-viewport">
            <div className="showcase-theater-frame">
              <Demo industry={industry} />
            </div>
          </div>
        </div>

        {/* Industry filmstrip — bottom rail */}
        <div className="container showcase-filmstrip-slot">
          <IndustryFilmstrip
            activeId={industryId}
            onSelect={lockAndSelectIndustry}
            autoMode={!userLocked}
          />
        </div>
      </div>
    </section>
  );
}
