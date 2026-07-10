import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, X } from 'lucide-react';
import type { Appointment } from '../types';
import { fetchAvailableSlots, updateAppointment } from '../lib/api';

function parseSlotLabel(label: string): string | null {
  // Examples: "10 AM", "10:30 AM", "1 PM"
  const m = label.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] || '0');
  const period = (m[3] || '').toUpperCase();
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

interface Props {
  appointment: Appointment;
  onClose: () => void;
  onDone: () => void;
  onToast: (msg: string, type?: 'ok' | 'err') => void;
}

export function RescheduleDialog({ appointment, onClose, onDone, onToast }: Props) {
  const initialDate = useMemo(() => appointment.scheduledAt.slice(0, 10), [appointment.scheduledAt]);
  const initialTime = useMemo(() => {
    const d = new Date(appointment.scheduledAt);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }, [appointment.scheduledAt]);

  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    let alive = true;
    setLoadingSlots(true);
    setError('');
    fetchAvailableSlots(date)
      .then((d) => {
        if (!alive) return;
        setSlots(d?.slots || []);
      })
      .catch(() => {
        if (!alive) return;
        setSlots([]);
      })
      .finally(() => { if (alive) setLoadingSlots(false); });
    return () => { alive = false; };
  }, [date]);

  async function save() {
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const iso = `${date}T${time}:00`;
      await updateAppointment(appointment.id, { scheduledAt: iso, status: 'confirmed' as Appointment['status'] });
      onToast('Appointment rescheduled');
      onDone();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not reschedule';
      setError(msg);
      onToast(msg, 'err');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <h3>Reschedule</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="form-hint" style={{ marginTop: 0 }}>
            <CalendarClock size={12} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Pick a new date/time. Available slots are shown if the server is reachable.
          </p>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label">Time</label>
              <input type="time" className="form-input" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          {loadingSlots ? (
            <p className="form-hint">Loading available slots…</p>
          ) : slots.length > 0 ? (
            <div className="time-grid" style={{ marginTop: 10 }}>
              {slots.map((label) => {
                const t = parseSlotLabel(label);
                if (!t) return null;
                return (
                  <button
                    key={label}
                    type="button"
                    className={`time-chip${time === t ? ' selected' : ''}`}
                    onClick={() => setTime(t)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="form-hint" style={{ marginTop: 10 }}>
              No slot suggestions available for this day.
            </p>
          )}

          {error && <div className="form-error">{error}</div>}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="button" className="btn btn-primary modal-submit-btn" onClick={save} disabled={saving || !date || !time}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

