import { useMemo, useState } from 'react';
import { Search, ChevronRight, UserX, Phone, Users, UserPlus } from 'lucide-react';
import type { Patient } from '../types';

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
  onSearch: (q: string) => void;
  onSelect: (id: string) => void;
}

export function PatientsView({ patients, onSearch, onSelect }: Props) {
  const [query,  setQuery]  = useState('');
  const [filter, setFilter] = useState<FilterId>('all');

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
    onSearch(value);
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
          placeholder="Search by name or phone…"
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
              ? 'Try another name or phone number.'
              : 'Patients show up after WhatsApp booking or when you book a walk-in.'}
          </p>
        </div>
      ) : (
        <div className="patient-table panel">
          <div className="patient-table-header">
            <span>Patient</span>
            <span>Phone</span>
            <span>Problem</span>
            <span>Last visit</span>
            <span aria-hidden="true" />
          </div>

          <ul className="patient-table-body">
            {filtered.map((p) => {
              const [fg, bg] = ava(p.name);
              const visit = fmtVisit(p.lastVisit);
              return (
                <li key={p.id}>
                  <button type="button" className="patient-row" onClick={() => onSelect(p.id)}>
                    <div className="patient-cell patient-cell-name">
                      <div className="patient-avatar" style={{ background: bg, color: fg }}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="patient-name-wrap">
                        <span className="patient-name">{p.name}</span>
                        <span className="patient-row-meta">
                          {p.source && <span className="patient-source">{p.source}</span>}
                          {p.isReturning && <span className="tag tag-success tag-xs">Returning</span>}
                          {!p.isReturning && !p.lastVisit && <span className="tag tag-brand tag-xs">New</span>}
                        </span>
                        <div className="patient-mobile-meta">
                          <span className="patient-mobile-phone">{fmtPhone(p.phone)}</span>
                          {p.chiefComplaint && (
                            <span className="patient-complaint-pill">{p.chiefComplaint}</span>
                          )}
                          <span className="patient-mobile-visit">
                            {visit ? `Last visit · ${visit}` : 'Never visited'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="patient-cell patient-cell-phone">
                      <Phone size={12} className="patient-cell-icon" />
                      <span>{fmtPhone(p.phone)}</span>
                    </div>

                    <div className="patient-cell patient-cell-complaint">
                      {p.chiefComplaint ? (
                        <span className="patient-complaint-pill">{p.chiefComplaint}</span>
                      ) : (
                        <span className="patient-cell-empty">—</span>
                      )}
                    </div>

                    <div className="patient-cell patient-cell-visit">
                      {visit ? (
                        <span className="patient-visit-date">{visit}</span>
                      ) : (
                        <span className="patient-cell-empty">Never</span>
                      )}
                    </div>

                    <div className="patient-cell patient-cell-action">
                      <ChevronRight size={16} className="patient-chevron" />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
