import { useMemo, useState, useEffect } from 'react';
import { LayoutGrid, LayoutList, Search, UserX, Phone, Users, UserPlus, Plus, Banknote, ChevronRight } from 'lucide-react';
import type { Patient } from '../types';
import { PatientFormDialog } from './PatientFormDialog';
import { RecordPaymentDialog } from './RecordPaymentDialog';

const PALETTES: [string, string][] = [
  ['#1565C0', '#e3f0fd'], ['#0369a1', '#e0f2fe'], ['#7c3aed', '#f5f3ff'],
  ['#059669', '#ecfdf5'], ['#b45309', '#fef3c7'], ['#be185d', '#fce7f3'], ['#0f766e', '#ccfbf1'],
];
function ava(name: string): [string, string] {
  return PALETTES[name.charCodeAt(0) % PALETTES.length];
}

function fmtPhone(phone: string) {
  const d = phone.replace(/\D/g, '');
  if (d.length === 10) return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
  if (d.length === 12 && d.startsWith('91')) return `+91 ${d.slice(2, 7)} ${d.slice(7)}`;
  return phone;
}

function fmtVisit(iso?: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

type FilterId = 'all' | 'returning' | 'new';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all',       label: 'All' },
  { id: 'returning', label: 'Returning' },
  { id: 'new',       label: 'New' },
];

interface Props {
  patients: Patient[];
  onSearch: (q?: string) => void;
  onSelect: (id: string) => void;
  onToast: (msg: string, type?: 'ok' | 'err') => void;
  onPatientSaved: () => void;
  onPaymentRecorded: () => void;
}

function paymentSummary(p: Patient) {
  if (p.totalPaid != null && p.totalPaid > 0) {
    return { label: `Paid · ₹${p.totalPaid.toLocaleString('en-IN')}`, hasHistory: true };
  }
  if (p.lastPaymentAmount != null && p.lastPaymentAmount > 0) {
    return { label: `Last · ₹${p.lastPaymentAmount.toLocaleString('en-IN')}`, hasHistory: true };
  }
  return { label: null, hasHistory: false };
}

export function PatientsView({ patients, onSearch, onSelect, onToast, onPatientSaved, onPaymentRecorded }: Props) {
  const [query,  setQuery]  = useState('');
  const [filter, setFilter] = useState<FilterId>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [payPatient, setPayPatient] = useState<Patient | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>(() => {
    const saved = window.localStorage.getItem('clinicPatientsView');
    if (saved === 'list' || saved === 'cards') return saved;
    return window.matchMedia('(max-width: 767px)').matches ? 'list' : 'cards';
  });

  useEffect(() => {
    window.localStorage.setItem('clinicPatientsView', viewMode);
  }, [viewMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query.trim() || undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const filtered = useMemo(() => {
    let list = [...patients];
    if (filter === 'returning') list = list.filter((p) => p.isReturning);
    if (filter === 'new')       list = list.filter((p) => !p.isReturning && !p.lastVisit);
    list.sort((a, b) => a.name.localeCompare(b.name, 'en-IN'));
    return list;
  }, [patients, filter]);

  const counts = useMemo(() => ({
    all:       patients.length,
    returning: patients.filter((p) => p.isReturning).length,
    new:       patients.filter((p) => !p.isReturning && !p.lastVisit).length,
  }), [patients]);

  function handleSearch(value: string) {
    setQuery(value);
  }

  return (
    <div className="view patients-view">
      <header className="page-header">
        <div>
          <p className="eyebrow">Patients</p>
          <h1 className="page-title">All patients</h1>
          <p className="page-subtitle">
            Showing {filtered.length} of {patients.length}
          </p>
        </div>
        <div className="page-header-actions">
          <div className="view-toggle" role="tablist" aria-label="Patients view">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'cards'}
              className={`view-toggle-btn${viewMode === 'cards' ? ' active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Card view"
            >
              <LayoutGrid size={15} /> Cards
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'list'}
              className={`view-toggle-btn${viewMode === 'list' ? ' active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <LayoutList size={15} /> List
            </button>
          </div>
          <button type="button" className="btn btn-primary add-patient-btn" onClick={() => setShowAdd(true)}>
            <Plus size={15} /> Add patient
          </button>
        </div>
      </header>

      <div className="patients-summary">
        <div className="patients-summary-item">
          <Users size={14} />
          <span><strong>{patients.length}</strong> total</span>
        </div>
        <div className="patients-summary-item">
          <span className="dot dot-green" />
          <span><strong>{counts.returning}</strong> returning</span>
        </div>
        <div className="patients-summary-item">
          <UserPlus size={14} />
          <span><strong>{counts.new}</strong> new</span>
        </div>
      </div>

      <div className="search-wrap">
        <span className="search-icon"><Search size={15} /></span>
        <input
          type="search"
          className="search-input"
          placeholder="Search name, phone, email, age, problem, source, notes…"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <div className="filter-chips">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`filter-chip${filter === f.id ? ' active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            <span className="filter-chip-count">{counts[f.id]}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><UserX size={28} strokeWidth={1.5} /></div>
          <h2>{query || filter !== 'all' ? 'No patients found' : 'No patients yet'}</h2>
          <p>
            {query
              ? 'Try another keyword — name, phone, email, problem, source, or notes.'
              : 'Add your first patient, or they will show up after a WhatsApp booking.'}
          </p>
          {!query && filter === 'all' && (
            <button type="button" className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => setShowAdd(true)}>
              <Plus size={15} /> Add patient
            </button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        <div className="patient-grid">
          {filtered.map((p) => {
            const [fg, bg] = ava(p.name);
            const visit = fmtVisit(p.lastVisit);
            const recordsCount = p.recordUrls?.length || (p.prescriptionUrl || p.photoUrl ? 1 : 0);
            const pay = paymentSummary(p);
            return (
              <div
                key={p.id}
                className="patient-card patient-card-compact"
                role="button"
                tabIndex={0}
                onClick={() => onSelect(p.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(p.id);
                  }
                }}
              >
                <div className="patient-card-head">
                  <div className="patient-card-ava" style={{ background: bg, color: fg }}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="patient-card-head-text">
                    <span className="patient-card-name">{p.name}</span>
                    <span className="patient-card-phone"><Phone size={11} /> {fmtPhone(p.phone)}</span>
                  </div>
                  <button
                    type="button"
                    className="patient-card-pay"
                    title="Record payment"
                    aria-label={`Record payment for ${p.name}`}
                    onClick={(e) => { e.stopPropagation(); setPayPatient(p); }}
                  >
                    <Banknote size={14} />
                  </button>
                </div>
                <div className="patient-card-meta">
                  {p.isReturning && <span className="patient-meta-pill tag-success">Returning</span>}
                  {!p.isReturning && !p.lastVisit && <span className="patient-meta-pill tag-brand">New</span>}
                  {p.chiefComplaint && <span className="patient-complaint-pill">{p.chiefComplaint}</span>}
                  {recordsCount > 0 && <span className="patient-meta-pill">Records · {recordsCount}</span>}
                  {pay.label && (
                    <span className="patient-payment-pill">
                      <Banknote size={10} /> {pay.label}
                    </span>
                  )}
                  {p.source && <span className="patient-meta-pill">{p.source}</span>}
                </div>
                <span className="patient-card-visit">{visit ? `Last visit · ${visit}` : 'Never visited'}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="patient-table panel">
          <div className="patient-table-header">
            <span>Name</span>
            <span>Phone</span>
            <span>Last visit</span>
            <span></span>
          </div>
          <ul className="patient-table-body">
            {filtered.map((p) => {
              const [fg, bg] = ava(p.name);
              const visit = fmtVisit(p.lastVisit);
              const recordsCount = p.recordUrls?.length || (p.prescriptionUrl || p.photoUrl ? 1 : 0);
              const pay = paymentSummary(p);
              return (
                <li key={p.id}>
                  <div
                    className="patient-row"
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelect(p.id);
                      }
                    }}
                  >
                    <div className="patient-cell patient-cell-name">
                      <div className="patient-avatar" style={{ background: bg, color: fg }}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="patient-name-wrap">
                        <span className="patient-name">{p.name}</span>
                        <div className="patient-row-meta">
                          {p.chiefComplaint && <span className="patient-complaint-pill">{p.chiefComplaint}</span>}
                          {recordsCount > 0 && <span className="patient-meta-pill">Records · {recordsCount}</span>}
                          {pay.label && (
                            <span className="patient-payment-pill">
                              <Banknote size={10} /> {pay.label}
                            </span>
                          )}
                          {p.source && <span className="patient-meta-pill">{p.source}</span>}
                        </div>
                        <div className="patient-mobile-meta">
                          <span className="patient-mobile-phone"><Phone size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} /> {fmtPhone(p.phone)}</span>
                          <span className="patient-mobile-visit">{visit ? `Last visit · ${visit}` : 'Never visited'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="patient-cell patient-cell-phone">{fmtPhone(p.phone)}</div>
                    <div className="patient-cell patient-cell-visit">
                      <span className="patient-visit-date">{visit || '—'}</span>
                    </div>
                    <div className="patient-cell patient-cell-action">
                      <button
                        type="button"
                        className="patient-row-pay"
                        title="Record payment"
                        aria-label={`Record payment for ${p.name}`}
                        onClick={(e) => { e.stopPropagation(); setPayPatient(p); }}
                      >
                        <Banknote size={14} />
                      </button>
                      <ChevronRight size={16} className="patient-chevron" />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Mobile FAB */}
      <button type="button" className="fab" onClick={() => setShowAdd(true)} aria-label="Add patient">
        <Plus size={22} />
      </button>

      {showAdd && (
        <PatientFormDialog
          onClose={() => setShowAdd(false)}
          onToast={onToast}
          onSaved={() => { setShowAdd(false); onPatientSaved(); }}
        />
      )}

      {payPatient && (
        <RecordPaymentDialog
          patients={patients}
          prefillPatientId={payPatient.id}
          onClose={() => setPayPatient(null)}
          onSaved={onPaymentRecorded}
          onToast={onToast}
        />
      )}
    </div>
  );
}
