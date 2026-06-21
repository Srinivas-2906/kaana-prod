import { Link } from 'react-router-dom';
import { PlatformCapabilities } from '../components/PlatformCapabilities';
import { AutomationAICard } from '../components/AutomationAICard';
import { RoadmapSection } from '../components/RoadmapSection';
import { PLATFORM_CAPABILITIES, PLATFORM_ROADMAP } from '../data/industries';
import { CTA } from '../lib/onboarding';
import './platform-page.css';

const liveCount = PLATFORM_CAPABILITIES.filter((c) => c.status === 'live').length;
const soonCount = PLATFORM_CAPABILITIES.filter((c) => c.status === 'soon').length;
const nextCount = PLATFORM_ROADMAP.length;

export function PlatformPage() {
  return (
    <main className="page-main platform-page" id="main-content">
      <div className="container platform-page-head">
        <p className="ultimate-kicker">Platform</p>
        <h1 className="ultimate-title">
          <span className="title-line">Everything we</span>
          <span className="title-line ultimate-accent">ship &amp; build</span>
        </h1>
        <p className="ultimate-desc">
          {liveCount} capabilities live today, {soonCount} coming soon, and {nextCount} channel add-ons in early access — shared inbox, lead tracking, and billing included.
        </p>
        <div className="platform-page-stats">
          <div className="platform-page-stat">
            <strong>{liveCount}</strong>
            <span>Live now</span>
          </div>
          <div className="platform-page-stat">
            <strong>{soonCount}</strong>
            <span>Coming soon</span>
          </div>
          <div className="platform-page-stat">
            <strong>{nextCount}</strong>
            <span>Early access channels</span>
          </div>
          <div className="platform-page-stat">
            <strong>4</strong>
            <span>Core apps</span>
          </div>
        </div>
      </div>

      <PlatformCapabilities layout="grid" showMoreIndustries prepend={<AutomationAICard />} />

      <RoadmapSection variant="platform" />

      <section className="platform-page-cta">
        <div className="container platform-page-cta-inner">
          <h2>See it for your business</h2>
          <p>Start setup — we configure automatic replies, shared inbox, and lead tracking for your business.</p>
          <div className="platform-page-actions">
            <Link to="/industries" className="btn btn-ghost">Browse industries</Link>
            <Link to="/signup" className="btn btn-accent">{CTA.primary}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
