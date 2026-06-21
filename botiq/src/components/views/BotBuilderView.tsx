const nodes = [
  { id: 'start', label: 'Start', type: 'trigger', x: 40, y: 20 },
  { id: 'greet', label: 'Greeting message', type: 'message', x: 180, y: 20, selected: true },
  { id: 'intent', label: 'Intent detection', type: 'condition', x: 360, y: 20 },
  { id: 'search', label: 'Property search', type: 'message', x: 180, y: 140 },
  { id: 'visit', label: 'Site visit booking', type: 'message', x: 360, y: 140 },
  { id: 'listings', label: 'Show listings', type: 'action', x: 40, y: 260 },
  { id: 'datetime', label: 'Date/time picker', type: 'action', x: 360, y: 260 },
  { id: 'capture', label: 'Capture interest', type: 'action', x: 40, y: 380 },
  { id: 'confirm', label: 'Confirm + notify', type: 'action', x: 360, y: 380 },
  { id: 'crm', label: 'Lead saved to CRM', type: 'action', x: 180, y: 500 },
];

const edges = [
  ['start', 'greet'], ['greet', 'intent'],
  ['intent', 'search'], ['intent', 'visit'],
  ['search', 'listings'], ['visit', 'datetime'],
  ['listings', 'capture'], ['datetime', 'confirm'],
  ['capture', 'crm'], ['confirm', 'crm'],
];

const typeColor: Record<string, string> = {
  trigger: '#7C3AED',
  message: '#2563EB',
  condition: '#F59E0B',
  action: '#10B981',
};

export function BotBuilderView() {
  return (
    <div className="builder-view page-fade">
      <div className="page-header">
        <div>
          <div className="eyebrow"><i className="ti ti-robot" /> Bot builder</div>
          <h1>PropBot flow</h1>
          <p>Visual conversation flow · Real estate enquiry</p>
        </div>
        <button type="button" className="btn-primary"><i className="ti ti-player-play" /> Test flow</button>
      </div>

      <div className="builder-layout">
        <div className="flow-canvas">
          <svg className="flow-lines" viewBox="0 0 520 560" preserveAspectRatio="xMidYMid meet">
            {edges.map(([from, to]) => {
              const a = nodes.find((n) => n.id === from)!;
              const b = nodes.find((n) => n.id === to)!;
              return (
                <line
                  key={`${from}-${to}`}
                  x1={a.x + 70}
                  y1={a.y + 28}
                  x2={b.x}
                  y2={b.y + 28}
                  stroke="#D8D0F0"
                  strokeWidth="2"
                  markerEnd="url(#arrow)"
                />
              );
            })}
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#A78BFA" />
              </marker>
            </defs>
          </svg>
          {nodes.map((n) => (
            <div
              key={n.id}
              className={`flow-node ${n.selected ? 'selected' : ''}`}
              style={{ left: n.x, top: n.y, borderTopColor: typeColor[n.type] }}
            >
              <span className="node-type">{n.type}</span>
              {n.label}
            </div>
          ))}
        </div>

        <aside className="node-settings">
          <h3>Node settings</h3>
          <p className="node-selected-label">Greeting message</p>

          <label className="field-label">Message text</label>
          <textarea
            className="field-input"
            rows={4}
            defaultValue={"Hi! 👋 Welcome to Prestige Properties. I'm PropBot, your AI assistant. How can I help you today?"}
          />

          <label className="field-label">Quick replies</label>
          <div className="tag-list">
            {['🏠 Browse properties', '📅 Book site visit', '💰 Check pricing', '📞 Talk to agent'].map((t) => (
              <span key={t} className="tag-chip">{t}</span>
            ))}
          </div>

          <label className="field-label">Fallback</label>
          <select className="field-input" defaultValue="agent">
            <option value="agent">Escalate to agent</option>
            <option value="retry">Retry intent detection</option>
          </select>

          <label className="field-label flex-row">
            <input type="checkbox" defaultChecked /> Use AI intent matching <i className="ti ti-sparkles ai-sparkle" />
          </label>

          <button type="button" className="btn-primary full">Save node</button>
        </aside>
      </div>
    </div>
  );
}
