import { useMemo, useState } from 'react';
import { BarChart3, CalendarDays, Download, Printer, RefreshCw, Share2, Users } from 'lucide-react';
import type { Appointment, Patient, Payment, TodayStats } from '../types';
import { STATUS_LABELS } from '../types';

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function startOfMonth(d: Date) {
  const x = new Date(d);
  x.setDate(1);
  return x;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function formatRs(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function safeDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isFinite(d.getTime()) ? d : null;
}

function downloadCsv(filename: string, rows: (string | number | null | undefined)[][]) {
  const escape = (v: unknown) => {
    const s = String(v ?? '');
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const csv = rows.map((r) => r.map(escape).join(',')).join('\n') + '\n';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function openPrintWindow(title: string, htmlBody: string) {
  const w = window.open('', '_blank', 'noopener,noreferrer');
  if (!w) return;
  w.document.open();
  w.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${title}</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 24px; color: #0f172a; }
      h1 { font-size: 18px; margin: 0 0 10px; }
      .sub { color:#475569; margin: 0 0 16px; font-size: 12px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border: 1px solid #e2e8f0; padding: 8px; font-size: 12px; text-align: left; }
      th { background: #f8fafc; }
      .muted { color:#64748b; }
      @media print { body { margin: 10mm; } }
    </style>
  </head>
  <body>
    ${htmlBody}
    <script>setTimeout(()=>{ window.print(); }, 50);</script>
  </body>
</html>`);
  w.document.close();
}

function groupCount<T>(items: T[], keyFn: (t: T) => string) {
  const m = new Map<string, number>();
  items.forEach((it) => {
    const k = keyFn(it) || '—';
    m.set(k, (m.get(k) || 0) + 1);
  });
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

function groupSum<T>(items: T[], keyFn: (t: T) => string, valFn: (t: T) => number) {
  const m = new Map<string, number>();
  items.forEach((it) => {
    const k = keyFn(it) || '—';
    m.set(k, (m.get(k) || 0) + (valFn(it) || 0));
  });
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

export function ReportsView({
  from,
  to,
  report,
  today,
  patients,
  onChangeRange,
  onRefresh,
  onOpenPatient,
  onGoToToday,
  onToast,
}: {
  from: string;
  to: string;
  report: null | { from: string; to: string; appointments: Appointment[]; payments: Payment[]; summary: { todayTotal: number; monthTotal: number; dueCount: number; total?: number } };
  today: TodayStats | null;
  patients: Patient[];
  onChangeRange: (from: string, to: string) => void;
  onRefresh: () => void;
  onOpenPatient: (id: string) => void;
  onGoToToday: () => void;
  onToast: (msg: string, type?: 'ok' | 'err') => void;
}) {
  const [customFrom, setCustomFrom] = useState(from);
  const [customTo, setCustomTo] = useState(to);

  const appointments = report?.appointments ?? [];
  const payments = report?.payments ?? [];

  const totals = useMemo(() => {
    const totalAppts = appointments.length;
    const byStatus = new Map<string, number>();
    appointments.forEach((a) => byStatus.set(a.status, (byStatus.get(a.status) || 0) + 1));
    const completed = byStatus.get('visited') || 0;
    const requested = byStatus.get('requested') || 0;
    const confirmed = byStatus.get('confirmed') || 0;
    const arrived = byStatus.get('arrived') || 0;
    const cancelled = byStatus.get('cancelled') || 0;
    const noShow = byStatus.get('no_show') || 0;

    const collectionsTotal = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    return { totalAppts, completed, requested, confirmed, arrived, cancelled, noShow, collectionsTotal };
  }, [appointments, payments]);

  const byMethod = useMemo(
    () => groupSum(payments, (p) => (p.method || 'Other').toUpperCase(), (p) => p.amount || 0).slice(0, 8),
    [payments],
  );
  const byService = useMemo(
    () => groupCount(appointments, (a) => a.service || 'Visit').slice(0, 8),
    [appointments],
  );
  const bySource = useMemo(
    () => groupCount(appointments, (a) => a.source || 'Unknown').slice(0, 8),
    [appointments],
  );
  const byDoctor = useMemo(
    () => groupCount(appointments, (a) => a.assignedDoctor || '—').slice(0, 8),
    [appointments],
  );

  const peakHours = useMemo(() => {
    const hours = appointments.map((a) => new Date(a.scheduledAt).getHours());
    const m = new Map<number, number>();
    hours.forEach((h) => m.set(h, (m.get(h) || 0) + 1));
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([h, c]) => ({
        label: `${h % 12 || 12} ${h >= 12 ? 'PM' : 'AM'}`,
        count: c,
      }));
  }, [appointments]);

  const newPatientsInRange = useMemo(() => {
    const fromTs = safeDate(`${from}T00:00:00`)?.getTime() ?? 0;
    const toTs = (safeDate(`${to}T23:59:59`)?.getTime() ?? 0) || Date.now();
    return patients.filter((p) => {
      const d = safeDate(p.createdAt);
      if (!d) return false;
      const ts = d.getTime();
      return ts >= fromTs && ts <= toTs;
    }).length;
  }, [patients, from, to]);

  const recall = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 180);
    const cutoffTs = cutoff.getTime();
    return [...patients]
      .filter((p) => {
        const d = safeDate(p.lastVisit || undefined);
        if (!d) return true; // never visited
        return d.getTime() < cutoffTs;
      })
      .sort((a, b) => {
        const da = safeDate(a.lastVisit || undefined)?.getTime() ?? 0;
        const db = safeDate(b.lastVisit || undefined)?.getTime() ?? 0;
        return da - db;
      })
      .slice(0, 25);
  }, [patients]);

  function setPreset(days: number) {
    const t = isoDate(new Date());
    const f = isoDate(daysAgo(days - 1));
    onChangeRange(f, t);
    setCustomFrom(f);
    setCustomTo(t);
  }

  function setThisMonth() {
    const t = isoDate(new Date());
    const f = isoDate(startOfMonth(new Date()));
    onChangeRange(f, t);
    setCustomFrom(f);
    setCustomTo(t);
  }

  function applyCustomRange() {
    if (!customFrom || !customTo) return;
    if (customFrom > customTo) {
      onToast('From date must be before To date', 'err');
      return;
    }
    onChangeRange(customFrom, customTo);
  }

  function exportPaymentsCsv() {
    downloadCsv(`payments_${from}_to_${to}.csv`, [
      ['Date', 'Patient', 'Amount', 'Method', 'Reference', 'Notes'],
      ...payments.map((p) => [
        p.createdAt ? new Date(p.createdAt).toLocaleString('en-IN') : '',
        p.patientName || '',
        p.amount,
        p.method || '',
        p.reference || '',
        p.notes || '',
      ]),
    ]);
    onToast('Payments CSV downloaded');
  }

  function exportAppointmentsCsv() {
    downloadCsv(`appointments_${from}_to_${to}.csv`, [
      ['Scheduled at', 'Patient', 'Phone', 'Service', 'Status', 'Source'],
      ...appointments.map((a) => [
        new Date(a.scheduledAt).toLocaleString('en-IN'),
        a.patientName || '',
        a.patientPhone || '',
        a.service || '',
        a.status,
        a.source || '',
      ]),
    ]);
    onToast('Appointments CSV downloaded');
  }

  function shareSummary() {
    const text =
      `Clinic summary (${from} → ${to})\n` +
      `Appointments: ${totals.totalAppts} (Done ${totals.completed})\n` +
      `Pending: Requested ${totals.requested}, Confirmed ${totals.confirmed}, In-clinic ${totals.arrived}\n` +
      `No-show: ${totals.noShow}, Cancelled: ${totals.cancelled}\n` +
      `Collections: ${formatRs(totals.collectionsTotal)}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noreferrer');
  }

  function printTodaySheet() {
    const appts = today?.appointments ?? [];
    const rows = appts
      .slice()
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .map((a) => ({
        time: new Date(a.scheduledAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }),
        patient: a.patientName || 'Patient',
        phone: a.patientPhone || '',
        service: a.service || '',
        status: STATUS_LABELS[a.status],
      }));
    const html = `
      <h1>Today sheet</h1>
      <p class="sub">Date: ${today?.date || isoDate(new Date())} · Total: ${appts.length}</p>
      <table>
        <thead><tr><th>Time</th><th>Patient</th><th>Phone</th><th>Service</th><th>Status</th></tr></thead>
        <tbody>
          ${rows.map((r) => `<tr><td>${r.time}</td><td>${r.patient}</td><td>${r.phone}</td><td>${r.service}</td><td>${r.status}</td></tr>`).join('')}
        </tbody>
      </table>
      <p class="muted">Generated from clinic CRM</p>
    `;
    openPrintWindow('Today sheet', html);
  }

  return (
    <div className="view reports-view">
      <header className="page-header">
        <div>
          <p className="eyebrow">Reports</p>
          <h1 className="page-title">Clinic reports</h1>
          <p className="page-subtitle">Pick a range, export CSV, print daily sheet, and share summary</p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="icon-btn" onClick={onRefresh} aria-label="Refresh">
            <RefreshCw size={15} />
          </button>
        </div>
      </header>

      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-body" style={{ display: 'grid', gap: 10 }}>
          <div className="report-presets">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPreset(7)}>Last 7 days</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPreset(30)}>Last 30 days</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={setThisMonth}>This month</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onGoToToday}><CalendarDays size={12} /> Today</button>
          </div>

          <div className="report-range">
            <div className="form-field">
              <label className="form-label">From</label>
              <input type="date" className="form-input" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label">To</label>
              <input type="date" className="form-input" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
            </div>
            <div className="form-field" style={{ alignSelf: 'end' }}>
              <button type="button" className="btn btn-primary btn-sm" onClick={applyCustomRange}>Apply</button>
            </div>
          </div>

          <div className="report-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={exportPaymentsCsv}><Download size={12} /> Payments CSV</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={exportAppointmentsCsv}><Download size={12} /> Appointments CSV</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={printTodaySheet}><Printer size={12} /> Print today</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={shareSummary}><Share2 size={12} /> Share summary</button>
          </div>
        </div>
      </div>

      <div className="stat-strip">
        <div className="stat-card">
          <div className="stat-icon blue"><BarChart3 size={16} /></div>
          <div className="stat-val">{totals.totalAppts}</div>
          <div className="stat-lbl">Appointments</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><BarChart3 size={16} /></div>
          <div className="stat-val">{totals.completed}</div>
          <div className="stat-lbl">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><BarChart3 size={16} /></div>
          <div className="stat-val">{formatRs(totals.collectionsTotal)}</div>
          <div className="stat-lbl">Collections</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Users size={16} /></div>
          <div className="stat-val">{recall.length}</div>
          <div className="stat-lbl">Recall (6m)</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <BarChart3 size={14} color="var(--brand)" />
          <span className="panel-title">Breakdown</span>
        </div>
        <div className="panel-body report-breakdown">
          <div>
            <p className="section-hd-title">Appointment funnel</p>
            <ul className="report-list">
              <li><span>Requested</span><strong>{totals.requested}</strong></li>
              <li><span>Confirmed</span><strong>{totals.confirmed}</strong></li>
              <li><span>In clinic</span><strong>{totals.arrived}</strong></li>
              <li><span>No-show</span><strong>{totals.noShow}</strong></li>
              <li><span>Cancelled</span><strong>{totals.cancelled}</strong></li>
              <li><span>New patients</span><strong>{newPatientsInRange}</strong></li>
            </ul>
          </div>
          <div>
            <p className="section-hd-title">Collections by method</p>
            {byMethod.length === 0 ? (
              <p className="muted">No payments in this range.</p>
            ) : (
              <ul className="report-list">
                {byMethod.map(([k, v]) => (
                  <li key={k}><span>{k}</span><strong>{formatRs(v)}</strong></li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="section-hd-title">Top services</p>
            {byService.length === 0 ? (
              <p className="muted">No appointments in this range.</p>
            ) : (
              <ul className="report-list">
                {byService.map(([k, v]) => (
                  <li key={k}><span>{k}</span><strong>{v}</strong></li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="section-hd-title">Top sources</p>
            {bySource.length === 0 ? (
              <p className="muted">No appointments in this range.</p>
            ) : (
              <ul className="report-list">
                {bySource.map(([k, v]) => (
                  <li key={k}><span>{k}</span><strong>{v}</strong></li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="section-hd-title">Doctors</p>
            {byDoctor.length === 0 ? (
              <p className="muted">No appointments in this range.</p>
            ) : (
              <ul className="report-list">
                {byDoctor.map(([k, v]) => (
                  <li key={k}><span>{k}</span><strong>{v}</strong></li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="section-hd-title">Peak hours</p>
            {peakHours.length === 0 ? (
              <p className="muted">No appointments in this range.</p>
            ) : (
              <ul className="report-list">
                {peakHours.map((h) => (
                  <li key={h.label}><span>{h.label}</span><strong>{h.count}</strong></li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="panel-head">
          <Users size={14} color="var(--brand)" />
          <span className="panel-title">Recall list</span>
          <span className="muted" style={{ fontSize: 12 }}>Not visited in 6 months (or never)</span>
        </div>
        <div className="panel-body">
          {recall.length === 0 ? (
            <p className="muted">No recall patients right now.</p>
          ) : (
            <ul className="payment-list">
              {recall.map((p) => (
                <li key={p.id}>
                  <button type="button" className="payment-row payment-row-btn" onClick={() => onOpenPatient(p.id)}>
                    <div style={{ minWidth: 0 }}>
                      <strong>{p.name}</strong>
                      <span>{p.phone}{p.lastVisit ? ` · last visit ${new Date(p.lastVisit).toLocaleDateString('en-IN')}` : ' · never visited'}</span>
                    </div>
                    <div className="payment-row-end">
                      <small className="muted">Open</small>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

