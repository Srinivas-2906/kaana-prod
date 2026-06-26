import { CalendarCheck, Users, AlertCircle, Phone, MessageSquare, CalendarPlus, Activity, ChevronRight } from 'lucide-react';
import type { Appointment, AppointmentStatus, TodayStats } from '../types';
import { STATUS_LABELS } from '../types';
import { updateAppointment } from '../lib/api';

const PALETTES: [string, string][] = [
  ['#1565C0','#e3f0fd'],['#0369a1','#e0f2fe'],['#7c3aed','#f5f3ff'],
  ['#059669','#ecfdf5'],['#b45309','#fef3c7'],['#be185d','#fce7f3'],['#0f766e','#ccfbf1'],
];
function ava(name: string): [string, string] { return PALETTES[name.charCodeAt(0) % PALETTES.length]; }

const TAG_CLASS: Record<AppointmentStatus, string> = {
  requested:'tag tag-warning', confirmed:'tag tag-brand', arrived:'tag tag-purple',
  visited:'tag tag-success',   cancelled:'tag tag-muted', no_show:'tag tag-muted',
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function todayDate() {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
}

interface Props {
  today: TodayStats | null;
  totalPatients: number;
  onGoToToday: () => void;
  onGoToBook: () => void;
  onOpenPatient: (id: string) => void;
  onToast: (msg: string, type?: 'ok' | 'err') => void;
  onRefresh: () => void;
}

export function OverviewTab({ today, totalPatients, onGoToToday, onGoToBook, onOpenPatient, onToast, onRefresh }: Props) {
  const appts = today?.appointments ?? [];
  const upcoming = [...appts]
    .filter(a => a.status !== 'visited' && a.status !== 'cancelled' && a.status !== 'no_show')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 5);

  async function advance(appt: Appointment, next: AppointmentStatus) {
    try {
      await updateAppointment(appt.id, { status: next });
      onRefresh();
      onToast(next === 'confirmed' ? `${appt.patientName} confirmed` : `${appt.patientName} is now ${STATUS_LABELS[next].toLowerCase()}`);
    } catch { onToast('Could not save', 'err'); }
  }

  return (
    <div className="view overview-view">
      {/* Greeting */}
      <div className="overview-greeting">
        <div>
          <h1 className="overview-greeting-title">{greeting()}, Dr. Ajit</h1>
          <p className="overview-greeting-sub">{todayDate()}</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={onGoToBook} style={{ flexShrink: 0 }}>
          <CalendarPlus size={13} /> Book
        </button>
      </div>

      {/* Alert banner — pending confirmations */}
      {(today?.unconfirmed ?? 0) > 0 && (
        <button type="button" className="alert-banner" onClick={onGoToToday}>
          <span className="alert-banner-icon"><AlertCircle size={16} /></span>
          <span className="alert-banner-text">
            <strong>{today!.unconfirmed} booking{today!.unconfirmed > 1 ? 's' : ''} need confirmation</strong>
            <span> — please call or WhatsApp the patient</span>
          </span>
          <ChevronRight size={15} className="alert-banner-chevron" />
        </button>
      )}

      {/* Stats grid */}
      <div className="stat-strip">
        <div className="stat-card">
          <div className="stat-icon blue"><CalendarCheck size={16} /></div>
          <div className="stat-val">{today?.total ?? 0}</div>
          <div className="stat-lbl">Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><Activity size={16} /></div>
          <div className="stat-val">{today?.unconfirmed ?? 0}</div>
          <div className="stat-lbl">Need confirm</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Users size={16} /></div>
          <div className="stat-val">{totalPatients}</div>
          <div className="stat-lbl">All patients</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="stat-val">{today?.arrived ?? 0}</div>
          <div className="stat-lbl">In clinic now</div>
        </div>
      </div>

      {/* Today's queue */}
      <div className="overview-section">
        <div className="section-hd">
          <div>
            <p className="section-hd-title">Next up today</p>
            <p className="section-hd-sub">{upcoming.length} waiting</p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onGoToToday}>
            See all <ChevronRight size={12} />
          </button>
        </div>

        {upcoming.length === 0 ? (
          <div className="overview-empty-row">
            <CalendarCheck size={18} color="var(--muted)" />
            <span>No one booked for later today.</span>
            <button type="button" className="btn btn-primary btn-sm" onClick={onGoToBook}>Book now</button>
          </div>
        ) : (
          <div className="panel" style={{ overflow: 'hidden' }}>
            {upcoming.map((appt) => {
              const name = appt.patientName || 'Patient';
              const [fg, bg] = ava(name);
              const phone = appt.patientPhone?.replace(/\D/g, '') || '';
              return (
                <div key={appt.id} className="overview-appt-row">
                  <span className="overview-appt-time">{fmtTime(appt.scheduledAt)}</span>
                  <div className="overview-appt-ava" style={{ background: bg, color: fg }}>
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overview-appt-info">
                    <button type="button" className="overview-appt-name" onClick={() => appt.patientId && onOpenPatient(appt.patientId)}>
                      {name}
                    </button>
                    <span className="overview-appt-svc">{appt.service || 'Check-up'}</span>
                  </div>
                  <span className={TAG_CLASS[appt.status]}>{STATUS_LABELS[appt.status]}</span>
                  <div className="overview-appt-actions">
                    {phone && (
                      <a href={`tel:+91${phone}`} className="quick-action-btn" title="Call patient">
                        <Phone size={13} />
                      </a>
                    )}
                    {phone && (
                      <a href={`https://wa.me/91${phone}`} target="_blank" rel="noreferrer" className="quick-action-btn quick-action-wa" title="WhatsApp">
                        <MessageSquare size={13} />
                      </a>
                    )}
                    {appt.status === 'requested' && (
                      <button type="button" className="action-btn action-confirm" onClick={() => advance(appt, 'confirmed')}>
                        Confirm
                      </button>
                    )}
                    {appt.status === 'confirmed' && (
                      <button type="button" className="action-btn action-arrived" onClick={() => advance(appt, 'arrived')}>
                        Arrived
                      </button>
                    )}
                    {appt.status === 'arrived' && (
                      <button type="button" className="action-btn action-done" onClick={() => advance(appt, 'visited')}>
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="overview-section">
        <p className="section-hd-title" style={{ marginBottom: 12 }}>Quick links</p>
        <div className="quick-cards-grid">
          <button type="button" className="quick-card" onClick={onGoToBook}>
            <div className="quick-card-icon blue"><CalendarPlus size={20} /></div>
            <span className="quick-card-label">Book</span>
            <span className="quick-card-sub">Walk-in or phone</span>
          </button>
          <button type="button" className="quick-card" onClick={onGoToToday}>
            <div className="quick-card-icon green"><CalendarCheck size={20} /></div>
            <span className="quick-card-label">Today</span>
            <span className="quick-card-sub">See all appointments</span>
          </button>
        </div>
      </div>
    </div>
  );
}
