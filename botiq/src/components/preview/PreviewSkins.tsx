import { useRef } from 'react';
import { ChatContent } from './ChatContent';
import type { ChatMessage } from '../../types';

interface SkinProps {
  messages: ChatMessage[];
  isTyping: boolean;
  highlightedReply?: string | null;
}

export function WhatsAppSkin({ messages, isTyping, highlightedReply }: SkinProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div className="phone-frame wa-frame device-glow">
      <div className="phone-notch" />
      <div className="wa-header">
        <i className="ti ti-arrow-left wa-back" />
        <div className="wa-avatar-ring"><span className="wa-avatar">🏠</span></div>
        <div className="wa-contact">
          <strong>PropBot</strong>
          <span className="wa-online"><i className="pulse-dot" /> Typically replies instantly</span>
        </div>
        <div className="wa-header-icons">
          <i className="ti ti-video" />
          <i className="ti ti-phone" />
          <i className="ti ti-dots-vertical" />
        </div>
      </div>
      <div className="wa-body" ref={scrollRef}>
        <div className="wa-date-chip">Today</div>
        <ChatContent
          messages={messages}
          isTyping={isTyping}
          variant="whatsapp"
          highlightedReply={highlightedReply}
        />
      </div>
      <div className="wa-input-bar">
        <i className="ti ti-mood-smile" />
        <div className="wa-input">Type a message</div>
        <i className="ti ti-paperclip" />
        <div className="wa-send"><i className="ti ti-microphone" /></div>
      </div>
    </div>
  );
}

export function WebChatSkin({ messages, isTyping, highlightedReply }: SkinProps) {
  return (
    <div className="web-mockup">
      <div className="fake-site">
        <div className="fake-nav">
          <span className="fake-logo">Prestige Properties</span>
          <span>Projects</span>
          <span>About</span>
          <span className="fake-cta">Enquire</span>
        </div>
        <div className="fake-hero">
          <div className="fake-hero-badge">RERA Approved</div>
          <h3>Find your dream home in Hyderabad</h3>
          <p>Premium 2 & 3 BHK · Ready to move · Zero brokerage</p>
          <div className="fake-search"><i className="ti ti-search" /> Search by location…</div>
        </div>
      </div>
      <div className="web-widget device-glow">
        <div className="web-widget-header">
          <div className="web-avatar-ring"><span className="web-avatar">🏠</span></div>
          <div>
            <strong>PropBot</strong>
            <span className="online-dot">Online · AI assistant</span>
          </div>
          <i className="ti ti-minus" />
        </div>
        <div className="web-widget-body">
          <ChatContent
            messages={messages}
            isTyping={isTyping}
            variant="web"
            highlightedReply={highlightedReply}
          />
        </div>
        <div className="web-widget-input">
          <input readOnly placeholder="Ask about properties…" />
          <button type="button"><i className="ti ti-send" /></button>
        </div>
        <div className="web-widget-footer">Powered by BotIQ · Kaana AI</div>
      </div>
    </div>
  );
}

export function SMSSkin({ messages, isTyping, highlightedReply }: SkinProps) {
  return (
    <div className="phone-frame sms-frame device-glow">
      <div className="sms-status-bar">
        <span>9:41</span>
        <span className="sms-carrier">●●●○ Airtel</span>
        <span><i className="ti ti-battery-4" /></span>
      </div>
      <div className="sms-header">
        <i className="ti ti-chevron-left" />
        <div className="sms-contact">
          <strong>+91 98400 XXXXX</strong>
          <span>PropBot · SMS</span>
        </div>
        <i className="ti ti-info-circle" />
      </div>
      <div className="sms-body">
        <ChatContent
          messages={messages}
          isTyping={isTyping}
          variant="sms"
          highlightedReply={highlightedReply}
        />
      </div>
      <div className="sms-input-bar">
        <i className="ti ti-plus" />
        <div className="sms-input">Text Message</div>
        <i className="ti ti-microphone" />
      </div>
    </div>
  );
}
