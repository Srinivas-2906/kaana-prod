import { FormEvent, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  createTransaction, fetchFinanceSummary, fetchProjects, fetchTransactionMeta, fetchTransactions,
} from '../lib/api';
import { currentMonth, todayISO } from '../lib/dates';
import { AttachmentPanel } from '../components/AttachmentPanel';
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
  const [form, setForm] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    transaction_date: todayISO(),
    payment_method: '',
    paid_by: '',
    project_id: projectFilter ?? '',
  });

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

  useEffect(() => {
    if (!meta) return;
    setForm((f) => ({
      ...f,
      category: f.category || meta.categories[0] || '',
      payment_method: f.payment_method || meta.paymentMethods[0] || '',
      paid_by: f.paid_by || meta.paidByOptions[0] || '',
      project_id: projectFilter ?? f.project_id,
    }));
  }, [meta, projectFilter]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const result = await createTransaction({
        ...form,
        amount: Number(form.amount),
        project_id: form.project_id ? Number(form.project_id) : null,
      });
      setShowForm(false);
      setLastTxId(result.transaction.id);
      setForm((f) => ({ ...f, amount: '', description: '' }));
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  }

  return (
    <>
      <header className="topbar">
        <h1 style={{ margin: 0, fontSize: '1.125rem' }}>Expenses</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
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
        {summary && (
          <div className="grid-4" style={{ marginBottom: '1rem' }}>
            <div className="card"><div className="muted">Income</div><div className="stat-value" style={{ color: '#16a34a' }}>₹{summary.total_income.toLocaleString()}</div></div>
            <div className="card"><div className="muted">Expense</div><div className="stat-value" style={{ color: '#dc2626' }}>₹{summary.total_expense.toLocaleString()}</div></div>
            <div className="card"><div className="muted">Net (month)</div><div className="stat-value">₹{summary.net.toLocaleString()}</div></div>
            <div className="card"><div className="muted">Balance</div><div className="stat-value">₹{summary.balance.toLocaleString()}</div></div>
          </div>
        )}

        {showForm && meta && (
          <form className="card" style={{ marginBottom: '1rem' }} onSubmit={onSubmit}>
            {error && <p style={{ color: '#dc2626' }}>{error}</p>}
            <div className="form-row">
              <label>
                Type
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'income' | 'expense' })}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>
              <label>
                Amount
                <input required type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </label>
              <label>
                Date
                <input required type="date" value={form.transaction_date} onChange={(e) => setForm({ ...form, transaction_date: e.target.value })} />
              </label>
              <label>
                Project
                <select value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value ? Number(e.target.value) : '' })}>
                  <option value="">None</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>
            </div>
            <div className="form-row">
              <label>
                Category
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {meta.categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label>
                Payment
                <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
                  {meta.paymentMethods.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label>
                Paid by
                <select value={form.paid_by} onChange={(e) => setForm({ ...form, paid_by: e.target.value })}>
                  {meta.paidByOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
            </div>
            <label style={{ display: 'block', marginTop: '0.75rem' }}>
              Description
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: '100%' }} />
            </label>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>Save</button>
          </form>
        )}

        {lastTxId && !showForm && (
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ marginTop: 0 }}>Upload receipt</h3>
            <AttachmentPanel entityType="transaction" entityId={lastTxId} />
          </div>
        )}

        <div className="card">
          {transactions.length ? transactions.map((tx) => (
            <div key={tx.id} className="tx-row">
              <div>
                <strong>{tx.category}</strong>
                {tx.description && <span className="muted"> — {tx.description}</span>}
                <div className="muted">{tx.transaction_date} · {tx.payment_method} · {tx.paid_by}</div>
              </div>
              <strong style={{ color: tx.type === 'income' ? '#16a34a' : '#dc2626' }}>
                {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
              </strong>
            </div>
          )) : <p className="muted">No expenses this month.</p>}
        </div>
      </div>
    </>
  );
}
