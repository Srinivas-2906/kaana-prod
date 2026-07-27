import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { Patient } from '../types';
import { PAYMENT_METHODS } from '../types';
import { recordPayment } from '../lib/api';
import { useScrollLock } from '../hooks/useScrollLock';

interface Props {
  patients: Patient[];
  prefillPatientId?: string;
  onClose: () => void;
  onSaved: () => void;
  onToast?: (msg: string, type?: 'ok' | 'err') => void;
}

export function RecordPaymentDialog({ patients, prefillPatientId, onClose, onSaved, onToast }: Props) {
  const [patientId, setPatientId] = useState(prefillPatientId || '');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useScrollLock(true);

  useEffect(() => {
    if (prefillPatientId) setPatientId(prefillPatientId);
  }, [prefillPatientId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId) { setError('Select a patient'); return; }
    const value = Number(amount);
    if (!value || value <= 0) { setError('Enter a valid amount'); return; }
    setLoading(true);
    setError('');
    try {
      await recordPayment({
        patientId,
        amount: value,
        method,
        reference,
        notes: notes.trim() || undefined,
      });
      onToast?.('Payment recorded', 'ok');
      onSaved();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not record payment';
      setError(msg);
      onToast?.(msg, 'err');
    } finally {
      setLoading(false);
    }
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <h3>Record payment</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <form className="modal-form" onSubmit={submit} noValidate>
          <div className="modal-body">
            <div className="form-field">
              <label className="form-label">Patient</label>
              <select
                className="form-input"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
                disabled={Boolean(prefillPatientId)}
              >
                <option value="">Select patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — {p.phone}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Amount (₹)</label>
              <input
                className="form-input"
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
                autoFocus={Boolean(prefillPatientId)}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Method</label>
              <select className="form-input" value={method} onChange={(e) => setMethod(e.target.value)}>
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label" style={{ fontWeight: 500 }}>
                Reference <span style={{ color: 'var(--muted)' }}>(optional)</span>
              </label>
              <input className="form-input" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="UPI txn ID" />
            </div>
            <div className="form-field">
              <label className="form-label" style={{ fontWeight: 500 }}>
                Note <span style={{ color: 'var(--muted)' }}>(optional)</span>
              </label>
              <input className="form-input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. consultation" />
            </div>
            {error && <div className="form-error">{error}</div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary modal-submit-btn" disabled={loading || !patientId || !amount}>
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
