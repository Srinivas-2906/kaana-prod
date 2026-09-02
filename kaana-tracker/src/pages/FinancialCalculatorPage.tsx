import { FormEvent, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  fetchProjectFinanceSummary,
  fetchProjectFinancialSettings,
  simulateFinance,
} from '../lib/api';
import { todayISO } from '../lib/dates';
import { formatINR, formatRateDecimal, addDaysISO, RATE_PRESETS } from '../lib/financeFormat';
import type { ProjectFinancialSummary, SimulateCashFlow } from '../types';
import { BreakEvenPanel } from '../components/finance/BreakEvenPanel';
import { FinancialTrajectoryChart } from '../components/finance/FinancialTrajectoryChart';

type CashFlowRow = SimulateCashFlow & { key: string };

function emptyRow(): CashFlowRow {
  return {
    key: crypto.randomUUID(),
    amount: 0,
    date: todayISO(),
    ledger_type: 'expense',
  };
}

export function FinancialCalculatorPage() {
  const [searchParams] = useSearchParams();
  const projectIdParam = searchParams.get('projectId');
  const projectId = projectIdParam ? Number(projectIdParam) : null;

  const [projectStartDate, setProjectStartDate] = useState('2026-01-01');
  const [targetDate, setTargetDate] = useState('');
  const [rate, setRate] = useState('0.10');
  const [cashFlows, setCashFlows] = useState<CashFlowRow[]>([emptyRow()]);
  const [summary, setSummary] = useState<ProjectFinancialSummary | null>(null);
  const [useProjectData, setUseProjectData] = useState(Boolean(projectId));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projectId && useProjectData) {
      fetchProjectFinancialSettings(projectId).then((r) => {
        setProjectStartDate(r.settings.financialStartDate);
        if (r.settings.capitalAdjustmentRate != null) {
          setRate(String(r.settings.capitalAdjustmentRate));
        }
        setTargetDate(addDaysISO(r.settings.financialStartDate, 365));
      }).catch(console.error);
    } else if (!targetDate) {
      setTargetDate(addDaysISO(projectStartDate, 365));
    }
  }, [projectId, useProjectData, projectStartDate]);

  async function runSimulation(e?: FormEvent) {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        projectStartDate,
        targetDate: targetDate || addDaysISO(projectStartDate, 365),
        annualCapitalAdjustmentRate: Number(rate),
      };

      if (useProjectData && projectId) {
        body.projectId = projectId;
      } else {
        body.cashFlows = cashFlows
          .filter((cf) => cf.amount > 0)
          .map(({ amount, date, ledger_type, funding_source, partner_user_id }) => ({
            amount, date, ledger_type, funding_source, partner_user_id,
          }));
      }

      const result = await simulateFinance(body);
      setSummary(result.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  }

  async function loadProjectComparison() {
    if (!projectId) return;
    const proj = await fetchProjectFinanceSummary(projectId, {
      targetDate: targetDate || addDaysISO(projectStartDate, 365),
      capitalAdjustmentRate: Number(rate),
    });
    setSummary(proj.summary);
  }

  function updateRow(key: string, patch: Partial<CashFlowRow>) {
    setCashFlows((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  return (
    <>
      <header className="topbar">
        <h1 style={{ margin: 0, fontSize: '1.125rem' }}>Financial calculator</h1>
        {projectId && (
          <Link to={`/projects/${projectId}/finance`} className="btn btn-ghost">← Project finance</Link>
        )}
      </header>
      <div className="page">
        <p className="muted">
          Simulate accounting and economic break-even. Uses the same engine as project financials — results must match for identical inputs.
        </p>

        <form className="card" onSubmit={runSimulation}>
          {error && <p style={{ color: '#dc2626' }}>{error}</p>}
          <div className="form-row">
            <label>
              Project start
              <input type="date" value={projectStartDate} onChange={(e) => setProjectStartDate(e.target.value)} required />
            </label>
            <label>
              Target date
              <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} required />
            </label>
            <label>
              Capital adjustment rate
              <input type="number" step="0.001" min="0" value={rate} onChange={(e) => setRate(e.target.value)} required />
            </label>
            <select onChange={(e) => { if (e.target.value) setRate(e.target.value); }} defaultValue="">
              <option value="">Preset…</option>
              {RATE_PRESETS.map((p) => <option key={p.label} value={p.value}>{p.label}</option>)}
            </select>
            <button type="button" className="btn btn-ghost" onClick={() => setTargetDate(addDaysISO(projectStartDate, 365))}>
              Day 365
            </button>
          </div>

          {projectId && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
              <input
                type="checkbox"
                checked={useProjectData}
                onChange={(e) => setUseProjectData(e.target.checked)}
              />
              Use project data (project #{projectId})
            </label>
          )}

          {!useProjectData && (
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ marginTop: 0 }}>Cash flows</h3>
              {cashFlows.map((row) => (
                <div key={row.key} className="form-row" style={{ marginBottom: '0.5rem' }}>
                  <select
                    value={row.ledger_type}
                    onChange={(e) => updateRow(row.key, { ledger_type: e.target.value as CashFlowRow['ledger_type'] })}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="capital_contribution">Capital contribution</option>
                    <option value="reimbursement">Reimbursement</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Amount"
                    value={row.amount || ''}
                    onChange={(e) => updateRow(row.key, { amount: Number(e.target.value) })}
                  />
                  <input type="date" value={row.date} onChange={(e) => updateRow(row.key, { date: e.target.value })} />
                  <button type="button" className="btn btn-ghost" onClick={() => setCashFlows((r) => r.filter((x) => x.key !== row.key))}>Remove</button>
                </div>
              ))}
              <button type="button" className="btn btn-ghost" onClick={() => setCashFlows((r) => [...r, emptyRow()])}>Add row</button>
            </div>
          )}

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Calculating…' : 'Calculate'}
            </button>
            {projectId && (
              <button type="button" className="btn btn-ghost" onClick={loadProjectComparison}>
                Load from project API
              </button>
            )}
          </div>
        </form>

        {summary && (
          <>
            <div className="grid-4" style={{ marginBottom: '1rem' }}>
              <div className="card"><div className="muted">Nominal expenses</div><div className="stat-value">{formatINR(summary.economicBreakEven.nominalExpensesUntilTarget)}</div></div>
              <div className="card"><div className="muted">Nominal income</div><div className="stat-value">{formatINR(summary.economicBreakEven.nominalIncomeUntilTarget)}</div></div>
              <div className="card"><div className="muted">Adjusted expenses</div><div className="stat-value">{formatINR(summary.economicBreakEven.adjustedExpenses)}</div></div>
              <div className="card"><div className="muted">Adjusted income</div><div className="stat-value">{formatINR(summary.economicBreakEven.adjustedIncome)}</div></div>
            </div>
            <BreakEvenPanel summary={summary} />
            <FinancialTrajectoryChart points={summary.trajectory} />
            <p className="muted">
              Rate applied: {formatRateDecimal(summary.annualCapitalAdjustmentRate)} · Target: {summary.targetDate}
            </p>
          </>
        )}
      </div>
    </>
  );
}
