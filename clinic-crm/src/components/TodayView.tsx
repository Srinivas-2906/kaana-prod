import { useState } from 'react';
import { RefreshCw, Phone, MessageSquare, Sunrise, Sunset, LayoutList, Columns3 } from 'lucide-react';
import type { Appointment, AppointmentStatus } from '../types';
import { STATUS_LABELS } from '../types';
import { updateAppointment } from '../lib/api';
import { AppointmentBoard } from './AppointmentBoard';

type TodayViewMode = 'list' | 'board';

const PALETTES: [string, string][] = [
  ['#1565C0','#e3f0fd'],['#0369a1','#e0f2fe'],['#7c3aed','#f5f3ff'],
  ['#059669','#ecfdf5'],['#b45309','#fef3c7'],['#be185d','#fce7f3'],['#0f766e','#ccfbf1'],
];
function ava(name: string): [string, string] { return PALETTES[name.charCodeAt(0) % PALETTES.length]; }

function splitTime(iso: string) {
  const t = new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();
  const parts = t.split(' ');
  return { hm: parts[0], ampm: parts[1] ?? '' };
}

function dateHeader(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
}

const NEXT: Partial<Record<AppointmentStatus, AppointmentStatus>> = {
  requested: 'confirmed', confirmed: 'arrived', arrived: 'visited',
};

const ACTION_LABEL: Partial<Record<AppointmentStatus, string>> = {
  requested: 'Confirm',
  confirmed: 'Arrived',
  arrived:   'Complete',
};

const ACTION_CLASS: Partial<Record<AppointmentStatus, string>> = {
  requested: 'action-btn action-confirm',
  confirmed: 'action-btn action-arrived',
  arrived:   'action-btn action-done',
};

const TAG_CLASS: Record<AppointmentStatus, string> = {
  requested:'tag tag-warning', confirmed:'tag tag-brand', arrived:'tag tag-purple',
  visited:'tag tag-success',   cancelled:'tag tag-muted', no_show:'tag tag-muted',
};

interface Props {
  appointments: Appointment[];
  stats: { unconfirmed: number; confirmed: number; arrived: number; total: number };
  onRefresh: () => void;
  onOpenPatient: (patientId: string) => void;
  onGoToBook: () => void;
  onToast: (msg: string, type?: 'ok' | 'err') => void;
}

export function TodayView({ appointments, stats, onRefresh, onOpenPatient, onGoToBook, onToast }: Props) {
  const [viewMode, setViewMode] = useState<TodayViewMode>('board');
  const today = appointments.length ? dateHeader(appointments[0].scheduledAt) : dateHeader(new Date().toISOString());

  async function advance(appt: Appointment) {
    const next = NEXT[appt.status];
    if (!next) return;
    try {
      await updateAppointment(appt.id, { status: next });
      onRefresh();
      onToast(`${appt.patientName || 'Patient'} is now ${STATUS_LABELS[next].toLowerCase()}`);
    } catch { onToast('Could not save', 'err'); }
  }

  const sorted = [...appointments].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  );

  // Group into sessions
  const morning = sorted.filter(a => new Date(a.scheduledAt).getHours() < 14);
  const evening = sorted.filter(a => new Date(a.scheduledAt).getHours() >= 14);

  function AppointmentCard({ appt }: { appt: Appointment }) {
    const { hm, ampm } = splitTime(appt.scheduledAt);
    const name = appt.patientName || 'Patient';
    const [fg, bg] = ava(name);
    const phone = appt.patientPhone?.replace(/\D/g, '') || '';

    return (
      <li className={`appt-card status-${appt.status}`}>
        <div className="appt-left-bar" />
        <div className="appt-body">
          <div className="appt-time-col">
            <span className="appt-time">{hm}</span>
            <span className="appt-ampm">{ampm}</span>
          </div>
          <div className="appt-divider" />
          <div className="appt-avatar" style={{ background: bg, color: fg }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="appt-info">
            <button type="button" className="appt-name" onClick={() => appt.patientId && onOpenPatient(appt.patientId)}>
              {name}
            </button>
            <p className="appt-treatment">{appt.service || 'Check-up'}</p>
            <div className="appt-tags">
              <span className={TAG_CLASS[appt.status]}>{STATUS_LABELS[appt.status]}</span>
              {appt.source === 'WhatsApp' && <span className="tag tag-wa"><MessageSquare size={9}/> WA</span>}
            </div>
          </div>
          <div className="appt-action-col">
            {/* Quick contact actions */}
            {phone && (
              <div className="quick-contact">
                <a href={`tel:+91${phone}`} className="quick-action-btn" title={`Call ${name}`}>
                  <Phone size={12} />
                </a>
                <a href={`https://wa.me/91${phone}`} target="_blank" rel="noreferrer" className="quick-action-btn quick-action-wa" title="WhatsApp">
                  <MessageSquare size={12} />
                </a>
              </div>
            )}
            {NEXT[appt.status] && (
              <button type="button" className={ACTION_CLASS[appt.status]} onClick={() => advance(appt)}>
                {ACTION_LABEL[appt.status]}
              </button>
            )}
          </div>
        </div>
      </li>
    );
  }

  function SessionBlock({ label, icon, appts, emptyMsg }: {
    label: string; icon: React.ReactNode; appts: Appointment[]; emptyMsg: string;
  }) {
    return (
      <div className="session-block">
        <div className="session-header">
          {icon}
          <span className="session-label">{label}</span>
          <span className="session-count">{appts.length}</span>
        </div>
        {appts.length === 0 ? (
          <p className="session-empty">{emptyMsg}</p>
        ) : (
          <>
            <div className="appt-list-header" aria-hidden="true">
              <span>Time</span>
              <span>Patient</span>
              <span>What for</span>
              <span>Status</span>
              <span></span>
            </div>
            <ul className="appt-list appt-with-header">
              {appts.map(a => <AppointmentCard key={a.id} appt={a} />)}
            </ul>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="view today-view">
      <header className="page-header">
        <div>
          <p className="eyebrow">Today</p>
          <h1 className="page-title">{today}</h1>
          <p className="page-subtitle">{stats.total} appointment{stats.total !== 1 ? 's' : ''} today</p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="icon-btn" onClick={onRefresh} aria-label="Refresh">
            <RefreshCw size={15} />
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="stat-strip">
        <div className="stat-card">
          <div className="stat-icon amber">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
          </div>
          <div className="stat-val">{stats.unconfirmed}</div>
          <div className="stat-lbl">Need confirm</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <div className="stat-val">{stats.confirmed}</div>
          <div className="stat-lbl">Confirmed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <div className="stat-val">{stats.arrived}</div>
          <div className="stat-lbl">In clinic</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          </div>
          <div className="stat-val">{stats.total}</div>
          <div className="stat-lbl">Total</div>
        </div>
      </div>

      {/* List / Board toggle */}
      {sorted.length > 0 && (
        <div className="view-toggle" role="tablist" aria-label="Schedule view">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'board'}
            className={`view-toggle-btn${viewMode === 'board' ? ' active' : ''}`}
            onClick={() => setViewMode('board')}
          >
            <Columns3 size={15} /> Board
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'list'}
            className={`view-toggle-btn${viewMode === 'list' ? ' active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <LayoutList size={15} /> List
          </button>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          </div>
          <h2>No appointments today</h2>
          <p>No one is booked yet. Add a walk-in from Book, or wait for WhatsApp bookings.</p>
          <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={onGoToBook}>
            Book appointment
          </button>
        </div>
      ) : viewMode === 'board' ? (
        <AppointmentBoard
          appointments={sorted}
          onRefresh={onRefresh}
          onOpenPatient={onOpenPatient}
          onToast={onToast}
        />
      ) : (
        <>
          <SessionBlock
            label="Morning · 10 AM to 1 PM"
            icon={<Sunrise size={14} color="var(--warning)" />}
            appts={morning}
            emptyMsg="No one in the morning slot"
          />
          {evening.length > 0 && (
            <SessionBlock
              label="Evening · 5 PM to 9 PM"
              icon={<Sunset size={14} color="var(--brand)" />}
              appts={evening}
              emptyMsg="No one in the evening slot"
            />
          )}
        </>
      )}
    </div>
  );
}
