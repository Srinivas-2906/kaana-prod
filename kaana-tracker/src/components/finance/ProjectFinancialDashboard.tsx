import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createTransaction,
  fetchProjectFinanceSummary,
  fetchProjectMembers,
  fetchTransactionMeta,
  fetchTransactions,
  updateProjectFinancialSettings,
  voidTransaction,
} from '../../lib/api';
import { currentMonth } from '../../lib/dates';
import { formatINR, formatRateDecimal, addDaysISO, RATE_PRESETS } from '../../lib/financeFormat';
import type { ProjectFinancialSummary, ProjectMember, Transaction, TransactionMeta } from '../../types';
import { TransactionForm } from './TransactionForm';
import { TransactionRow } from './TransactionRow';
import { BreakEvenPanel } from './BreakEvenPanel';
import { PartnerFundingPanel } from './PartnerFundingPanel';
import { FinancialTrajectoryChart } from './FinancialTrajectoryChart';

type Props = {
  projectId: number;
  canEdit: boolean;
};

export function ProjectFinancialDashboard({ projectId, canEdit }: Props) {
  const [summary, setSummary] = useState<ProjectFinancialSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [meta, setMeta] = useState<TransactionMeta | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [targetDate, setTargetDate] = useState('');
  const [rate, setRate] = useState('0.10');
  const [month] = useState(currentMonth());
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const [fin, tx, m, mem] = await Promise.all([
        fetchProjectFinanceSummary(projectId, {
          targetDate: targetDate || undefined,
          capitalAdjustmentRate: rate ? Number(rate) : undefined,
        }),
        fetchTransactions({ month, projectId }),
        fetchTransactionMeta(),
        fetchProjectMembers(projectId),
      ]);
      setSummary(fin.summary);
      setTransactions(tx.transactions);
      setMeta(m);
      setMembers(mem.members);
      if (!targetDate) setTargetDate(fin.summary.targetDate);
      if (fin.settings.capitalAdjustmentRate != null) {
        setRate(String(fin.settings.capitalAdjustmentRate));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load finance');
    }
  }, [projectId, targetDate, rate, month]);

  useEffect(() => { load(); }, [load]);

  async function onAdd(data: Record<string, unknown>) {
    await createTransaction({ ...data, project_id: projectId });
    await load();
  }

  async function onVoid(id: number) {
    if (!window.confirm('Void this transaction? It will be excluded from calculations.')) return;
    await voidTransaction(id);
    await load();
  }

  async function saveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await updateProjectFinancialSettings(projectId, {
      financial_start_date: fd.get('financial_start_date') || null,
      capital_adjustment_rate: Number(fd.get('capital_adjustment_rate')),
      economic_break_even_enabled: fd.get('economic_break_even_enabled') === 'on',
      revenue_target: fd.get('revenue_target') ? Number(fd.get('revenue_target')) : null,
    });
    setSettingsOpen(false);
    await load();
  }

  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>;
  if (!summary || !meta) return <p className="muted">Loading project financials…</p>;

  const day365Date = addDaysISO(summary.projectStartDate, 365);

  return (
    <>
      <div className="section-header">
        <h2 style={{ fontSize: '1rem' }}>Project financials</h2>
        <div className="topbar-actions">
          <Link to={`/calculator?projectId=${projectId}`} className="btn btn-ghost">Open calculator</Link>
          {canEdit && (
            <button type="button" className="btn btn-ghost" onClick={() => setSettingsOpen(!settingsOpen)}>
              Settings
            </button>
          )}
        </div>
      </div>

      {settingsOpen && canEdit && (
        <form className="card" style={{ marginBottom: '1rem' }} onSubmit={saveSettings}>
          <h3 style={{ marginTop: 0 }}>Finance settings</h3>
          <div className="form-row">
            <label>
              Project start date
              <input type="date" name="financial_start_date" defaultValue={summary.projectStartDate} />
            </label>
            <label>
              Capital adjustment rate (decimal, e.g. 0.10 = 10%)
              <input type="number" name="capital_adjustment_rate" step="0.001" min="0" defaultValue={rate} />
            </label>
            <label>
              Revenue target
              <input type="number" name="revenue_target" step="0.01" min="0" defaultValue={summary.revenueTarget ?? ''} placeholder="Optional" />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <input type="checkbox" name="economic_break_even_enabled" defaultChecked={summary.economicBreakEven.enabled} />
              Enable economic break-even
            </label>
          </div>
          <button type="submit" className="btn btn-primary">Save settings</button>
        </form>
      )}

      <div className="grid-4" style={{ marginBottom: '1rem' }}>
        <div className="card">
          <div className="muted">Actual project spend</div>
          <div className="stat-value" style={{ color: '#dc2626' }}>{formatINR(summary.actual.expenses)}</div>
        </div>
        <div className="card">
          <div className="muted">Actual revenue</div>
          <div className="stat-value" style={{ color: '#16a34a' }}>{formatINR(summary.actual.income)}</div>
        </div>
        <div className="card">
          <div className="muted">Profit / loss</div>
          <div className="stat-value">{formatINR(summary.actual.profitLoss)}</div>
        </div>
        <div className="card">
          <div className="muted">Day-365 economic BE</div>
          <div className="stat-value">{formatINR(summary.day365.remaining)}</div>
          <div className="muted" style={{ fontSize: '0.75rem' }}>{day365Date}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginTop: 0 }}>Target date simulation</h3>
        <div className="form-row">
          <label>
            Target date
            <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </label>
          <label>
            Capital adjustment rate
            <input type="number" step="0.001" min="0" value={rate} onChange={(e) => setRate(e.target.value)} />
          </label>
          <select
            onChange={(e) => { if (e.target.value) setRate(e.target.value); }}
            defaultValue=""
          >
            <option value="">Rate preset…</option>
            {RATE_PRESETS.map((p) => (
              <option key={p.label} value={p.value}>{p.label}</option>
            ))}
          </select>
          <button type="button" className="btn btn-ghost" onClick={() => setTargetDate(day365Date)}>
            Day 365 ({day365Date})
          </button>
        </div>
        <p className="muted" style={{ marginBottom: 0 }}>
          Adjusted expenses at target: {formatINR(summary.economicBreakEven.adjustedExpenses)} ·
          Adjusted income: {formatINR(summary.economicBreakEven.adjustedIncome)} ·
          Rate: {formatRateDecimal(summary.annualCapitalAdjustmentRate)}
        </p>
      </div>

      <BreakEvenPanel summary={summary} />
      <PartnerFundingPanel
        partners={summary.funding.partners}
        totalCapitalContributions={summary.funding.totalCapitalContributions}
      />
      <FinancialTrajectoryChart points={summary.trajectory} />

      {canEdit ? (
        <TransactionForm meta={meta} projectId={projectId} members={members} onSubmit={onAdd} />
      ) : (
        <p className="muted">Finance entries are read-only for your role.</p>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h3 style={{ margin: 0 }}>This month</h3>
          <Link to={`/transactions?projectId=${projectId}`} className="btn btn-ghost">All entries →</Link>
        </div>
        {transactions.length ? transactions.map((tx) => (
          <TransactionRow key={tx.id} tx={tx} canEdit={canEdit} onVoid={onVoid} />
        )) : (
          <p className="muted">No project expenses have been recorded yet.</p>
        )}
      </div>
    </>
  );
}
