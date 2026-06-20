import { Link } from 'react-router-dom';
import { ShieldCheck, MessageCircle, Zap } from '../components/KaanaIcons';
import { HeroCommandCenter } from '../components/HeroCommandCenter';
import { HeroIndustryStrip } from '../components/HeroIndustryStrip';
import { SetupProcess } from '../components/SetupProcess';
import { HomeProductDemo } from '../components/HomeProductDemo';
import { HomeIndustrySection } from '../components/HomeIndustrySection';
import { HomePricingSection } from '../components/HomePricingSection';
import { FAQ } from '../components/FAQ';
import { CallbackSection } from '../components/CallbackSection';
import { StickyCTA } from '../components/StickyCTA';
import { useIndustry } from '../context/IndustryContext';
import { CTA } from '../lib/onboarding';
import './home.css';

const TRUST_STATS = [
  { value: 'Official WhatsApp API', label: 'Meta Business Platform' },
  { value: 'You keep your number', label: 'Your business owns it' },
  { value: 'Live in 1–3 days', label: 'Personal setup included' },
];

const TRUST_CHIPS = [
  'You keep your number',
  'Live in 1–3 days',
  'We connect WhatsApp',
];

export function HomePage() {
  const { industry, industryId } = useIndustry();

  return (
    <main className="page-main page-story" id="main-content">
      <section className="story-hero">
        <div className="container story-hero-inner">
          <div className="story-hero-copy">
            <div className="story-hero-trust-row">
              <span className="story-hero-trust-badge">
                <ShieldCheck size={14} aria-hidden="true" />
                Official WhatsApp API
              </span>
            </div>

            <h1>
              Never miss a WhatsApp lead
              <span className="story-hero-accent"> again</span>
            </h1>
            <p className="story-hero-sub">
              Capture leads, automate replies, and hand off to your team — on WhatsApp.
            </p>
            <p className="story-hero-sub story-hero-sub-secondary">
              Built for businesses that sell, support, and book through WhatsApp.
            </p>

            <div className="story-hero-stats story-hero-stats-desktop" aria-label="Platform proof">
              {TRUST_STATS.map(({ value, label }) => (
                <div key={label} className="story-hero-stat">
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <div className="story-hero-actions story-hero-actions-desktop">
              <Link to={`/signup?industry=${industryId}`} className="btn btn-accent btn-lg story-hero-cta-primary">
                {CTA.primary}
              </Link>
              <a href="#how-it-works" className="btn btn-ghost btn-lg story-hero-cta-secondary">
                How setup works
              </a>
            </div>
            <p className="story-hero-fine story-hero-fine-desktop">{CTA.trialNote}</p>

            <div className="story-hero-logos story-hero-logos-desktop" aria-label="Integrations">
              <span><MessageCircle size={14} aria-hidden="true" /> Meta WhatsApp API</span>
              <span className="story-hero-logos-dot">·</span>
              <span><Zap size={14} aria-hidden="true" /> Personal setup included</span>
            </div>
          </div>

          <div className="story-hero-visual">
            <HeroCommandCenter key={industryId} industry={industry} />
          </div>

          <div className="story-hero-mobile-stack">
            <ul className="story-hero-trust-chips" aria-label="Key benefits">
              {TRUST_CHIPS.map((chip) => (
                <li key={chip}>{chip}</li>
              ))}
            </ul>
            <Link to={`/signup?industry=${industryId}`} className="btn btn-accent btn-lg story-hero-cta-primary">
              {CTA.primary}
            </Link>
            <p className="story-hero-fine">{CTA.trialNote}</p>
            <HeroIndustryStrip />
          </div>
        </div>
      </section>

      <SetupProcess />

      <HomeIndustrySection />

      <HomeProductDemo kind="inbox" id="inbox-demo" />

      <HomeProductDemo kind="crm" id="lead-tracking" flip />

      <HomePricingSection />

      <FAQ mobileLimit={5} />

      <CallbackSection />

      <StickyCTA />
    </main>
  );
}
