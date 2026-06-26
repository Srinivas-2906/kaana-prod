import { useState } from 'react';
import type { Payment, PaymentSummary, Patient } from '../types';
import { recordPayment } from '../lib/api';

function formatRs(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

interface Props {
  summary: PaymentSummary;
  payments: Payment[];
  patients: Patient[];
  onRecorded: () => void;
}

export function PaymentsView({ summary, payments, patients, onRecorded }: Props) {
  const [open, setOpen] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('upi');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId || !amount) return;
    setLoading(true);
    try {
      await recordPayment({
        patientId,
        amount: Number(amount),
        method,
        reference,
      });
      setOpen(false);
      setAmount('');
      setReference('');
      onRecorded();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="view payments-view">
      <header className="page-header">
        <div>
          <p className="eyebrow">No payment gateway</p>
          <h1>Payments</h1>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>+ Record</button>
      </header>

      <div className="stat-row">
        <div className="stat-pill ok">Today {formatRs(summary.todayTotal)}</div>
        <div className="stat-pill">Month {formatRs(summary.monthTotal)}</div>
        {summary.dueCount > 0 && <div className="stat-pill warn">{summary.dueCount} due</div>}
      </div>

      {open && (
        <form className="card form-card" onSubmit={submit}>
          <h3>Record payment (cash / UPI)</h3>
          <label>Patient</label>
          <select value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
            <option value="">Select patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {p.phone}</option>
            ))}
          </select>
          <label>Amount (₹)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" />
          <label>Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
          </select>
          <label>Reference (optional)</label>
          <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="UPI txn ID" />
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      )}

      <ul className="payment-list">
        {payments.length === 0 ? (
          <li className="muted">No payments recorded yet.</li>
        ) : payments.map((p) => (
          <li key={p.id} className="payment-row">
            <div>
              <strong>{p.patientName}</strong>
              <span>{formatRs(p.amount)} · {p.method}</span>
              {p.reference && <span className="ref">{p.reference}</span>}
            </div>
            <small>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : ''}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

const CHECKLIST = [
  { id: 'gbp', label: 'Create Google Business Profile', hint: 'business.google.com — add photos, hours, services' },
  { id: 'wa', label: 'Connect WhatsApp number', hint: 'Done via Kaana platform dashboard' },
  { id: 'services', label: 'Add services & pricing', hint: 'Settings → catalog in platform' },
  { id: 'hours', label: 'Set clinic hours', hint: '10 AM – 7 PM default; contact Kaana to customize' },
  { id: 'staff', label: 'Train front desk on Book tab', hint: '3-step walk-in booking in this app' },
  { id: 'reminders', label: 'Enable appointment reminders', hint: 'Auto: 24h + 2h before visit' },
  { id: 'recall', label: '6-month cleaning recall', hint: 'Auto after marking visit Done' },
];

export function SetupView() {
  const storageKey = 'kaana_clinic_checklist';
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch {
      return {};
    }
  });

  function toggle(id: string) {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  const done = CHECKLIST.filter((c) => checked[c.id]).length;

  return (
    <div className="view setup-view">
      <header className="page-header">
        <div>
          <p className="eyebrow">Onboarding</p>
          <h1>Clinic setup</h1>
          <p className="sub">{done}/{CHECKLIST.length} complete</p>
        </div>
      </header>

      <ul className="checklist">
        {CHECKLIST.map((item) => (
          <li key={item.id}>
            <button type="button" className={`check-row ${checked[item.id] ? 'done' : ''}`} onClick={() => toggle(item.id)}>
              <span className="check-box">{checked[item.id] ? '✓' : ''}</span>
              <div>
                <strong>{item.label}</strong>
                <p>{item.hint}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
