import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { pipelineTrendData, sourceChartData } from '../../data/mockData';
import type { Lead } from '../../types';
import { stageLabel } from '../../reducers/leadsReducer';

const COLORS = ['#185FA5', '#534AB7', '#3B6D11', '#854F0B', '#E24B4A', '#64748b'];

interface ReportsViewProps {
  leads: Lead[];
}

export function ReportsView({ leads }: ReportsViewProps) {
  const byStage = ['new', 'contacted', 'site', 'negotiation'].map((s) => ({
    stage: stageLabel(s as 'new'),
    count: leads.filter((l) => l.stage === s).length,
  }));
  const avgScore = Math.round(leads.reduce((a, l) => a + l.score, 0) / leads.length);

  return (
    <div className="reports-view">
      <div className="section-hd">
        <div>
          <h2>Performance reports</h2>
          <p>Pipeline health and lead source analytics</p>
        </div>
      </div>

      <div className="report-stat-row">
        <div className="report-stat">
          <div className="report-stat-val">{avgScore}</div>
          <div>Avg AI score</div>
        </div>
        {byStage.map((s) => (
          <div key={s.stage} className="report-stat">
            <div className="report-stat-val">{s.count}</div>
            <div>{s.stage}</div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card panel">
          <h3>Leads by source</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={sourceChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {sourceChartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card panel">
          <h3>Pipeline value over time (₹Cr)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={pipelineTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} domain={[1.5, 2.6]} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#185FA5" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
