import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  channelStats, dailyConversations, funnelSteps, topIntents,
} from '../../data/mockData';

export function AnalyticsView() {
  const botAgentData = dailyConversations.slice(-7).map((d) => ({
    day: d.day.replace('Jun ', 'Jun '),
    bot: d.bot,
    agent: d.agent,
  }));

  return (
    <div className="analytics-view page-fade">
      <div className="page-header">
        <div>
          <div className="eyebrow"><i className="ti ti-sparkles ai-sparkle" /> Analytics</div>
          <h1>Conversation intelligence</h1>
          <p>PropBot · Real estate · Last 14 days</p>
        </div>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-val">1,247</span>
          <span className="stat-lbl">Total conversations</span>
          <span className="stat-trend up">+23% this week</span>
        </div>
        <div className="stat-card">
          <span className="stat-val">78%</span>
          <span className="stat-lbl">Bot resolution rate</span>
          <span className="stat-sub">Handled without agent</span>
        </div>
        <div className="stat-card">
          <span className="stat-val">1.2s</span>
          <span className="stat-lbl">Avg response time</span>
          <span className="stat-sub">Across all channels</span>
        </div>
        <div className="stat-card">
          <span className="stat-val">89</span>
          <span className="stat-lbl">Leads captured</span>
          <span className="stat-trend up">This week</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Conversations by channel</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={channelStats} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {channelStats.map((c) => <Cell key={c.name} fill={c.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {channelStats.map((c) => (
              <span key={c.name}><i style={{ background: c.color }} />{c.name} {c.value}%</span>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Daily conversations</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyConversations}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE9FE" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="total" stroke="#7C3AED" fill="#EDE9FE" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Bot vs agent handled</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={botAgentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE9FE" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="bot" stackId="a" fill="#7C3AED" radius={[0, 0, 0, 0]} />
              <Bar dataKey="agent" stackId="a" fill="#1E0A3C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            <span><i style={{ background: '#7C3AED' }} /> Bot handled</span>
            <span><i style={{ background: '#1E0A3C' }} /> Agent handled</span>
          </div>
        </div>

        <div className="chart-card">
          <h3>Top user intents</h3>
          <div className="intent-bars">
            {topIntents.map((item) => (
              <div key={item.intent} className="intent-row">
                <span className="intent-name">{item.intent}</span>
                <div className="intent-track"><div style={{ width: `${item.pct}%` }} /></div>
                <span className="intent-pct">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="funnel-card">
        <h3>Conversation funnel</h3>
        <div className="funnel">
          {funnelSteps.map((step, i) => (
            <div key={step.label} className="funnel-step" style={{ flex: funnelSteps.length - i }}>
              <span className="funnel-val">{step.value.toLocaleString()}</span>
              <span className="funnel-lbl">{step.label}</span>
              {i < funnelSteps.length - 1 && <i className="ti ti-chevron-right funnel-arrow" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
