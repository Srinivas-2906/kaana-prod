import { useState } from 'react';

export function SettingsView() {
  const [copied, setCopied] = useState(false);
  const embed = '<script src="https://cdn.botiq.ai/widget.js" data-bot="propbot" data-color="#1E0A3C"></script>';

  const copyEmbed = () => {
    navigator.clipboard.writeText(embed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="settings-view page-fade">
      <div className="page-header">
        <div>
          <div className="eyebrow">Settings</div>
          <h1>Channel configuration</h1>
          <p>Connect and customize PropBot across channels</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-card">
          <div className="settings-card-head">
            <i className="ti ti-brand-whatsapp ch-wa-icon" />
            <div>
              <h3>WhatsApp Business</h3>
              <span className="badge-connected">Connected ✓</span>
            </div>
          </div>
          <dl className="settings-meta">
            <dt>Phone</dt><dd>+91 98400 00000</dd>
            <dt>Messages sent</dt><dd>4,231</dd>
          </dl>
          <button type="button" className="btn-outline">Manage</button>
        </div>

        <div className="settings-card">
          <div className="settings-card-head">
            <i className="ti ti-message-circle ch-web-icon" />
            <div>
              <h3>Web Chat Widget</h3>
              <span className="badge-connected">Active ✓</span>
            </div>
          </div>
          <label className="field-label">Embed code</label>
          <div className="embed-box">
            <code>{embed}</code>
            <button type="button" className="copy-btn" onClick={copyEmbed}>
              <i className={`ti ti-${copied ? 'check' : 'copy'}`} />
            </button>
          </div>
          <div className="color-row">
            <span>Theme color</span>
            <div className="color-swatch" style={{ background: '#1E0A3C' }} />
            <div className="color-swatch" style={{ background: '#7C3AED' }} />
            <div className="color-swatch" style={{ background: '#25D366' }} />
          </div>
          <button type="button" className="btn-outline">Customize widget</button>
        </div>

        <div className="settings-card disabled">
          <div className="settings-card-head">
            <i className="ti ti-message ch-sms-icon" />
            <div>
              <h3>SMS</h3>
              <span className="badge-disconnected">Not connected</span>
            </div>
          </div>
          <p className="settings-desc">Connect Twilio to enable SMS conversations with PropBot.</p>
          <button type="button" className="btn-outline" disabled>Connect via Twilio</button>
        </div>
      </div>

      <div className="personality-card">
        <h3>Bot personality <i className="ti ti-sparkles ai-sparkle" /></h3>
        <div className="personality-grid">
          <div>
            <label className="field-label">Bot name</label>
            <input className="field-input" defaultValue="PropBot" />
          </div>
          <div>
            <label className="field-label">Tone</label>
            <select className="field-input" defaultValue="friendly">
              <option>Friendly</option>
              <option>Professional</option>
              <option>Casual</option>
            </select>
          </div>
          <div>
            <label className="field-label">Language</label>
            <select className="field-input" defaultValue="english">
              <option>English</option>
              <option>Hindi</option>
              <option>Telugu</option>
              <option>Tamil</option>
            </select>
          </div>
          <div>
            <label className="field-label">Response speed</label>
            <select className="field-input" defaultValue="instant">
              <option value="instant">Instant</option>
              <option value="natural">Natural delay</option>
            </select>
          </div>
        </div>
        <button type="button" className="btn-primary">Save changes</button>
      </div>
    </div>
  );
}
