import type { CSSProperties } from 'react';
import type { IndustryConfig } from '../../data/industries';
import { getIndustryImages } from '../../lib/images';
import { MessageCircle } from '../KaanaIcons';
import { DemoLoopShell } from './DemoLoopShell';
import './demos.css';

interface Props {
  industry: IndustryConfig;
}

function imgStyle(url: string): CSSProperties {
  return {
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
}

function delaySec(value: string) {
  return parseFloat(value) || 0;
}

export function DemoWhatsAppBot({ industry }: Props) {
  const { botName, botAvatar, botMessages, botCard, botQuick } = industry;
  const images = getIndustryImages(industry.id);
  const cardDelay = botCard ? delaySec(botCard.delay) : 3.6;
  const typingDelay = `${cardDelay + 0.8}s`;
  const quickDelay = `${cardDelay + 1.4}s`;
  const maxDelaySec = cardDelay + 1.4;

  return (
    <div className="demo-frame demo-wa">
      <div className="demo-chrome">
        <span /><span /><span />
        <em>
          <MessageCircle size={12} aria-hidden="true" />
          WhatsApp · {botName}
        </em>
      </div>
      <DemoLoopShell industryId={industry.id} maxDelaySec={maxDelaySec}>
        <div className="demo-wa-screen">
          <div className="demo-wa-top">
            <span className="demo-wa-back">‹</span>
            <span className="demo-wa-av">{botAvatar.slice(0, 1)}</span>
            <div><strong>{botName}</strong><small>online</small></div>
          </div>
          <div className="demo-wa-body">
            {botMessages.map((m, i) => (
              <div
                key={i}
                className={`demo-msg demo-animate ${m.out ? 'demo-msg-out' : ''}`}
                style={{ '--d': m.delay } as CSSProperties}
              >
                {m.text}
              </div>
            ))}
            {botCard && (
              <div className="demo-property demo-animate" style={{ '--d': botCard.delay } as CSSProperties}>
                <div className="demo-property-img" style={imgStyle(images.card)} />
                <div>
                  <strong>{botCard.title}</strong>
                  <span>{botCard.subtitle}</span>
                </div>
              </div>
            )}
            <div className="demo-typing demo-animate" style={{ '--d': typingDelay } as CSSProperties}>
              <span /><span /><span />
            </div>
            <div className="demo-quick demo-animate" style={{ '--d': quickDelay } as CSSProperties}>
              {botQuick.map((q) => (
                <span key={q}>{q}</span>
              ))}
            </div>
          </div>
        </div>
      </DemoLoopShell>
    </div>
  );
}

export function DemoBotIQ({ industry }: Props) {
  const { inboxThreads, inboxChat } = industry;
  const maxDelaySec = Math.max(
    ...inboxChat.map((m) => delaySec(m.delay)),
    4,
  );

  return (
    <div className="demo-frame demo-botiq">
      <div className="demo-chrome">
        <span /><span /><span />
        <em>Kaana Inbox</em>
      </div>
      <DemoLoopShell industryId={`${industry.id}-inbox`} maxDelaySec={maxDelaySec}>
        <div className="demo-botiq-layout">
          <aside className="demo-botiq-sidebar">
            <div className="demo-nav-item active">Inbox</div>
            <div className="demo-nav-item">Team</div>
            <div className="demo-nav-item">Reports</div>
            <div className="demo-live-badge demo-animate" style={{ '--d': '0.5s' } as CSSProperties}>● Live</div>
          </aside>
          <div className="demo-botiq-list">
            {inboxThreads.map((t, i) => (
              <div
                key={t.name}
                className={`demo-thread demo-animate ${t.active ? 'demo-thread-active' : ''}`}
                style={{ '--d': `${0.3 + i * 0.3}s` } as CSSProperties}
              >
                <span className="demo-thread-av">{t.initial}</span>
                <div><strong>{t.name}</strong><span>{t.preview}</span></div>
                {t.unread ? <em className="demo-unread">{t.unread}</em> : null}
              </div>
            ))}
          </div>
          <div className="demo-botiq-chat">
            {inboxChat.map((m, i) => (
              <div
                key={i}
                className={`demo-chat-msg demo-animate ${m.type}`}
                style={{ '--d': m.delay } as CSSProperties}
              >
                {m.text}
              </div>
            ))}
            <div className="demo-takeover demo-animate" style={{ '--d': '4s' } as CSSProperties}>
              Agent joined the conversation
            </div>
            <div className="demo-compose">
              <span>Type a reply…</span>
              <button type="button">Send</button>
            </div>
          </div>
        </div>
      </DemoLoopShell>
    </div>
  );
}

export function DemoCRM({ industry }: Props) {
  const { crmColumns } = industry;
  const maxDelaySec = 2.8;

  return (
    <div className="demo-frame demo-crm">
      <div className="demo-chrome">
        <span /><span /><span />
        <em>Kaana CRM</em>
      </div>
      <DemoLoopShell industryId={`${industry.id}-crm`} maxDelaySec={maxDelaySec}>
        <div className="demo-crm-board">
          {crmColumns.map((col, ci) => (
            <div key={col.title} className="demo-crm-col">
              <h4>{col.title}</h4>
              {col.cards.map((c, i) => (
                <div
                  key={c.name}
                  className={`demo-crm-card demo-animate ${ci === 2 && i === 0 ? 'demo-crm-card-move' : ''}`}
                  style={{ '--d': `${0.4 + ci * 0.2 + i * 0.1}s` } as CSSProperties}
                >
                  <strong>{c.name}</strong>
                  <span>{c.tag}</span>
                  {c.score != null && <div className="demo-crm-score">Score {c.score}</div>}
                </div>
              ))}
              {ci === 0 && (
                <div className="demo-crm-new demo-animate" style={{ '--d': '2.5s' } as CSSProperties}>
                  + Synced from WhatsApp
                </div>
              )}
            </div>
          ))}
        </div>
      </DemoLoopShell>
    </div>
  );
}

export function DemoMiniSite({ industry }: Props) {
  const { miniSite } = industry;
  const images = getIndustryImages(industry.id);
  const maxDelaySec = 1 + (miniSite.items.length - 1) * 0.3 + 0.5;

  return (
    <div className="demo-frame demo-listings">
      <div className="demo-chrome">
        <span /><span /><span />
        <em>{industry.businessName.toLowerCase().replace(/\s+/g, '-')}.kaana.page</em>
      </div>
      <DemoLoopShell industryId={industry.id} maxDelaySec={maxDelaySec}>
        <div className="demo-listings-hero">
          <h3>{miniSite.brand}</h3>
          <p>{miniSite.subtitle}</p>
          <div className="demo-filters">
            {miniSite.filters.map((f, i) => (
              <span
                key={f}
                className={`demo-filter demo-animate ${i === 0 ? 'demo-filter-active' : ''}`}
                style={{ '--d': `${0.3 + i * 0.2}s` } as CSSProperties}
              >
                {f}
              </span>
            ))}
            <button type="button" className="demo-filter-btn demo-animate" style={{ '--d': '0.7s' } as CSSProperties}>
              Search
            </button>
          </div>
        </div>
        <div className="demo-listings-grid">
          {miniSite.items.map((p, i) => (
            <article
              key={p.name}
              className="demo-listing-card demo-animate"
              style={{ '--d': `${1 + i * 0.3}s` } as CSSProperties}
            >
              <div className="demo-listing-img" style={imgStyle(images.listings[i] ?? images.hero)} />
              <div className="demo-listing-body">
                <strong>{p.name}</strong>
                <span>{p.meta}</span>
                <div className="demo-listing-foot">
                  <em>{p.price}</em>
                  <button type="button">
                    <MessageCircle size={10} aria-hidden="true" />
                    WhatsApp
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </DemoLoopShell>
    </div>
  );
}

/** Hero phone — compact version with live product image */
export function DemoHeroPhone({ industry }: Props) {
  const { botName, heroMessages, heroCard, heroCta } = industry;
  const images = getIndustryImages(industry.id);
  const maxDelaySec = heroCard ? delaySec(heroCard.delay) + 0.8 : 2.8;

  return (
    <div className="phone-mock">
      <div className="phone-notch" />
      <div className="phone-glow" aria-hidden="true" />
      <DemoLoopShell industryId={industry.id} maxDelaySec={maxDelaySec} className="phone-screen">
        <div className="wa-header">
          <span className="wa-avatar">{industry.botAvatar.slice(0, 1)}</span>
          <div>
            <strong>{botName}</strong>
            <span className="wa-online">
              <span className="wa-online-dot" />
              online
            </span>
          </div>
        </div>
        <div className="wa-chat">
          {heroMessages.map((m, i) => (
            <div
              key={i}
              className={`wa-msg ${m.out ? 'out' : 'in'} demo-animate`}
              style={{ '--d': m.delay } as CSSProperties}
            >
              {m.text}
            </div>
          ))}
          {heroCard && (
            <div className="wa-property demo-animate" style={{ '--d': heroCard.delay } as CSSProperties}>
              <div className="wa-property-img" style={imgStyle(images.hero)} />
              <div>
                <strong>{heroCard.title}</strong>
                <span>{heroCard.subtitle}</span>
                {heroCta && <button type="button" className="wa-book">{heroCta}</button>}
              </div>
            </div>
          )}
        </div>
      </DemoLoopShell>
    </div>
  );
}
