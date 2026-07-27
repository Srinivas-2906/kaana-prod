import { useEffect, useMemo, useState } from 'react';
import { Search, X, CalendarDays, User } from 'lucide-react';
import type { Appointment, Patient } from '../types';
import { fetchPatients } from '../lib/api';

interface Props {
  todayAppointments: Appointment[];
  onClose: () => void;
  onOpenPatient: (id: string) => void;
  onToast: (msg: string, type?: 'ok' | 'err') => void;
  onGoToToday: () => void;
}

function fmtPhone(phone: string) {
  const d = phone.replace(/\D/g, '');
  if (d.length === 10) return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
  if (d.length === 12 && d.startsWith('91')) return `+91 ${d.slice(2, 7)} ${d.slice(7)}`;
  return phone;
}

export function GlobalSearchDialog({ todayAppointments, onClose, onOpenPatient, onToast, onGoToToday }: Props) {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const query = q.trim();
    if (!query) { setPatients([]); return; }
    const t = setTimeout(() => {
      setLoading(true);
      fetchPatients(query)
        .then((res) => setPatients(res || []))
        .catch(() => setPatients([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const apptMatches = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return todayAppointments.filter((a) => {
      const name = (a.patientName || '').toLowerCase();
      const phone = (a.patientPhone || '').replace(/\D/g, '');
      return name.includes(query) || phone.includes(query.replace(/\D/g, ''));
    }).slice(0, 6);
  }, [q, todayAppointments]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <h3>Search</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="search-wrap" style={{ marginTop: 0 }}>
            <span className="search-icon"><Search size={15} /></span>
            <input
              type="search"
              className="search-input"
              placeholder="Search patient name, phone, email, notes…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
          </div>

          {q.trim() && (
            <p className="form-hint" style={{ marginTop: 10 }}>
              {loading ? 'Searching…' : `Found ${patients.length} patient${patients.length !== 1 ? 's' : ''}`}
            </p>
          )}

          {apptMatches.length > 0 && (
            <div className="panel" style={{ marginTop: 10 }}>
              <div className="panel-head">
                <CalendarDays size={14} color="var(--brand)" />
                <span className="panel-title">Today</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={onGoToToday}>Open Today</button>
              </div>
              <div className="panel-body" style={{ paddingTop: 6 }}>
                <ul className="mini-appt-list">
                  {apptMatches.map((a) => (
                    <li key={a.id} className="mini-appt-row">
                      <div style={{ minWidth: 0 }}>
                        <div className="mini-appt-date">
                          {new Date(a.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                        <div className="mini-appt-svc">{a.patientName || 'Patient'} · {a.service}</div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          if (!a.patientId) { onToast('Patient record not linked to this booking', 'err'); return; }
                          onOpenPatient(a.patientId);
                          onClose();
                        }}
                      >
                        Open
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {patients.length > 0 && (
            <div className="panel" style={{ marginTop: 10 }}>
              <div className="panel-head">
                <User size={14} color="var(--brand)" />
                <span className="panel-title">Patients</span>
              </div>
              <div className="panel-body" style={{ paddingTop: 6 }}>
                <ul className="mini-appt-list">
                  {patients.slice(0, 8).map((p) => (
                    <li key={p.id} className="mini-appt-row">
                      <div style={{ minWidth: 0 }}>
                        <div className="mini-appt-date">{p.name}</div>
                        <div className="mini-appt-svc">{fmtPhone(p.phone)}{p.chiefComplaint ? ` · ${p.chiefComplaint}` : ''}</div>
                      </div>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => { onOpenPatient(p.id); onClose(); }}>
                        Open
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-ghost modal-submit-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

