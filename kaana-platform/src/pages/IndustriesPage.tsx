import { Link } from 'react-router-dom';
import { INDUSTRIES, MORE_INDUSTRIES } from '../data/industries';
import { IndustryIcon, MoreIndustryIcon } from '../components/IndustryIcon';
import './industries-page.css';

export function IndustriesPage() {
  return (
    <main className="page-main industries-page" id="main-content">
      <div className="container">
        <header className="industries-header">
          <p className="ultimate-kicker">Templates</p>
          <h1 className="ultimate-title">
            <span className="title-line">Built for</span>
            <span className="title-line ultimate-accent">your industry</span>
          </h1>
          <p className="ultimate-desc">
            Twelve industry templates with example WhatsApp bots, inbox flows, CRM stages, and mini-site catalogs.
            Real estate includes full property search; all other verticals use industry-specific booking and catalog flows.
          </p>
        </header>

        <div className="industries-grid">
          {INDUSTRIES.map((ind) => (
            <article key={ind.id} className="industry-card">
              <div className="industry-card-top">
                <IndustryIcon id={ind.id} size={28} />
                <span className="industry-badge live">Example bot</span>
              </div>
              <h2>{ind.name}</h2>
              <p className="industry-tagline">{ind.tagline}</p>
              <p className="industry-sample">{ind.businessName} · {ind.botName}</p>
              <ul className="industry-bullets">
                <li>{ind.showcase.bot.title}</li>
                <li>{ind.showcase.crm.title}</li>
                <li>{ind.showcase.minisite.title}</li>
              </ul>
              <Link to={`/signup?industry=${ind.id}`} className="btn btn-ghost industry-cta">
                Start with {ind.name} →
              </Link>
            </article>
          ))}
        </div>

        <div className="industries-more">
          <p className="industries-more-label">More verticals we onboard manually</p>
          <div className="industries-more-chips">
            {MORE_INDUSTRIES.map((i) => (
              <span key={i.name} className="industries-more-chip">
                <MoreIndustryIcon name={i.name} size={14} />
                {i.name}
              </span>
            ))}
          </div>
          <Link to="/signup" className="btn btn-accent industries-more-cta">
            Request custom onboarding →
          </Link>
        </div>
      </div>
    </main>
  );
}
