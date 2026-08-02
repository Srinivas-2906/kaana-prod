import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../../types';

interface ChatContentProps {
  messages: ChatMessage[];
  isTyping: boolean;
  variant: 'whatsapp' | 'web' | 'sms';
  highlightedReply?: string | null;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

function TypingIndicator({ variant }: { variant: 'whatsapp' | 'web' | 'sms' }) {
  return (
    <div className={`typing-row typing-${variant} msg-enter`}>
      <div className="typing-bubble">
        <span /><span /><span />
      </div>
    </div>
  );
}

function PropertyCards({
  cards,
  variant,
}: {
  cards: ChatMessage['propertyCards'];
  variant: string;
}) {
  if (!cards) return null;
  return (
    <div className={`prop-cards prop-${variant} msg-enter`}>
      {cards.map((c, i) => (
        <div key={c.id} className="prop-card" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="prop-image" style={{ background: c.image ?? 'linear-gradient(135deg, #7C3AED, #1E0A3C)' }}>
            <span className="prop-badge">{c.status}</span>
          </div>
          <div className="prop-body">
            <div className="prop-title">{c.title}</div>
            {c.location && <div className="prop-location">{c.location}</div>}
            <div className="prop-meta">
              <span className="prop-price">{c.price}</span>
              <span>{c.sqft}</span>
            </div>
            <div className="prop-actions">
              <button type="button"><i className="ti ti-eye" /> Details</button>
              <button type="button" className="primary"><i className="ti ti-calendar" /> Book visit</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatContent({
  messages,
  isTyping,
  variant,
  highlightedReply,
  scrollRef,
}: ChatContentProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className={`chat-content chat-${variant}`} ref={scrollRef}>
      {messages.map((msg, idx) => (
        <div key={msg.id} className="msg-enter" style={{ animationDelay: `${Math.min(idx * 30, 120)}ms` }}>
          {msg.text && (
            <div className={`bubble-row ${msg.role === 'user' ? 'sent' : 'received'}`}>
              <div className="bubble">
                {msg.text.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < msg.text!.split('\n').length - 1 && <br />}
                  </span>
                ))}
                <span className="bubble-meta">
                  <span className="bubble-time">{msg.timestamp}</span>
                  {variant === 'whatsapp' && msg.role === 'bot' && msg.delivered && (
                    <span className="read-ticks"><i className="ti ti-checks" /></span>
                  )}
                </span>
              </div>
            </div>
          )}
          {msg.quickReplies && (
            <div className="quick-replies">
              {msg.quickReplies.map((q) => (
                <button
                  key={q}
                  type="button"
                  className={`qr-btn ${highlightedReply === q ? 'qr-highlight' : ''}`}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          {msg.propertyCards && <PropertyCards cards={msg.propertyCards} variant={variant} />}
          {msg.actionButtons && (
            <div className="action-btns">
              {msg.actionButtons.map((b) => (
                <button key={b} type="button" className="action-btn">{b}</button>
              ))}
            </div>
          )}
        </div>
      ))}
      {isTyping && <TypingIndicator variant={variant} />}
      <div ref={endRef} />
    </div>
  );
}
