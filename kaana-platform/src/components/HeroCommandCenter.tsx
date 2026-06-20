import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, ChevronLeft, Mic, Plus, Smile } from 'lucide-react';
import type { IndustryConfig } from '../data/industries';
import { getHeroJourney, HERO_LOOP_MS, type HeroBeat } from '../lib/heroJourney';
import { prefersReducedMotion } from '../lib/motion';
import { Inbox, Kanban, TrendingUp } from './KaanaIcons';
import './hero-command.css';

interface Props {
  industry: IndustryConfig;
}

function ReadTicks({ read }: { read?: boolean }) {
  return (
    <span className={`wa-dark-ticks${read ? ' wa-dark-ticks-read' : ''}`} aria-hidden="true">
      ✓✓
    </span>
  );
}

export function HeroCommandCenter({ industry }: Props) {
  const journey = useMemo(() => getHeroJourney(industry), [industry]);
  const reduced = prefersReducedMotion();
  const [beat, setBeat] = useState<HeroBeat>(reduced ? 5 : 0);
  const [typing, setTyping] = useState(false);
  const [loopKey, setLoopKey] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);
  const interactiveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;

    const schedule: { t: number; b: HeroBeat; type?: 'typing' }[] = [
      { t: 0, b: 0 },
      { t: 500, b: 1, type: 'typing' },
      { t: 1100, b: 2 },
      { t: 1800, b: 3 },
      { t: 2500, b: 4 },
      { t: 3200, b: 5 },
    ];

    const timers = schedule.map(({ t, b, type }) =>
      window.setTimeout(() => {
        setTyping(type === 'typing');
        if (type !== 'typing') setBeat(b);
      }, t),
    );

    const loop = window.setTimeout(() => {
      setBeat(0);
      setTyping(false);
      setLoopKey((k) => k + 1);
    }, HERO_LOOP_MS);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(loop);
    };
  }, [reduced, loopKey]);

  useEffect(() => {
    const chat = chatRef.current;
    if (!chat) return;

    /* Scroll only inside the phone chat — never the page */
    chat.scrollTop = chat.scrollHeight;

    if (beat >= 2 && beat < 4 && interactiveRef.current) {
      const block = interactiveRef.current;
      const blockBottom = block.offsetTop + block.offsetHeight;
      const visibleBottom = chat.scrollTop + chat.clientHeight;
      if (blockBottom > visibleBottom) {
        chat.scrollTop = blockBottom - chat.clientHeight + 8;
      }
    }
  }, [beat, typing, loopKey]);

  const showEnquiry = beat >= 0 && beat < 4;
  const showBotBlock = beat >= 2 && beat < 4;
  const showPick = beat >= 3;
  const showHandoff = beat >= 4;
  const showAgentReply = beat >= 5;

  const crmQualified = beat >= 3;
  const inboxLive = beat >= 4;

  return (
    <div className="hero-journey" key={loopKey}>
      <div className="hero-journey-head">
        <span className="hero-bento-industry">{industry.name}</span>
        <span className="hero-journey-live" aria-live="polite">
          {beat <= 1 && 'New enquiry'}
          {beat === 2 && 'Bot replying'}
          {beat === 3 && 'Lead qualified'}
          {beat >= 4 && 'Human handoff'}
        </span>
      </div>

      <div className="hero-journey-grid">
        <div className="hero-journey-phone">
          <div className="hero-phone-shell">
            <div className="hero-phone-screen wa-phone-dark">
              <header className="wa-dark-topbar">
                <ChevronLeft size={22} strokeWidth={2} aria-hidden="true" />
                <span className="wa-dark-unread">1</span>
                <span className="wa-dark-topbar-avatar">{journey.botAvatar.slice(0, 1)}</span>
                <div className="wa-dark-topbar-info">
                  <strong>{journey.businessName}</strong>
                  <span>Business account</span>
                </div>
              </header>

              <div className="wa-dark-chat" ref={chatRef}>
                {showEnquiry && (
                  <div className="wa-dark-msg wa-dark-msg-out hero-journey-msg">
                    <p>{journey.enquiry}</p>
                    <span className="wa-dark-meta">
                      9:12 PM <ReadTicks read={beat >= 2} />
                    </span>
                  </div>
                )}

                {typing && (
                  <div className="wa-dark-typing hero-journey-msg" aria-label="Typing">
                    <span /><span /><span />
                  </div>
                )}

                {showBotBlock && (
                  <div className="wa-dark-interactive hero-journey-msg" ref={interactiveRef}>
                    <div className="wa-dark-msg wa-dark-msg-in wa-dark-msg-flat">
                      <p>{journey.botPrompt}</p>
                      <span className="wa-dark-meta">9:13 PM</span>
                    </div>
                    <div className="wa-dark-btn-list">
                      {journey.quickReplies.map((label, idx) => (
                        <span
                          key={label}
                          className={`wa-dark-btn${showPick && idx === 1 ? ' is-active' : ''}`}
                        >
                          <span className="wa-dark-btn-icon" aria-hidden="true">↩</span>
                          <span className="wa-dark-btn-text">{label}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {showPick && (
                  <div className="wa-dark-msg wa-dark-msg-out hero-journey-msg">
                    <div className="wa-dark-quote">
                      <span className="wa-dark-quote-label">{journey.businessName}</span>
                      <span>{journey.botPrompt}</span>
                    </div>
                    <p>{journey.customerPick}</p>
                    <span className="wa-dark-meta">
                      9:13 PM <ReadTicks read={beat >= 4} />
                    </span>
                  </div>
                )}

                {showHandoff && (
                  <div className="wa-dark-msg wa-dark-msg-in hero-journey-msg">
                    <p>{journey.handoffMessage}</p>
                    <span className="wa-dark-meta">9:13 PM</span>
                  </div>
                )}

                {showAgentReply && (
                  <div className="wa-dark-msg wa-dark-msg-in wa-dark-msg-agent hero-journey-msg">
                    <p>{journey.agentReply}</p>
                    <span className="wa-dark-meta">9:14 PM</span>
                  </div>
                )}
              </div>

              <footer className="wa-dark-composer" aria-hidden="true">
                <Plus size={22} strokeWidth={1.75} className="wa-dark-composer-plus" />
                <div className="wa-dark-composer-field">Message</div>
                <Smile size={20} strokeWidth={1.75} className="wa-dark-composer-icon" />
                <Camera size={20} strokeWidth={1.75} className="wa-dark-composer-icon" />
                <span className="wa-dark-composer-mic">
                  <Mic size={18} strokeWidth={2.25} aria-hidden="true" />
                </span>
              </footer>
            </div>
          </div>
        </div>

        <div className="hero-journey-side">
          <article className={`hero-side-card hero-bento-cell hero-side-card-inbox ${inboxLive ? 'is-live' : beat >= 2 ? 'is-warm' : ''}`}>
            <header className="hero-side-card-head">
              <span className="hero-side-card-label">
                <Inbox size={14} aria-hidden="true" />
                Inbox
              </span>
              {inboxLive ? <em className="hero-side-count">1</em> : beat >= 2 ? <em className="hero-inbox-dot">•</em> : null}
            </header>
            <div className="hero-side-card-body hero-side-card-body-inbox">
              <div className="hero-side-identity">
                <span className="hero-cell-av">{journey.customerInitial}</span>
                <strong className="hero-side-name">{journey.customerName}</strong>
              </div>
              <p className="hero-side-preview">
                {inboxLive ? journey.inboxPreviewHandoff : journey.inboxPreviewIdle}
              </p>
              <span className={`hero-side-badge${inboxLive ? ' is-visible' : ''}`} aria-hidden={!inboxLive}>
                Agent assigned
              </span>
            </div>
          </article>

          <article className={`hero-side-card hero-bento-cell hero-side-card-crm ${crmQualified ? 'is-live' : ''}`}>
            <header className="hero-side-card-head">
              <span className="hero-side-card-label">
                <Kanban size={14} aria-hidden="true" />
                {crmQualified ? journey.crmStageQualified : journey.crmStageNew}
              </span>
            </header>
            <div className="hero-side-card-body hero-side-card-body-crm">
              <strong className="hero-side-name">{journey.customerName}</strong>
              <p className="hero-side-preview">{journey.crmTag}</p>
              <span className={`hero-cell-metric${crmQualified ? ' is-visible hero-crm-pop' : ''}`}>
                <TrendingUp size={11} aria-hidden="true" />
                Score {journey.crmScore}
              </span>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
