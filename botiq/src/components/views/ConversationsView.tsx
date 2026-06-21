import { useEffect, useRef, useState } from 'react';
import { LeadDrawer } from '../LeadDrawer';
import { useLiveConversations } from '../../hooks/useLiveConversations';
import type { ChannelId, ChatMessage, ConvStatus } from '../../types';
import { avatarColor, getInitials, nowTime } from '../../utils/format';
import { authHeaders } from '../../lib/auth';

interface ConversationsViewProps {
  onTakeOver: () => void;
  onViewCRM: () => void;
  onNotify: (msg: string) => void;
}

const filters = ['All', 'WhatsApp', 'Web', 'SMS', 'Unread'] as const;
const API_URL = import.meta.env.VITE_WHATSAPP_API || 'http://localhost:3002/api';

const AI_SUGGESTIONS: Record<ConvStatus, string[]> = {
  bot: ['I can help with that! Let me check availability.', 'Would you like to see similar properties?'],
  agent: ['Hi, this is Priya from Prestige Properties. I\'ll assist you personally.', 'Let me get those payment details for you.'],
  resolved: ['Thank you! Feel free to reach out anytime.', 'Hope the site visit went well!'],
};

function channelClass(ch: ChannelId) {
  if (ch === 'whatsapp') return 'ch-wa';
  if (ch === 'web') return 'ch-web';
  return 'ch-sms';
}

function channelIcon(ch: ChannelId) {
  if (ch === 'whatsapp') return 'ti-brand-whatsapp';
  if (ch === 'web') return 'ti-message-circle';
  return 'ti-message';
}

function statusBadge(status: ConvStatus) {
  if (status === 'bot') return { cls: 'badge-bot', label: 'AI', icon: 'ti-sparkles' };
  if (status === 'agent') return { cls: 'badge-agent', label: 'Agent', icon: 'ti-alert-circle' };
  return { cls: 'badge-resolved', label: 'Done', icon: 'ti-check' };
}

export function ConversationsView({ onTakeOver, onViewCRM, onNotify }: ConversationsViewProps) {
  const { items, setItems, live } = useLiveConversations();
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState('c1');
  const [draft, setDraft] = useState('');
  const [takenOver, setTakenOver] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const filtered = items.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q);
    const matchFilter =
      filter === 'All' ||
      (filter === 'Unread' && !!c.unread) ||
      (filter === 'WhatsApp' && c.channel === 'whatsapp') ||
      (filter === 'Web' && c.channel === 'web') ||
      (filter === 'SMS' && c.channel === 'sms');
    return matchSearch && matchFilter;
  });

  const active = items.find((c) => c.id === activeId) ?? items[0];
  const isLiveWhatsApp = active.id.startsWith('wa-');
  const badge = statusBadge(takenOver.has(active.id) ? 'agent' : active.status);
  const suggestions = AI_SUGGESTIONS[takenOver.has(active.id) ? 'agent' : active.status];
  const needsAttention = items.filter((c) => c.status === 'agent' && !takenOver.has(c.id)).length;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active.messages]);

  const selectConversation = (id: string) => {
    setActiveId(id);
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, unread: undefined } : c)));
  };

  const handleTakeOver = () => {
    setTakenOver((s) => new Set(s).add(active.id));
    setItems((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? {
              ...c,
              status: 'agent' as ConvStatus,
              messages: [
                ...c.messages,
                { id: `sys-${Date.now()}`, role: 'bot' as const, text: '🔄 Transferred to agent Priya N.', timestamp: nowTime() },
              ],
            }
          : c,
      ),
    );
    onTakeOver();
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    if (!active.id.startsWith('wa-')) {
      onNotify('Demo thread only — select your live WhatsApp conversation to send');
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`${API_URL}/conversations/${active.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ text: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onNotify(data.error || 'Failed to send via WhatsApp');
        return;
      }

      const msg: ChatMessage = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        text: trimmed,
        timestamp: nowTime(),
        delivered: true,
      };
      setItems((prev) =>
        prev.map((c) =>
          c.id === active.id
            ? {
                ...c,
                status: 'agent' as ConvStatus,
                messages: [...c.messages, msg],
                preview: trimmed.slice(0, 40),
                time: 'Now',
              }
            : c,
        ),
      );
      setTakenOver((s) => new Set(s).add(active.id));
      setDraft('');
      onNotify('Sent via WhatsApp ✓');
    } catch {
      onNotify('Cannot reach WhatsApp server — is it running on port 3002?');
    } finally {
      setSending(false);
    }
  };

  const handleFollowUp = () => {
    void sendMessage('Hi! Just following up on your property enquiry. Is there anything else I can help with?');
    setDrawerOpen(false);
  };

  return (
    <div className="inbox-shell">
      {/* ── Inbox list ── */}
      <aside className="inbox-list">
        <div className="inbox-list-head">
          <div>
            <h1>Inbox {live && <span className="live-tag" style={{ fontSize: 11, marginLeft: 8 }}>Live</span>}</h1>
            <p>{filtered.length} threads · {needsAttention} need attention</p>
          </div>
          <div className="inbox-pills">
            <span className="pill-stat"><strong>847</strong> today</span>
            <span className="pill-stat green"><strong>78%</strong> auto</span>
          </div>
        </div>

        <div className="inbox-search">
          <i className="ti ti-search" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" />
        </div>

        <div className="inbox-filters">
          {filters.map((f) => (
            <button key={f} type="button" className={`ifilter ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f}
              {f === 'Unread' && items.some((c) => c.unread) && (
                <em>{items.filter((c) => c.unread).length}</em>
              )}
            </button>
          ))}
        </div>

        <div className="inbox-items">
          {filtered.map((c) => {
            const st = statusBadge(takenOver.has(c.id) ? 'agent' : c.status);
            return (
              <button
                key={c.id}
                type="button"
                className={`inbox-item ${activeId === c.id ? 'active' : ''}`}
                onClick={() => selectConversation(c.id)}
              >
                <div className="inbox-item-accent" />
                <div className="inbox-avatar" style={{ background: avatarColor(c.name) }}>
                  {getInitials(c.name)}
                  <i className={`ti ${channelIcon(c.channel)} ch-dot ${channelClass(c.channel)}`} />
                </div>
                <div className="inbox-item-main">
                  <div className="inbox-item-row">
                    <span className="inbox-name">{c.name}</span>
                    <span className="inbox-time">{c.time}</span>
                  </div>
                  <p className="inbox-preview">{c.preview}</p>
                  <span className={`inbox-tag ${st.cls}`}><i className={`ti ${st.icon}`} />{st.label}</span>
                </div>
                {c.unread ? <span className="inbox-unread">{c.unread}</span> : null}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Chat stage ── */}
      <section className="chat-stage">
        <header className="chat-stage-head">
          <div className="chat-stage-user">
            <div className="inbox-avatar lg" style={{ background: avatarColor(active.name) }}>
              {getInitials(active.name)}
            </div>
            <div>
              <h2>{active.name}</h2>
              <span>{active.phone} · <i className={`ti ${channelIcon(active.channel)} ${channelClass(active.channel)}`} /> {active.channel}</span>
            </div>
          </div>
          <div className="chat-stage-actions">
            <span className={`stage-badge ${badge.cls}`}><i className={`ti ${badge.icon}`} /> {badge.label}</span>
            <button type="button" className="btn-secondary" onClick={() => setDrawerOpen(true)}>
              <i className="ti ti-user-search" /> Lead details
            </button>
            {!takenOver.has(active.id) && (
              <button type="button" className="btn-primary sm" onClick={handleTakeOver}>
                Take over
              </button>
            )}
          </div>
        </header>

        <div className="chat-canvas">
          <div className="chat-canvas-inner">
            {active.messages.map((msg) => (
              <div key={msg.id} className={`chat-msg ${msg.role}`}>
                {msg.role !== 'user' && (
                  <div className="chat-msg-av">{msg.role === 'agent' ? 'PN' : '✦'}</div>
                )}
                <div className="chat-bubble">
                  {msg.text?.split('\n').map((line, i, arr) => (
                    <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                  ))}
                  {msg.propertyCards && (
                    <div className="chat-props">
                      {msg.propertyCards.map((p) => (
                        <div key={p.id} className="chat-prop">
                          <div className="chat-prop-img" style={{ background: p.image ?? '#7C3AED' }} />
                          <div>
                            <strong>{p.title}</strong>
                            <span>{p.price} · {p.sqft}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <time>{msg.timestamp}</time>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>

        <footer className="chat-composer">
          <div className="composer-suggestions">
            {suggestions.map((s) => (
              <button key={s} type="button" onClick={() => setDraft(s)}>
                <i className="ti ti-sparkles" /> {s.length > 36 ? `${s.slice(0, 36)}…` : s}
              </button>
            ))}
          </div>
          <div className="composer-bar">
            <button type="button" className="composer-btn"><i className="ti ti-paperclip" /></button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                isLiveWhatsApp
                  ? (takenOver.has(active.id) ? 'Reply as agent — sends to WhatsApp…' : 'Type to reply on WhatsApp…')
                  : 'Demo thread — not connected to WhatsApp'
              }
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void sendMessage(draft); } }}
            />
            <button type="button" className="composer-send" disabled={!draft.trim() || sending || !isLiveWhatsApp} onClick={() => void sendMessage(draft)}>
              <i className="ti ti-send" />
            </button>
          </div>
        </footer>
      </section>

      <LeadDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        active={active}
        takenOver={takenOver.has(active.id)}
        onTakeOver={handleTakeOver}
        onFollowUp={handleFollowUp}
        onViewCRM={onViewCRM}
      />
    </div>
  );
}
