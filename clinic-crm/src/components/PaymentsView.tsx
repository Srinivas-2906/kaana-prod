import { useState } from 'react';
import { Banknote, ChevronRight } from 'lucide-react';
import type { Payment, PaymentSummary, Patient } from '../types';
import { RecordPaymentDialog } from './RecordPaymentDialog';

function formatRs(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

interface Props {
  summary: PaymentSummary;
  payments: Payment[];
  patients: Patient[];
  onRecorded: () => void;
  onOpenPatient: (patientId: string) => void;
}

export function PaymentsView({ summary, payments, patients, onRecorded, onOpenPatient }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="view payments-view">
      <header className="page-header">
        <div>
          <p className="eyebrow">Payments</p>
          <h1 className="page-title">Collections</h1>
          <p className="page-subtitle">Tap a payment to open the patient</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>+ Record</button>
      </header>

      <div className="stat-strip">
        <div className="stat-card">
          <div className="stat-icon green"><Banknote size={16} /></div>
          <div className="stat-val">{formatRs(summary.todayTotal)}</div>
          <div className="stat-lbl">Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Banknote size={16} /></div>
          <div className="stat-val">{formatRs(summary.monthTotal)}</div>
          <div className="stat-lbl">This month</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><Banknote size={16} /></div>
          <div className="stat-val">{summary.dueCount}</div>
          <div className="stat-lbl">Due</div>
        </div>
      </div>

      {open && (
        <RecordPaymentDialog
          patients={patients}
          onClose={() => setOpen(false)}
          onSaved={onRecorded}
        />
      )}

      <ul className="payment-list">
        {payments.length === 0 ? (
          <li className="muted">No payments recorded yet.</li>
        ) : payments.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className="payment-row payment-row-btn"
              onClick={() => onOpenPatient(p.patientId)}
              disabled={!p.patientId}
            >
              <div>
                <strong>{p.patientName || 'Patient'}</strong>
                <span>{formatRs(p.amount)} · {p.method}</span>
                {p.reference && <span className="ref">{p.reference}</span>}
              </div>
              <div className="payment-row-end">
                <small>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : ''}</small>
                {p.patientId && <ChevronRight size={14} className="payment-row-chevron" />}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
