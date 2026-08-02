import { useState } from 'react';
import { useConversationSimulator } from '../../hooks/useConversationSimulator';
import type { ChannelId, SpeedId } from '../../types';
import { WhatsAppSkin, WebChatSkin, SMSSkin } from './PreviewSkins';

const channels: { id: ChannelId; label: string; icon: string; color: string }[] = [
  { id: 'whatsapp', label: 'WA', icon: 'ti-brand-whatsapp', color: '#25D366' },
  { id: 'web', label: 'Web', icon: 'ti-message-circle', color: '#2563EB' },
  { id: 'sms', label: 'SMS', icon: 'ti-message', color: '#0EA5E9' },
];

const speeds: SpeedId[] = ['1x', '2x', 'fast'];

export function LivePreview() {
  const [expanded, setExpanded] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [channel, setChannel] = useState<ChannelId>('whatsapp');
  const [speed, setSpeed] = useState<SpeedId>('1x');
  const [fade, setFade] = useState(false);
  const {
    messages, isTyping, highlightedReply, isComplete, isPaused,
    progress, stepLabel, replay, togglePause,
  } = useConversationSimulator(channel, speed);

  const switchChannel = (id: ChannelId) => {
    if (id === channel) return;
    setFade(true);
    setTimeout(() => { setChannel(id); setFade(false); }, 200);
  };

  if (minimized) {
    return (
      <button type="button" className="preview-minimized" onClick={() => setMinimized(false)}>
        <span className="preview-min-pulse" />
        <i className="ti ti-device-mobile" />
        <span>Live preview · {progress}%</span>
        <i className="ti ti-maximize" />
      </button>
    );
  }

  return (
    <div className={`preview-float ${expanded ? 'expanded' : 'compact'}`}>
      <div className="preview-float-head">
        <div className="preview-float-title">
          <span className="live-tag">Live simulation</span>
          <strong>Channel preview</strong>
        </div>
        <div className="preview-float-actions">
          <button type="button" className="pf-btn" onClick={() => setExpanded((e) => !e)} title={expanded ? 'Compact' : 'Expand'}>
            <i className={`ti ti-${expanded ? 'arrows-minimize' : 'arrows-maximize'}`} />
          </button>
          <button type="button" className="pf-btn" onClick={() => setMinimized(true)} title="Minimize">
            <i className="ti ti-minus" />
          </button>
        </div>
      </div>

      <div className="preview-progress-wrap">
        <div className="preview-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="preview-step-label">{stepLabel}</div>

      <div className="preview-ch-tabs">
        {channels.map((ch) => (
          <button
            key={ch.id}
            type="button"
            className={`pch-tab ${channel === ch.id ? 'active' : ''}`}
            style={{ '--ch': ch.color } as React.CSSProperties}
            onClick={() => switchChannel(ch.id)}
          >
            <i className={`ti ${ch.icon}`} />
            {expanded && ch.label}
          </button>
        ))}
      </div>

      <div className={`preview-float-body ${fade ? 'fading' : ''}`}>
        {channel === 'whatsapp' && <WhatsAppSkin messages={messages} isTyping={isTyping} highlightedReply={highlightedReply} />}
        {channel === 'web' && <WebChatSkin messages={messages} isTyping={isTyping} highlightedReply={highlightedReply} />}
        {channel === 'sms' && <SMSSkin messages={messages} isTyping={isTyping} highlightedReply={highlightedReply} />}
      </div>

      {isComplete && expanded && (
        <div className="preview-done"><i className="ti ti-circle-check" /> Booking confirmed</div>
      )}

      <div className="preview-float-foot">
        <button type="button" className="pf-btn" onClick={togglePause}>
          <i className={`ti ti-${isPaused ? 'player-play' : 'player-pause'}`} />
        </button>
        <button type="button" className="pf-replay" onClick={replay}>
          <i className="ti ti-refresh" /> Replay
        </button>
        <div className="pf-speed">
          {speeds.map((s) => (
            <button key={s} type="button" className={speed === s ? 'active' : ''} onClick={() => setSpeed(s)}>
              {s === 'fast' ? '⚡' : s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
