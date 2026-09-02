import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  createTransaction, fetchFinanceSummary, fetchProjects, fetchTransactionMeta, fetchTransactions, voidTransaction,
} from '../lib/api';
import { currentMonth } from '../lib/dates';
import { AttachmentPanel } from '../components/AttachmentPanel';
import { FinanceSummaryCards } from '../components/finance/FinanceSummaryCards';
import { TransactionForm } from '../components/finance/TransactionForm';
import { TransactionRow } from '../components/finance/TransactionRow';
import type { FinanceSummary, Project, Transaction, TransactionMeta } from '../types';

export function TransactionsPage() {
  const [searchParams] = useSearchParams();
  const projectFilter = searchParams.get('projectId') ? Number(searchParams.get('projectId')) : undefined;
  const [month, setMonth] = useState(currentMonth());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [meta, setMeta] = useState<TransactionMeta | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [lastTxId, setLastTxId] = useState<number | null>(null);
  const [error, setError] = useState('');

  function load() {
    Promise.all([
      fetchTransactions({ month, projectId: projectFilter }),
      fetchFinanceSummary(month, projectFilter),
    ]).then(([t, s]) => {
      setTransactions(t.transactions);
      setSummary(s.summary);
    }).catch(console.error);
  }

  useEffect(() => {
    fetchTransactionMeta().then(setMeta).catch(console.error);
    fetchProjects().then((r) => setProjects(r.projects)).catch(console.error);
  }, []);

  useEffect(() => { load(); }, [month, projectFilter]);

  async function onSubmit(data: Record<string, unknown>) {
    setError('');
    try {
      const result = await createTransaction({
        ...data,
        project_id: data.project_id ?? (projectFilter ?? null),
      });
      setShowForm(false);
      setLastTxId(result.transaction.id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
      throw err;
    }
  }

  async function onVoid(id: number) {
    if (!window.confirm('Void this transaction?')) return;
    await voidTransaction(id);
    load();
  }

  return (
    <>
      <header className="topbar">
        <h1 style={{ margin: 0, fontSize: '1.125rem' }}>Expenses</h1>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          <Link to="/calculator" className="btn btn-ghost">Calculator</Link>
          <Link to="/plan" className="btn btn-ghost">Calendar</Link>
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add'}
          </button>
        </div>
      </header>
      <div className="page">
        {projectFilter && (
          <p className="muted">Filtered to project #{projectFilter} · <Link to="/transactions">Show all</Link></p>
        )}
        {summary && <FinanceSummaryCards summary={summary} netLabel="Net (month)" />}

        {showForm && meta && (
          <>
            {error && <p style={{ color: '#dc2626' }}>{error}</p>}
            <TransactionForm
              meta={meta}
              projectId={projectFilter}
              projects={projects}
              onSubmit={onSubmit}
            />
          </>
        )}

        {lastTxId && !showForm && (
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ marginTop: 0 }}>Upload receipt</h3>
            <AttachmentPanel entityType="transaction" entityId={lastTxId} />
          </div>
        )}

        <div className="card">
          {transactions.length ? transactions.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} canEdit onVoid={onVoid} />
          )) : <p className="muted">No expenses this month.</p>}
        </div>
      </div>
    </>
  );
}
