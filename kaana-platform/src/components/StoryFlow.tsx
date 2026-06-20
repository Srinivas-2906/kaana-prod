import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useIndustry } from '../context/IndustryContext';
import { CTA } from '../lib/onboarding';
import {
  CATEGORY_HUBS,
  INDUSTRIES,
  INDUSTRY_SHORT,
  getIndustriesByCategory,
  type IndustryCategory,
  type IndustryId,
} from '../data/industries';
import {
  DemoWhatsAppBot,
  DemoBotIQ,
  DemoCRM,
  DemoMiniSite,
} from './demos/ProductDemos';
import './story.css';

const STORY = [
  {
    step: '01',
    id: 'step-bot',
    label: 'Bot',
    title: 'Customer messages you on WhatsApp',
    desc: 'Your bot answers in seconds — even at night.',
    bullets: ['FAQ & pricing auto-replies', 'Booking & qualification flows', 'Product cards in chat'],
    Demo: DemoWhatsAppBot,
  },
  {
    step: '02',
    id: 'step-inbox',
    label: 'Inbox',
    title: 'Your team takes over in one inbox',
    desc: 'Stop sharing one phone between staff.',
    bullets: ['Assign chats to agents', 'Full conversation history', 'Take over from automatic replies anytime'],
    Demo: DemoBotIQ,
    flip: true,
  },
  {
    step: '03',
    id: 'step-crm',
    label: 'CRM',
    title: 'Every lead lands in CRM',
    desc: 'Nothing lost in chat history.',
    bullets: ['Lead tracking & follow-ups', 'Synced from WhatsApp', 'Stage from enquiry to closed'],
    Demo: DemoCRM,
  },
  {
    step: '04',
    id: 'step-site',
    label: 'Site',
    title: 'Share a branded mini-site',
    desc: 'One link for your catalog or services.',
    bullets: ['Send in chat or ads', 'Mobile-first page', 'WhatsApp button on every item'],
    Demo: DemoMiniSite,
    flip: true,
  },
] as const;

const ONBOARD = [
  { n: '1', title: 'Tell us your business', desc: 'Template or custom — we configure your flows.' },
  { n: '2', title: 'We connect WhatsApp', desc: 'We handle Meta setup — you keep your number.' },
  { n: '3', title: 'Go live', desc: 'Shared inbox, lead list, and automatic replies — ready to capture leads.' },
];

function label(id: IndustryId, name: string) {
  return INDUSTRY_SHORT[id] ?? name;
}

function DemoLiveBadge() {
  return null;
}

export function StoryFlow() {
  const { industry, industryId, setIndustryId } = useIndustry();
  const initialCat =
    CATEGORY_HUBS.find((c) => getIndustriesByCategory(c.id).some((i) => i.id === industryId))?.id
    ?? 'property';
  const [category, setCategory] = useState<IndustryCategory>(initialCat);
  const [activeStep, setActiveStep] = useState<string>(STORY[0].id);

  const examples = useMemo(() => getIndustriesByCategory(category), [category]);

  useEffect(() => {
    const stepEls = STORY.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!stepEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActiveStep(visible[0].target.id);
      },
      { rootMargin: '-30% 0px -45% 0px', threshold: [0.15, 0.4, 0.65] },
    );

    stepEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function pickCategory(cat: IndustryCategory) {
    setCategory(cat);
    const first = getIndustriesByCategory(cat)[0];
    if (first) setIndustryId(first.id);
  }

  function scrollToStep(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setActiveStep(id);
  }

  return (
    <div className="story">
      <section className="story-intro container">
        <p className="story-label">How it works</p>
        <h2 className="story-headline">From WhatsApp message to closed lead</h2>
        <p className="story-lead">
          Follow four steps — each panel shows a live sample so you see what your customers and team get.
          Pick your industry in Step 05 to swap the examples.
        </p>
        <nav className="story-progress" aria-label="Setup steps">
          {STORY.map(({ step, id, label: stepLabel }, i) => (
            <span key={id} className="story-progress-item">
              {i > 0 ? <span className="story-progress-line" aria-hidden="true" /> : null}
              <button
                type="button"
                className={`story-progress-step ${activeStep === id ? 'active' : ''}`}
                onClick={() => scrollToStep(id)}
                aria-current={activeStep === id ? 'step' : undefined}
              >
                <span className="story-progress-num">{step}</span>
                {stepLabel}
              </button>
            </span>
          ))}
        </nav>
      </section>

      {STORY.map(({ step, id, title, desc, bullets, Demo, ...rest }) => (
        <section
          key={step}
          id={id}
          className={`story-step ${activeStep === id ? 'story-step-active' : ''} ${'flip' in rest && rest.flip ? 'story-step-flip' : ''}`}
        >
          <div className="container story-step-inner">
            <div className="story-step-copy">
              <span className="story-step-num">Step {step}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
              <ul className="story-step-bullets">
                {bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
            <div className="story-step-demo">
              <DemoLiveBadge />
              <p className="story-demo-example">
                Example: <strong>{industry.businessName}</strong> · {industry.name}
              </p>
              <Demo industry={industry} />
              <p className="story-demo-hint">Conversation plays automatically · replays every few seconds</p>
            </div>
          </div>
        </section>
      ))}

      <section className="story-step story-step-fit" id="your-business">
        <div className="container story-step-inner story-step-inner-stack">
          <div className="story-step-copy story-step-copy-center">
            <span className="story-step-num">Step 05</span>
            <h3>Pre-built for common WhatsApp businesses</h3>
            <p>
              Pick an example below — all four demos above update instantly. Don&apos;t see yours?
              Choose <strong>Custom</strong> at signup and we configure everything.
            </p>
          </div>

          <div className="story-industry-pick">
            <div className="story-category-tabs" role="tablist">
              {CATEGORY_HUBS.map((hub) => (
                <button
                  key={hub.id}
                  type="button"
                  role="tab"
                  aria-selected={category === hub.id}
                  className={`story-category-tab ${category === hub.id ? 'active' : ''}`}
                  onClick={() => pickCategory(hub.id)}
                >
                  {hub.label}
                </button>
              ))}
            </div>
            <div className="story-industry-chips" role="listbox" aria-label="Example business">
              {examples.map((ind) => (
                <button
                  key={ind.id}
                  type="button"
                  role="option"
                  aria-selected={industryId === ind.id}
                  className={`story-industry-chip ${industryId === ind.id ? 'active' : ''}`}
                  onClick={() => setIndustryId(ind.id)}
                >
                  {label(ind.id, ind.name)}
                </button>
              ))}
              <Link to="/signup?industry=other" className="story-industry-chip story-industry-custom">
                + Your business
              </Link>
            </div>
            <p className="story-industry-note">
              {INDUSTRIES.length}+ example templates · unlimited custom setups
            </p>
          </div>
        </div>
      </section>

      <section className="story-onboard" id="how">
        <div className="container">
          <span className="story-step-num story-step-num-center">Step 06</span>
          <h2 className="story-headline story-headline-center">Go live in 1–3 business days</h2>
          <div className="story-onboard-grid">
            {ONBOARD.map((s) => (
              <div key={s.n} className="story-onboard-card">
                <span className="story-onboard-n">{s.n}</span>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="story-onboard-cta">
            <Link to={`/signup?industry=${industryId}`} className="btn btn-accent btn-lg">
              {CTA.primary}
            </Link>
            <Link to="/pricing" className="btn btn-ghost btn-lg">View pricing</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
