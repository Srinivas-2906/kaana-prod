import { useState, useEffect, Fragment, useMemo } from 'react';
import { ChevronLeft, MessageSquare, UserCheck, Clock, FileText, PlusCircle, Phone, Stethoscope, Search, X, Pencil, Banknote } from 'lucide-react';
import type { Appointment, Patient, Payment } from '../types';
import { STATUS_LABELS } from '../types';
import type { CatalogItem } from '../types';
import { updatePatient, updateAppointment, createPatient, createAppointment, fetchPatients, fetchAvailableSlots, fetchCatalog, fetchPatientPayments } from '../lib/api';
import { PatientFormDialog } from './PatientFormDialog';
import { RecordPaymentDialog } from './RecordPaymentDialog';
import {
  formatPhone10,
  isValidAge,
  isValidPatientName,
  isValidPhone10,
  sanitizeAge,
  sanitizePhoneDigits,
} from '../lib/patientInput';

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
  const [showEdit, setShowEdit] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [fg, bg] = ava(patient.name);
  const phone = patient.phone.replace(/\D/g, '');
  const chatUrl = `${INBOX}?thread=wa-${phone}`;

  const visited = appointments
    .filter((a) => a.status === 'visited')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  const nowTs = Date.now();
  const upcomingSorted = appointments
    .filter((a) => a.status === 'confirmed' || a.status === 'arrived' || a.status === 'requested')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  // "Next visit" should be future-only; past-but-not-completed is shown as "Overdue".
  const nextAppt = upcomingSorted.find((a) => new Date(a.scheduledAt).getTime() >= nowTs) || null;
  const overdueAppt = upcomingSorted.find((a) => new Date(a.scheduledAt).getTime() < nowTs) || null;
  const lastVisit = visited[0] || null;

  useEffect(() => {
    let alive = true;
    fetchPatientPayments(patient.id)
      .then((data) => { if (alive) setPayments(data.payments || []); })
      .catch(() => { if (alive) setPayments([]); });
    return () => { alive = false; };
  }, [patient.id]);

  function refreshPayments() {
    onUpdated();
    fetchPatientPayments(patient.id)
      .then((data) => setPayments(data.payments || []))
      .catch(() => setPayments([]));
  }

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
          <button type="button" className="quick-action-btn quick-action-light" title="Edit" onClick={() => setShowEdit(true)}><Pencil size={14} /></button>
          {phone && <a href={`tel:+91${phone}`} className="quick-action-btn quick-action-light" title="Call"><Phone size={14} /></a>}
          {phone && <a href={`https://wa.me/91${phone}`} target="_blank" rel="noreferrer" className="quick-action-btn quick-action-wa" title="WhatsApp"><MessageSquare size={14} /></a>}
        </div>
      </div>

      {showEdit && (
        <PatientFormDialog
          patient={patient}
          onClose={() => setShowEdit(false)}
          onToast={onToast}
          onSaved={() => { setShowEdit(false); onUpdated(); }}
        />
      )}

      {showPay && (
        <RecordPaymentDialog
          patients={[patient]}
          prefillPatientId={patient.id}
          onClose={() => setShowPay(false)}
          onSaved={refreshPayments}
          onToast={onToast}
        />
      )}

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
                      {nextAppt ? (
                        new Date(nextAppt.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                      ) : overdueAppt ? (
                        <>Overdue · {new Date(overdueAppt.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</>
                      ) : (
                        'None'
                      )}
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

            {/* Payments */}
            <div className="panel">
              <div className="panel-head">
                <Banknote size={14} color="var(--brand)" />
                <span className="panel-title">Payments</span>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowPay(true)}>
                  + Record
                </button>
              </div>
              <div className="panel-body">
                <div className="patient-payment-summary">
                  <div className="patient-payment-stat">
                    <span className="patient-payment-stat-label">Total paid</span>
                    <strong>{patient.totalPaid ? `₹${patient.totalPaid.toLocaleString('en-IN')}` : '—'}</strong>
                  </div>
                  <div className="patient-payment-stat">
                    <span className="patient-payment-stat-label">Last payment</span>
                    <strong>
                      {patient.lastPaymentAmount != null && patient.lastPaymentAmount > 0
                        ? `₹${patient.lastPaymentAmount.toLocaleString('en-IN')}`
                        : '—'}
                    </strong>
                  </div>
                </div>
                {payments.length === 0 ? (
                  <p className="muted" style={{ marginTop: 12 }}>No payments recorded yet.</p>
                ) : (
                  <ul className="payment-list patient-payment-list">
                    {payments.map((pay) => (
                      <li key={pay.id} className="payment-row payment-row-static">
                        <div>
                          <strong>₹{pay.amount.toLocaleString('en-IN')} · {pay.method}</strong>
                          {pay.notes && <span>{pay.notes}</span>}
                          {pay.reference && <span className="ref">{pay.reference}</span>}
                        </div>
                        <small>{pay.createdAt ? new Date(pay.createdAt).toLocaleDateString('en-IN') : ''}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Reference images (records) */}
            {(() => {
              const urls = (patient.recordUrls && patient.recordUrls.length > 0)
                ? patient.recordUrls
                : (patient.prescriptionUrl || patient.photoUrl)
                  ? [patient.prescriptionUrl || patient.photoUrl]
                  : [];
              if (!urls.length) return null;
              return (
                <div className="panel">
                  <div className="panel-head">
                    <FileText size={14} color="var(--brand)" />
                    <span className="panel-title">Records</span>
                    <span className="muted" style={{ fontSize: 12 }}>{urls.length}</span>
                  </div>
                  <div className="panel-body">
                    <div className="record-grid">
                      {urls.map((u, i) => (
                        <a key={`${u}-${i}`} className="record-thumb" href={u} target="_blank" rel="noreferrer">
                          <img src={u} alt={`Record ${i + 1}`} />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {overdueAppt && (
              <div className="panel">
                <div className="panel-head">
                  <Clock size={14} color="var(--brand)" />
                  <span className="panel-title">Overdue appointment</span>
                  <span className={TAG_CLASS[overdueAppt.status]}>{STATUS_LABELS[overdueAppt.status]}</span>
                </div>
                <div className="panel-body">
                  <div className="info-grid">
                    <dl className="info-item">
                      <dt>When</dt>
                      <dd>{new Date(overdueAppt.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</dd>
                    </dl>
                    <dl className="info-item">
                      <dt>What for</dt>
                      <dd>{overdueAppt.service}</dd>
                    </dl>
                  </div>
                  {overdueAppt.status === 'requested' && (
                    <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={() => confirmAppt(overdueAppt.id)}>
                      Confirm booking
                    </button>
                  )}
                </div>
              </div>
            )}

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

type BookStep = 'lookup' | 'patient' | 'treatment' | 'schedule';

function fmtSlot(t: string) {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function bookSteps(prefill: boolean, existing: boolean): BookStep[] {
  if (prefill) return ['treatment', 'schedule'];
  if (existing) return ['lookup', 'treatment', 'schedule'];
  return ['lookup', 'patient', 'treatment', 'schedule'];
}

export function BookView({ onBooked, onToast, prefillPatient, onCancelPrefill }: BookProps) {
  const [step, setStep] = useState<BookStep>(prefillPatient ? 'treatment' : 'lookup');
  const [searchPhone, setSearchPhone] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundPatient, setFoundPatient] = useState<Patient | null>(prefillPatient || null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [service, setService] = useState('');
  const [serviceId, setServiceId] = useState<string>('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('10:00');
  const [slotLabels, setSlotLabels] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const steps = bookSteps(Boolean(prefillPatient), Boolean(foundPatient && step !== 'patient'));
  const stepIndex = Math.max(0, steps.indexOf(step)) + 1;

  useEffect(() => {
    if (prefillPatient) {
      setFoundPatient(prefillPatient);
      setStep('treatment');
      setSearchPhone('');
      setError('');
    }
  }, [prefillPatient]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  useEffect(() => {
    let alive = true;
    fetchCatalog()
      .then((d: any) => {
        if (!alive) return;
        const items: CatalogItem[] = Array.isArray(d) ? d : (d?.items || []);
        const clean = (items || [])
          .filter((it) => it && it.title)
          .map((it: any) => ({
            ...it,
            // normalize server fields if present
            priceNum: it.priceNum ?? it.price_num ?? it.priceNum,
            imageUrl: it.imageUrl ?? it.image_url ?? it.imageUrl,
          }));
        setCatalogItems(clean);
        if (clean.length > 0) {
          setService(clean[0].title);
          setServiceId(clean[0].id);
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const servicesList = useMemo(() => {
    // Canonical: the tenant catalog is the source of truth.
    // If catalog is empty/unavailable, allow a custom text service entry instead of silently drifting.
    const items = catalogItems.filter((it: any) => {
      if (!it || !it.title) return false;
      const s = String((it as any).status || '').toLowerCase();
      if (!s) return true;
      return !['inactive', 'disabled', 'archived'].includes(s);
    });
    return items;
  }, [catalogItems]);

  const selectedCatalog = useMemo(() => {
    if (!serviceId) return null;
    return servicesList.find((s) => s.id === serviceId) || null;
  }, [servicesList, serviceId]);

  useEffect(() => {
    let alive = true;
    setLoadingSlots(true);
    fetchAvailableSlots(date)
      .then((d) => {
        if (!alive) return;
        const labels = d?.slots || [];
        setSlotLabels(labels);
        // If time isn't in suggestions, set first suggested time
        if (labels.length > 0) {
          const t = parseSlotLabel(labels[0]);
          if (t) setTime(t);
        }
      })
      .catch(() => { if (alive) setSlotLabels([]); })
      .finally(() => { if (alive) setLoadingSlots(false); });
    return () => { alive = false; };
  }, [date]);

  const patientDetailsValid =
    isValidPatientName(name) && isValidPhone10(phone) && isValidAge(age);

  const returningAgeValid = foundPatient
    ? (foundPatient.age != null && foundPatient.age > 0) || isValidAge(age)
    : true;

  async function searchPatient() {
    const digits = sanitizePhoneDigits(searchPhone);
    if (digits.length < 6) return;
    setSearching(true);
    setError('');
    try {
      const results = await fetchPatients(digits);
      if (results.length > 0) {
        setFoundPatient(results[0]);
        setAge(results[0].age != null ? String(results[0].age) : '');
      } else {
        setFoundPatient(null);
        setPhone(digits);
        setStep('patient');
      }
    } catch {
      setFoundPatient(null);
      setError('Could not search patients. Try again.');
    } finally {
      setSearching(false);
    }
  }

  function goToTreatment() {
    if (foundPatient) {
      setStep('treatment');
      return;
    }
    setPhone(sanitizePhoneDigits(searchPhone));
    setStep('patient');
  }

  async function submit() {
    if (!returningAgeValid) {
      setError('Age is required');
      onToast('Add patient age to continue', 'err');
      return;
    }
    setLoading(true);
    setError('');
    try {
      let patient: Patient;
      if (foundPatient) {
        if ((foundPatient.age == null || foundPatient.age <= 0) && isValidAge(age)) {
          patient = await updatePatient(foundPatient.id, { age: Number(age) });
        } else {
          patient = foundPatient;
        }
      } else {
        patient = await createPatient({
          name: name.trim(),
          phone: formatPhone10(phone),
          age: Number(age),
          chiefComplaint: chiefComplaint || service,
          source: 'Walk-in',
        });
      }
      await createAppointment({
        patientId: patient.id,
        service,
        serviceId: serviceId || undefined,
        scheduledAt: `${date}T${time}:00`,
        status: 'confirmed',
        source: 'Walk-in',
      });
      onToast(`Booked for ${patient.name}`);
      setStep('lookup');
      setName('');
      setPhone('');
      setAge('');
      setFoundPatient(null);
      setSearchPhone('');
      setChiefComplaint('');
      onBooked();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not book. Try again.';
      setError(msg);
      onToast(msg, 'err');
    } finally {
      setLoading(false);
    }
  }

  function goBackFromTreatment() {
    if (prefillPatient && onCancelPrefill) {
      onCancelPrefill();
      return;
    }
    if (foundPatient && !prefillPatient) {
      setStep('lookup');
      return;
    }
    setStep('patient');
  }

  return (
    <div className="view book-view">
      <header className="page-header">
        <div>
          <p className="eyebrow">Book</p>
          <h1 className="page-title">New booking</h1>
          <p className="page-subtitle">{steps.length} easy steps</p>
        </div>
      </header>

      <div className="step-track">
        {steps.map((s, i) => (
          <Fragment key={s}>
            <div className={`step-dot${stepIndex > i + 1 ? ' done' : stepIndex === i + 1 ? ' active' : ''}`}>
              {stepIndex > i + 1
                ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                : i + 1}
            </div>
            {i < steps.length - 1 && <div className={`step-line${stepIndex > i + 1 ? ' done' : ''}`} />}
          </Fragment>
        ))}
      </div>

      {step === 'lookup' && (
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
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                value={searchPhone}
                onChange={(e) => setSearchPhone(sanitizePhoneDigits(e.target.value))}
                placeholder="10 digit number"
                maxLength={10}
                onKeyDown={(e) => { if (e.key === 'Enter') searchPatient(); }}
                autoFocus
              />
              <button type="button" className="btn btn-primary" onClick={searchPatient} disabled={searching || sanitizePhoneDigits(searchPhone).length < 6}>
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
              <button type="button" className="btn btn-primary btn-block" onClick={() => setStep('treatment')}>
                Continue with {foundPatient.name}
              </button>
            ) : (
              <button type="button" className="btn btn-ghost btn-block" onClick={goToTreatment}>
                Add as new patient
              </button>
            )}
          </div>
        </div>
      )}

      {step === 'patient' && (
        <div className="book-card">
          <p className="book-card-title">New patient</p>
          <div className="form-field">
            <label className="form-label">Full name</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Patient name" autoFocus />
          </div>
          <div className="form-field">
            <label className="form-label">Phone number</label>
            <input
              className="form-input"
              type="tel"
              inputMode="numeric"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              value={phone}
              onChange={(e) => setPhone(sanitizePhoneDigits(e.target.value))}
              placeholder="10-digit mobile"
              maxLength={10}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Age</label>
            <input
              className="form-input"
              value={age}
              onChange={(e) => setAge(sanitizeAge(e.target.value))}
              placeholder="e.g. 32"
              inputMode="numeric"
              maxLength={3}
              required
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setStep('lookup')}>Back</button>
            <button type="button" className="btn btn-primary" style={{ flex: 1 }} disabled={!patientDetailsValid} onClick={() => setStep('treatment')}>
              Next
            </button>
          </div>
        </div>
      )}

      {step === 'treatment' && (
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
          {foundPatient && (foundPatient.age == null || foundPatient.age <= 0) && (
            <div className="form-field">
              <label className="form-label">Age</label>
              <input
                className="form-input"
                value={age}
                onChange={(e) => setAge(sanitizeAge(e.target.value))}
                placeholder="Required for this patient"
                inputMode="numeric"
                maxLength={3}
              />
            </div>
          )}
          <div className="form-field">
            <label className="form-label"><Stethoscope size={12} /> Pick one</label>
            {servicesList.length > 0 ? (
              <>
                <div className="service-grid">
                  {servicesList.map((s) => {
                    const priceLabel = (s.price && String(s.price).trim()) || (s.priceNum && s.priceNum > 0 ? `₹${Number(s.priceNum).toLocaleString('en-IN')}` : '');
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className={`service-chip${serviceId === s.id ? ' selected' : ''}`}
                        onClick={() => { setService(s.title); setServiceId(s.id); }}
                        title={priceLabel ? `${s.title} · ${priceLabel}` : s.title}
                      >
                        <span className="service-chip-title">{s.title}</span>
                        {(priceLabel || s.category) && (
                          <span className="service-chip-sub">
                            {priceLabel ? priceLabel : ''}
                            {priceLabel && s.category ? ' · ' : ''}
                            {s.category ? s.category : ''}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedCatalog?.subtitle && (
                  <p className="form-hint" style={{ marginTop: 10 }}>
                    {selectedCatalog.subtitle}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="form-hint" style={{ marginTop: 0 }}>
                  No services are configured for this clinic yet. Type the visit reason below for now.
                </p>
                <input
                  className="form-input"
                  value={service}
                  onChange={(e) => { setService(e.target.value); setServiceId(''); }}
                  placeholder="e.g. Consultation / RCT / Cleaning"
                />
              </>
            )}
          </div>
          <div className="form-field">
            <label className="form-label" style={{ fontWeight: 500 }}>Problem <span style={{ color: 'var(--muted)' }}>(if you know)</span></label>
            <input className="form-input" value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} placeholder="e.g. tooth pain" />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={goBackFromTreatment}>Back</button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={!returningAgeValid || !service.trim()}
              onClick={() => setStep('schedule')}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 'schedule' && (
        <div className="book-card">
          <p className="book-card-title">Date and time</p>
          <div className="form-field">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Time</label>
            <div style={{ display: 'grid', gap: 10 }}>
              {loadingSlots && <p className="form-hint" style={{ marginTop: 0 }}>Loading available slots…</p>}
              {slotLabels.length > 0 ? (
                <div className="time-grid">
                  {slotLabels.map((label) => {
                    const t = parseSlotLabel(label);
                    if (!t) return null;
                    return (
                      <button key={label} type="button" className={`time-chip${time === t ? ' selected' : ''}`} onClick={() => setTime(t)}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="time-grid">
                  {['10:00','10:30','11:00','11:30','12:00','12:30','17:00','17:30','18:00','18:30','19:00','19:30'].map((t) => (
                    <button key={t} type="button" className={`time-chip${time === t ? ' selected' : ''}`} onClick={() => setTime(t)}>
                      {fmtSlot(t)}
                    </button>
                  ))}
                </div>
              )}
              <div className="form-field" style={{ marginTop: 4 }}>
                <label className="form-label" style={{ fontWeight: 500 }}>Custom time <span style={{ color: 'var(--muted)' }}>(optional)</span></label>
                <input type="time" className="form-input" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setStep('treatment')}>Back</button>
            <button type="button" className="btn btn-primary" style={{ flex: 1 }} disabled={loading} onClick={submit}>
              {loading ? 'Saving…' : 'Book now'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
