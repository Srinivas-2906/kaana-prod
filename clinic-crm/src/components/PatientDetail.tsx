import { useState, useEffect, Fragment } from 'react';
import { ChevronLeft, MessageSquare, UserCheck, Clock, FileText, PlusCircle, Phone, Stethoscope, Search, X } from 'lucide-react';
import type { Appointment, Patient } from '../types';
import { SERVICES, STATUS_LABELS } from '../types';
import { updatePatient, updateAppointment, createPatient, createAppointment, fetchPatients } from '../lib/api';

const INBOX = import.meta.env.VITE_INBOX_URL || 'http://localhost:5173';

const PALETTES: [string, string][] = [
  ['#1565C0','#e3f0fd'],['#0369a1','#e0f2fe'],['#7c3aed','#f5f3ff'],
  ['#059669','#ecfdf5'],['#b45309','#fef3c7'],['#be185d','#fce7f3'],['#0f766e','#ccfbf1'],
];
function ava(name: string): [string, string] { return PALETTES[name.charCodeAt(0) % PALETTES.length]; }

const TAG_CLASS: Record<string, string> = {
  requested:'tag tag-warning', confirmed:'tag tag-brand', arrived:'tag tag-purple',
  visited:'tag tag-success',   cancelled:'tag tag-muted', no_show:'tag tag-muted',
};

/* ═══════════════════════════════════════════
   PATIENT DETAIL
═══════════════════════════════════════════ */
type DetailTab = 'overview' | 'history' | 'notes';

interface Props {
  patient: Patient;
  appointments: Appointment[];
  onBack: () => void;
  onUpdated: () => void;
  onToast: (msg: string, type?: 'ok' | 'err') => void;
  onBookFollowup?: (patient: Patient) => void;
}

export function PatientDetail({ patient, appointments, onBack, onUpdated, onToast, onBookFollowup }: Props) {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [note,    setNote]    = useState('');
  const [saving,  setSaving]  = useState(false);
  const [fg, bg] = ava(patient.name);
  const phone = patient.phone.replace(/\D/g, '');
  const chatUrl = `${INBOX}?thread=wa-${phone}`;

  const visited   = appointments.filter(a => a.status === 'visited').sort((a,b)=>new Date(b.scheduledAt).getTime()-new Date(a.scheduledAt).getTime());
  const upcoming  = appointments.filter(a => a.status === 'confirmed' || a.status === 'arrived' || a.status === 'requested').sort((a,b)=>new Date(a.scheduledAt).getTime()-new Date(b.scheduledAt).getTime());
  const lastVisit = visited[0];
  const nextAppt  = upcoming[0];

  async function addNote() {
    if (!note.trim()) return;
    setSaving(true);
    try {
      await updatePatient(patient.id, { note: note.trim() });
      setNote(''); onUpdated();
      onToast('Note saved');
    } catch { onToast('Could not save note', 'err'); }
    finally { setSaving(false); }
  }

  async function confirmAppt(id: string) {
    try {
      await updateAppointment(id, { status: 'confirmed' as Appointment['status'] });
      onUpdated(); onToast('Booking confirmed');
    } catch { onToast('Could not save', 'err'); }
  }

  const TABS: { id: DetailTab; label: string }[] = [
    { id: 'overview', label: 'Details' },
    { id: 'history',  label: `Visits (${appointments.length})` },
    { id: 'notes',    label: `Notes (${(patient.notes||[]).length})` },
  ];

  return (
    <div className="patient-detail">
      {/* Hero header */}
      <div className="detail-hero">
        <button type="button" className="detail-back" onClick={onBack} aria-label="Back">
          <ChevronLeft size={16} />
        </button>
        <div className="detail-ava" style={{ background: bg, color: fg }}>
          {patient.name.charAt(0).toUpperCase()}
        </div>
        <div className="detail-hero-info">
          <div className="detail-hero-name">{patient.name}</div>
          <div className="detail-hero-phone">{patient.phone}</div>
          <div className="detail-hero-tags">
            {patient.age && <span className="detail-hero-tag">Age {patient.age}</span>}
            {patient.gender && <span className="detail-hero-tag">{patient.gender}</span>}
            {patient.isReturning ? <span className="detail-hero-tag">Returning</span> : <span className="detail-hero-tag">New</span>}
            {patient.source && <span className="detail-hero-tag">{patient.source}</span>}
          </div>
        </div>
        {/* Quick contact */}
        <div className="detail-hero-contact">
          {phone && <a href={`tel:+91${phone}`} className="quick-action-btn quick-action-light" title="Call"><Phone size={14} /></a>}
          {phone && <a href={`https://wa.me/91${phone}`} target="_blank" rel="noreferrer" className="quick-action-btn quick-action-wa" title="WhatsApp"><MessageSquare size={14} /></a>}
        </div>
      </div>

      {/* Tab bar */}
      <div className="detail-tabs">
        {TABS.map(t => (
          <button key={t.id} type="button"
            className={`detail-tab${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="detail-body">

        {/* ── Overview tab ── */}
        {activeTab === 'overview' && (
          <>
            {/* Key info */}
            <div className="panel">
              <div className="panel-head">
                <UserCheck size={14} color="var(--brand)" />
                <span className="panel-title">About patient</span>
              </div>
              <div className="panel-body">
                <div className="info-grid" style={{ marginBottom: 16 }}>
                  <dl className="info-item">
                    <dt>Problem</dt>
                    <dd>{patient.chiefComplaint || '—'}</dd>
                  </dl>
                  <dl className="info-item">
                    <dt>Visits done</dt>
                    <dd>{visited.length}</dd>
                  </dl>
                  <dl className="info-item">
                    <dt>Last visit</dt>
                    <dd>{lastVisit ? new Date(lastVisit.scheduledAt).toLocaleDateString('en-IN') : 'Never'}</dd>
                  </dl>
                  <dl className="info-item">
                    <dt>Next visit</dt>
                    <dd style={{ color: nextAppt ? 'var(--brand)' : 'var(--muted)' }}>
                      {nextAppt
                        ? new Date(nextAppt.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : 'None'}
                    </dd>
                  </dl>
                  <dl className="info-item">
                    <dt>Joined</dt>
                    <dd>{patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}</dd>
                  </dl>
                  <dl className="info-item">
                    <dt>Source</dt>
                    <dd>{patient.source || '—'}</dd>
                  </dl>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a href={chatUrl} target="_blank" rel="noreferrer" className="chat-btn" style={{ flex: 1 }}>
                    <MessageSquare size={14} /> WhatsApp
                  </a>
                  {onBookFollowup && (
                    <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={() => onBookFollowup(patient)}>
                      <PlusCircle size={13} /> Book again
                    </button>
                  )}
                </div>
              </div>
            </div>

            {nextAppt && (
              <div className="panel">
                <div className="panel-head">
                  <Clock size={14} color="var(--brand)" />
                  <span className="panel-title">Next visit</span>
                  <span className={TAG_CLASS[nextAppt.status]}>{STATUS_LABELS[nextAppt.status]}</span>
                </div>
                <div className="panel-body">
                  <div className="info-grid">
                    <dl className="info-item">
                      <dt>When</dt>
                      <dd>{new Date(nextAppt.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</dd>
                    </dl>
                    <dl className="info-item">
                      <dt>What for</dt>
                      <dd>{nextAppt.service}</dd>
                    </dl>
                  </div>
                  {nextAppt.status === 'requested' && (
                    <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={() => confirmAppt(nextAppt.id)}>
                      Confirm booking
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── History tab ── */}
        {activeTab === 'history' && (
          <div className="panel">
            <div className="panel-head">
              <Clock size={14} color="var(--brand)" />
              <span className="panel-title">Past visits</span>
            </div>
            <div className="panel-body">
              {appointments.length === 0 ? (
                <p className="muted">No visits yet.</p>
              ) : (
                <ul className="mini-appt-list">
                  {[...appointments].sort((a,b)=>new Date(b.scheduledAt).getTime()-new Date(a.scheduledAt).getTime()).map((a) => (
                    <li key={a.id} className="mini-appt-row">
                      <div style={{ minWidth: 0 }}>
                        <div className="mini-appt-date">
                          {new Date(a.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                        <div className="mini-appt-svc">{a.service}</div>
                        {a.source && <div className="mini-appt-svc" style={{ color: 'var(--muted)', fontSize: 11 }}>from {a.source}</div>}
                        <span className={TAG_CLASS[a.status] || 'tag tag-muted'} style={{ marginTop: 5, display: 'inline-flex' }}>
                          {STATUS_LABELS[a.status]}
                        </span>
                      </div>
                      {a.status === 'requested' && (
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => confirmAppt(a.id)}>Confirm</button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ── Notes tab ── */}
        {activeTab === 'notes' && (
          <div className="panel">
            <div className="panel-head">
              <FileText size={14} color="var(--brand)" />
              <span className="panel-title">Notes</span>
            </div>
            <div className="panel-body">
              <div className="note-form">
                <textarea
                  rows={3}
                  placeholder="Write a note for the team…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <div className="note-form-row">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={saving || !note.trim()}
                    onClick={addNote}
                  >
                    <PlusCircle size={12} /> Save note
                  </button>
                </div>
              </div>
              {(patient.notes || []).length === 0 && !note && (
                <p className="muted" style={{ marginTop: 12 }}>No notes yet.</p>
              )}
              {(patient.notes || []).length > 0 && (
                <div className="notes-timeline">
                  {(patient.notes || []).map((n, i) => (
                    <div key={i} className="note-item">
                      <p>{n.text}</p>
                      <small>{n.by} · {new Date(n.at).toLocaleString('en-IN')}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   BOOK / WALK-IN FORM  (with patient search)
═══════════════════════════════════════════ */
interface BookProps {
  onBooked: () => void;
  onToast: (msg: string, type?: 'ok' | 'err') => void;
  prefillPatient?: Patient | null;
  onCancelPrefill?: () => void;
}

const TIME_SLOTS = [
  '10:00','10:30','11:00','11:30','12:00','12:30',
  '17:00','17:30','18:00','18:30','19:00','19:30',
];

function fmtSlot(t: string) {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export function BookView({ onBooked, onToast, prefillPatient, onCancelPrefill }: BookProps) {
  // Step 0 = patient lookup, 1 = patient info (new), 2 = treatment, 3 = date/time
  const [step,           setStep]           = useState<0 | 1 | 2 | 3>(prefillPatient ? 2 : 0);
  const [searchPhone,    setSearchPhone]    = useState('');
  const [searching,      setSearching]      = useState(false);
  const [foundPatient,   setFoundPatient]   = useState<Patient | null>(prefillPatient || null);
  const [name,           setName]           = useState('');
  const [phone,          setPhone]          = useState('');
  const [age,            setAge]            = useState('');
  const [service,        setService]        = useState(SERVICES[0]);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [date,           setDate]           = useState(new Date().toISOString().slice(0, 10));
  const [time,           setTime]           = useState('10:00');
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');

  useEffect(() => {
    if (prefillPatient) {
      setFoundPatient(prefillPatient);
      setStep(2);
      setSearchPhone('');
      setError('');
    }
  }, [prefillPatient]);

  const step1Valid = name.trim().length > 0 && phone.replace(/\D/g,'').length >= 10;

  async function searchPatient() {
    if (searchPhone.replace(/\D/g,'').length < 6) return;
    setSearching(true);
    try {
      const results = await fetchPatients(searchPhone);
      if (results.length > 0) {
        setFoundPatient(results[0]);
      } else {
        setFoundPatient(null);
        setPhone(searchPhone);
        setStep(1);
      }
    } catch { setFoundPatient(null); }
    finally { setSearching(false); }
  }

  async function submit() {
    setLoading(true); setError('');
    try {
      let patient: Patient;
      if (foundPatient) {
        patient = foundPatient;
      } else {
        patient = await createPatient({
          name, phone, age: age ? Number(age) : undefined,
          chiefComplaint: chiefComplaint || service, source: 'Walk-in',
        });
      }
      await createAppointment({
        patientId: patient.id, service,
        scheduledAt: `${date}T${time}:00`, status: 'confirmed', source: 'Walk-in',
      });
      onToast(`Booked for ${patient.name}`);
      setStep(0); setName(''); setPhone(''); setFoundPatient(null); setSearchPhone('');
      onBooked();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not book. Try again.');
      onToast('Could not book', 'err');
    } finally { setLoading(false); }
  }

  function goBackFromTreatment() {
    if (prefillPatient && onCancelPrefill) {
      onCancelPrefill();
      return;
    }
    setStep(foundPatient ? 0 : 1);
  }

  const totalSteps = prefillPatient ? 2 : foundPatient ? 3 : 3;
  const stepIndex = (() => {
    if (prefillPatient) return step === 2 ? 1 : 2;
    if (foundPatient) {
      if (step === 0) return 1;
      if (step === 2) return 2;
      if (step === 3) return 3;
      return 1;
    }
    if (step === 0) return 1;
    if (step === 1) return 2;
    if (step === 2) return 3;
    return 3;
  })();

  return (
    <div className="view book-view">
      <header className="page-header">
        <div>
          <p className="eyebrow">Book</p>
          <h1 className="page-title">New booking</h1>
          <p className="page-subtitle">{totalSteps} easy steps</p>
        </div>
      </header>

      {/* Step indicator */}
      <div className="step-track">
        {Array.from({ length: totalSteps }, (_, i) => (
          <Fragment key={i}>
            <div className={`step-dot${stepIndex > i + 1 ? ' done' : stepIndex === i + 1 ? ' active' : ''}`}>
              {stepIndex > i + 1
                ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                : i + 1}
            </div>
            {i < totalSteps - 1 && <div className={`step-line${stepIndex > i + 1 ? ' done' : ''}`} />}
          </Fragment>
        ))}
      </div>

      {/* Step 0: Find patient */}
      {step === 0 && (
        <div className="book-card">
          <p className="book-card-title">Find patient</p>
          <p className="book-card-sub">Type phone number to see if they are already saved.</p>
          <div className="form-field" style={{ marginTop: 16 }}>
            <label className="form-label">Phone number</label>
            <div className="search-field-row">
              <input
                className="form-input"
                type="tel"
                inputMode="numeric"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="10 digit number"
                onKeyDown={(e) => { if (e.key === 'Enter') searchPatient(); }}
                autoFocus
              />
              <button type="button" className="btn btn-primary" onClick={searchPatient} disabled={searching || searchPhone.replace(/\D/g,'').length < 6}>
                {searching ? '…' : <Search size={15} />}
              </button>
            </div>
          </div>

          {foundPatient && (
            <div className="found-patient-card">
              <div className="found-patient-ava" style={{ background: ava(foundPatient.name)[1], color: ava(foundPatient.name)[0] }}>
                {foundPatient.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div className="found-patient-name">{foundPatient.name}</div>
                <div className="found-patient-meta">{foundPatient.phone} · {foundPatient.isReturning ? 'Returning patient' : 'Already saved'}</div>
                {foundPatient.chiefComplaint && <div className="found-patient-meta" style={{ color: 'var(--brand)' }}>{foundPatient.chiefComplaint}</div>}
              </div>
              <button type="button" className="quick-action-btn" onClick={() => setFoundPatient(null)} title="Clear"><X size={13}/></button>
            </div>
          )}

          <div className="form-actions" style={{ marginTop: 16 }}>
            {foundPatient ? (
              <button type="button" className="btn btn-primary btn-block" onClick={() => setStep(2)}>
                Continue with {foundPatient.name}
              </button>
            ) : (
              <button type="button" className="btn btn-ghost btn-block" onClick={() => { setPhone(searchPhone); setStep(1); }}>
                Add as new patient
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 1: New patient info */}
      {step === 1 && (
        <div className="book-card">
          <p className="book-card-title">New patient</p>
          <div className="form-field">
            <label className="form-label">Full name</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Patient name" autoFocus />
          </div>
          <div className="form-field">
            <label className="form-label">Phone number</label>
            <input className="form-input" type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" />
          </div>
          <div className="form-field">
            <label className="form-label" style={{ fontWeight: 500 }}>Age <span style={{ color: 'var(--muted)' }}>(if you know)</span></label>
            <input className="form-input" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 32" inputMode="numeric" />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>Back</button>
            <button type="button" className="btn btn-primary" style={{ flex: 1 }} disabled={!step1Valid} onClick={() => setStep(2)}>
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Treatment */}
      {step === 2 && (
        <div className="book-card">
          <p className="book-card-title">What is the visit for?</p>
          {foundPatient && (
            <div className="found-patient-card" style={{ marginBottom: 16 }}>
              <div className="found-patient-ava" style={{ background: ava(foundPatient.name)[1], color: ava(foundPatient.name)[0] }}>
                {foundPatient.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="found-patient-name">{foundPatient.name}</div>
                <div className="found-patient-meta">{foundPatient.phone}</div>
              </div>
            </div>
          )}
          <div className="form-field">
            <label className="form-label"><Stethoscope size={12} /> Pick one</label>
            <div className="service-grid">
              {SERVICES.map((s) => (
                <button key={s} type="button" className={`service-chip${service === s ? ' selected' : ''}`} onClick={() => setService(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="form-field">
            <label className="form-label" style={{ fontWeight: 500 }}>Problem <span style={{ color: 'var(--muted)' }}>(if you know)</span></label>
            <input className="form-input" value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} placeholder="e.g. tooth pain" />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={goBackFromTreatment}>Back</button>
            <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(3)}>Next</button>
          </div>
        </div>
      )}

      {/* Step 3: Date & time */}
      {step === 3 && (
        <div className="book-card">
          <p className="book-card-title">Date and time</p>
          <div className="form-field">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Time</label>
            <div className="time-grid">
              {TIME_SLOTS.map((t) => (
                <button key={t} type="button" className={`time-chip${time === t ? ' selected' : ''}`} onClick={() => setTime(t)}>
                  {fmtSlot(t)}
                </button>
              ))}
            </div>
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
            <button type="button" className="btn btn-primary" style={{ flex: 1 }} disabled={loading} onClick={submit}>
              {loading ? 'Saving…' : 'Book now'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
