import type { ReactNode } from 'react';
import { PLATFORM_CAPABILITIES, MORE_INDUSTRIES } from '../data/industries';
import { CAPABILITY_ICONS } from './KaanaIcons';
import { MoreIndustryIcon } from './IndustryIcon';
import './platform.css';

type Props = {
  layout?: 'scroll' | 'grid';
  showMoreIndustries?: boolean;
  prepend?: ReactNode;
};

export function PlatformCapabilities({ layout = 'scroll', showMoreIndustries = true, prepend }: Props) {
  const trackClass = layout === 'grid' ? 'platform-grid' : 'platform-scroll-track';

  return (
    <section id="platform" className="platform-section platform-ultimate">
      <div className="container">
        {layout === 'scroll' ? (
          <>
            <p className="ultimate-kicker">Everything included</p>
            <h2 className="ultimate-title">
              <span className="title-line">Built for WhatsApp</span>
              <span className="title-line ultimate-accent">businesses</span>
            </h2>
            <p className="ultimate-desc platform-ultimate-desc">
              WhatsApp setup, shared inbox, lead tracking, team access, and business-specific workflows — with honest Live vs Coming Soon labels.
            </p>
          </>
        ) : null}

        <div className={trackClass}>
          {prepend}
          {PLATFORM_CAPABILITIES.map((cap) => {
            const Icon = CAPABILITY_ICONS[cap.iconKey];
            return (
              <article key={cap.title} className="platform-scroll-card">
                <div className="platform-card-top">
                  <span className="platform-icon-wrap">
                    {Icon && <Icon size={20} strokeWidth={2} aria-hidden="true" />}
                  </span>
                  <span className={`platform-status platform-status-${cap.status}`}>
                    {cap.status === 'live' ? 'Live' : 'Soon'}
                  </span>
                </div>
                <h3>{cap.title}</h3>
                <p>{cap.desc}</p>
              </article>
            );
          })}
        </div>

        {showMoreIndustries ? (
        <div className="platform-more-row">
          <span className="platform-more-label">Plus custom onboarding for any business type</span>
          <div className="platform-more-chips">
            {MORE_INDUSTRIES.map((i) => (
              <span key={i.name} className="platform-more-chip">
                <MoreIndustryIcon name={i.name} size={14} />
                {i.name}
              </span>
            ))}
          </div>
        </div>
        ) : null}
      </div>
    </section>
  );
}
