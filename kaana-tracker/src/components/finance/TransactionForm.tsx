import { FormEvent, useEffect, useState } from 'react';
import type { LedgerType, Project, ProjectMember, TransactionMeta } from '../../types';
import { todayISO } from '../../lib/dates';

type Props = {
  meta: TransactionMeta;
  projectId?: number;
  projects?: Project[];
  members?: ProjectMember[];
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  initial?: Partial<{
    ledger_type: LedgerType;
    amount: number;
    category: string;
    description: string;
    transaction_date: string;
    payment_method: string;
    paid_by: string;
    funding_source: string;
    partner_user_id: number | '';
    reimbursable: boolean;
  }>;
  submitLabel?: string;
};

export function TransactionForm({ meta, projectId, projects = [], members = [], onSubmit, initial, submitLabel = 'Save' }: Props) {
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    ledger_type: (initial?.ledger_type || 'expense') as LedgerType,
    amount: initial?.amount?.toString() || '',
    category: initial?.category || '',
    description: initial?.description || '',
    transaction_date: initial?.transaction_date || todayISO(),
    payment_method: initial?.payment_method || meta.paymentMethods[0] || 'UPI',
    paid_by: initial?.paid_by || meta.paidByOptions[0] || 'Company',
    funding_source: initial?.funding_source || 'company_account',
    partner_user_id: initial?.partner_user_id ?? ('' as number | ''),
    reimbursable: initial?.reimbursable || false,
    project_id: projectId ?? ('' as number | ''),
  });

  useEffect(() => {
    if (!form.category && meta.categories.length) {
      setForm((f) => ({ ...f, category: meta.categories[0] }));
    }
  }, [meta]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const fundingSource = form.funding_source;
      const paidBy = fundingSource === 'company_account' ? 'Company' : 'Partner';
      await onSubmit({
        ledger_type: form.ledger_type,
        type: form.ledger_type === 'income' ? 'income' : 'expense',
        amount: Number(form.amount),
        category: form.category,
        description: form.description || null,
        transaction_date: form.transaction_date,
        payment_method: form.payment_method,
        paid_by: paidBy,
        funding_source: fundingSource,
        partner_user_id: form.partner_user_id ? Number(form.partner_user_id) : null,
        reimbursable: form.reimbursable,
        project_id: form.project_id ? Number(form.project_id) : (projectId ?? null),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  }

  const ledgerTypes = meta.ledgerTypes || ['expense', 'income', 'capital_contribution', 'reimbursement', 'withdrawal', 'distribution'];

  return (
    <form className="card" style={{ marginBottom: '1rem' }} onSubmit={handleSubmit}>
      <h3 style={{ marginTop: 0 }}>Add financial entry</h3>
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      <div className="form-row">
        <select
          value={form.ledger_type}
          onChange={(e) => setForm({ ...form, ledger_type: e.target.value as LedgerType })}
        >
          {ledgerTypes.map((lt) => (
            <option key={lt} value={lt}>{lt.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <input
          required
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {meta.categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" required value={form.transaction_date} onChange={(e) => setForm({ ...form, transaction_date: e.target.value })} />
        {!projectId && projects.length > 0 && (
          <select
            value={form.project_id}
            onChange={(e) => setForm({ ...form, project_id: e.target.value ? Number(e.target.value) : '' })}
          >
            <option value="">No project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
      </div>
      <div className="form-row" style={{ marginTop: '0.5rem' }}>
        <select value={form.funding_source} onChange={(e) => setForm({ ...form, funding_source: e.target.value })}>
          <option value="company_account">Company / project paid</option>
          <option value="partner_personal">I personally paid this</option>
        </select>
        {members.length > 0 && form.funding_source === 'partner_personal' && (
          <select
            value={form.partner_user_id}
            onChange={(e) => setForm({ ...form, partner_user_id: e.target.value ? Number(e.target.value) : '' })}
          >
            <option value="">Select partner</option>
            {members.map((m) => <option key={m.user_id} value={m.user_id}>{m.name}</option>)}
          </select>
        )}
        <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
          {meta.paymentMethods.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}
