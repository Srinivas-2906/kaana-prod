import { useState } from 'react';
import { Phone, MessageSquare, ChevronRight, Banknote, MoreVertical } from 'lucide-react';
import type { Appointment, AppointmentStatus } from '../types';
import { STATUS_LABELS } from '../types';
import { updateAppointment } from '../lib/api';
import { CompleteVisitDialog } from './CompleteVisitDialog';
import { AppointmentActionsDialog } from './AppointmentActionsDialog';

/* ─── Board column config ─────────────────────────────────────── */
export const BOARD_COLUMNS: {
  statuses: AppointmentStatus[];
  label: string;
  hint: string;
  color: string;
  empty: string;
}[] = [
  { statuses: ['requested'],            label: 'Not confirmed',      hint: 'Need to confirm',     color: '#d97706', empty: 'No one here' },
  { statuses: ['confirmed'],            label: 'Confirmed',          hint: 'Expected today',      color: '#1565C0', empty: 'No one here' },
  { statuses: ['arrived'],              label: 'In clinic',          hint: 'With the doctor',     color: '#7c3aed', empty: 'No one here' },
  { statuses: ['visited'],              label: 'Completed',          hint: 'Visit done today',    color: '#16a34a', empty: 'No completed visits yet' },
  { statuses: ['cancelled', 'no_show'], label: 'Cancelled / No-show', hint: 'Not coming today',    color: '#64748b', empty: 'Nothing here' },
];

const NEXT: Partial<Record<AppointmentStatus, AppointmentStatus>> = {
  requested: 'confirmed',
  confirmed: 'arrived',
  arrived:   'visited',
};

const ADVANCE_LABEL: Partial<Record<AppointmentStatus, string>> = {
  requested: 'Confirm',
  confirmed: 'Arrived',
  arrived:   'Complete',
};

const PALETTES: [string, string][] = [
  ['#1565C0','#e3f0fd'],['#0369a1','#e0f2fe'],['#7c3aed','#f5f3ff'],
  ['#059669','#ecfdf5'],['#b45309','#fef3c7'],['#be185d','#fce7f3'],['#0f766e','#ccfbf1'],
];
function ava(name: string): [string, string] { return PALETTES[name.charCodeAt(0) % PALETTES.length]; }

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

interface Props {
  appointments: Appointment[];
  onRefresh: () => void;
  onOpenPatient: (patientId: string) => void;
  onToast: (msg: string, type?: 'ok' | 'err') => void;
}

function BoardCard({
  appt,
  onAdvance,
  onOpenPatient,
  onActions,
}: {
  appt: Appointment;
  onAdvance: (a: Appointment) => void;
  onOpenPatient: (id: string) => void;
  onActions: (a: Appointment) => void;
}) {
  const name = appt.patientName || 'Patient';
  const [fg, bg] = ava(name);
  const phone = appt.patientPhone?.replace(/\D/g, '') || '';
  const next = NEXT[appt.status];

  return (
    <div className="board-card">
      <div className="board-card-top">
        <span className="board-card-time">{fmtTime(appt.scheduledAt)}</span>
        {appt.source === 'WhatsApp' && <span className="tag tag-wa tag-xs">WA</span>}
      </div>

      <button type="button" className="board-card-patient" onClick={() => onOpenPatient(appt.patientId)}>
        <div className="board-card-ava" style={{ background: bg, color: fg }}>
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="board-card-info">
          <span className="board-card-name">{name}</span>
          <span className="board-card-svc">{appt.service || 'Check-up'}</span>
          {appt.paymentAmount != null && appt.paymentAmount > 0 && (
            <span className="board-card-payment">
              <Banknote size={10} /> ₹{appt.paymentAmount.toLocaleString('en-IN')}
              {appt.paymentMethod ? ` · ${appt.paymentMethod}` : ''}
            </span>
          )}
        </div>
        <ChevronRight size={14} className="board-card-chevron" />
      </button>

      {(phone || next) && (
        <div className="board-card-foot">
          {phone && (
            <div className="board-card-contact">
              <a href={`tel:+91${phone}`} className="quick-action-btn" title="Call" onClick={(e) => e.stopPropagation()}>
                <Phone size={12} />
              </a>
              <a href={`https://wa.me/91${phone}`} target="_blank" rel="noreferrer" className="quick-action-btn quick-action-wa" title="WhatsApp" onClick={(e) => e.stopPropagation()}>
                <MessageSquare size={12} />
              </a>
            </div>
          )}
          <button type="button" className="quick-action-btn" title="Actions" onClick={() => onActions(appt)}>
            <MoreVertical size={14} />
          </button>
          {next && (
            <button type="button" className="board-card-advance" onClick={() => onAdvance(appt)}>
              {ADVANCE_LABEL[appt.status]}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function AppointmentBoard({ appointments, onRefresh, onOpenPatient, onToast }: Props) {
  const [completeAppt, setCompleteAppt] = useState<Appointment | null>(null);
  const [actionsAppt, setActionsAppt] = useState<Appointment | null>(null);

  async function advance(appt: Appointment) {
    const next = NEXT[appt.status];
    if (!next) return;
    if (next === 'visited') {
      setCompleteAppt(appt);
      return;
    }
    try {
      await updateAppointment(appt.id, { status: next });
      onRefresh();
      onToast(`${appt.patientName || 'Patient'} is now ${STATUS_LABELS[next].toLowerCase()}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not save';
      onToast(msg.includes('API server') ? msg : 'Could not save — is the API running on port 3002?', 'err');
    }
  }

  return (
    <div className="board-wrap">
      <p className="board-hint">
        Tap the button on each card to move the patient to the next step.
      </p>

      <div className="board-scroll">
        {BOARD_COLUMNS.map((col) => {
          const colAppts = appointments
            .filter((a) => col.statuses.includes(a.status))
            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

          return (
            <div key={col.label} className="board-col">
              <div className="board-col-head" style={{ borderTopColor: col.color }}>
                <div className="board-col-title">
                  <span className="board-col-dot" style={{ background: col.color }} />
                  <span style={{ color: col.color }}>{col.label}</span>
                </div>
                <span className="board-col-count">{colAppts.length}</span>
              </div>
              <p className="board-col-hint">{col.hint}</p>

              <div className="board-col-cards">
                {colAppts.length === 0 ? (
                  <div className="board-col-empty">{col.empty}</div>
                ) : (
                  colAppts.map((appt) => (
                    <BoardCard
                      key={appt.id}
                      appt={appt}
                      onAdvance={advance}
                      onOpenPatient={onOpenPatient}
                      onActions={(a) => setActionsAppt(a)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {completeAppt && (
        <CompleteVisitDialog
          appointment={completeAppt}
          onClose={() => setCompleteAppt(null)}
          onDone={() => { setCompleteAppt(null); onRefresh(); }}
          onToast={onToast}
        />
      )}

      {actionsAppt && (
        <AppointmentActionsDialog
          appointment={actionsAppt}
          onClose={() => setActionsAppt(null)}
          onDone={() => { setActionsAppt(null); onRefresh(); }}
          onToast={onToast}
        />
      )}
    </div>
  );
}
