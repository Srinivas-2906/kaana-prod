import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { LoginGate } from './components/LoginGate';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { OverviewTab } from './components/OverviewTab';
import { TodayView } from './components/TodayView';
import { PatientsView } from './components/PatientsView';
import { PatientDetail, BookView } from './components/PatientDetail';
import { Toaster } from './components/Toaster';
import { fetchToday, fetchPatients, fetchPatient, fetchClient } from './lib/api';
import type { Patient, TabId, TodayStats, ToastMsg } from './types';
import './styles.css';

const PAGE_TITLES: Record<TabId, { title: string; sub: string }> = {
  overview:  { title: 'Home',      sub: 'See what is happening today' },
  today:     { title: 'Today',     sub: 'All appointments for today' },
  patients:  { title: 'Patients',  sub: 'Find and open patient details' },
  book:      { title: 'Book',      sub: 'Add a new appointment' },
};

function ClinicApp() {
  const [tab,           setTab]           = useState<TabId>('overview');
  const [collapsed,     setCollapsed]     = useState(false);
  const [today,         setToday]         = useState<TodayStats | null>(null);
  const [patients,      setPatients]      = useState<Patient[]>([]);
  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const [patientDetail, setPatientDetail] = useState<{ patient: Patient; appointments: import('./types').Appointment[] } | null>(null);
  const [clinicName,    setClinicName]    = useState('Denta Care Dental Clinic');
  const [toasts,        setToasts]        = useState<ToastMsg[]>([]);
  const [prefillPt,     setPrefillPt]     = useState<Patient | null>(null);

  /* ── Toast ── */
  function toast(text: string, type: 'ok' | 'err' = 'ok') {
    const id = Date.now();
    setToasts(ts => [...ts, { id, text, type }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3500);
  }
  function dismissToast(id: number) { setToasts(ts => ts.filter(t => t.id !== id)); }

  /* ── Data loaders ── */
  const loadToday = useCallback(async () => {
    try { setToday(await fetchToday()); } catch { /* offline */ }
  }, []);

  const loadPatients = useCallback(async (search?: string) => {
    try { setPatients(await fetchPatients(search)); } catch { /* offline */ }
  }, []);

  const loadPatientDetail = useCallback(async (id: string) => {
    try {
      const data = await fetchPatient(id);
      setPatientDetail(data);
      setSelectedId(id);
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    loadToday();
    loadPatients();
    fetchClient().then((c) => { if (c.name) setClinicName(c.name); }).catch(() => {});
    const id = setInterval(loadToday, 15000);
    return () => clearInterval(id);
  }, [loadToday, loadPatients]);

  /* ── Navigation helpers ── */
  async function handleOpenPatient(id: string) {
    if (!id) {
      toast('Patient record not linked to this booking', 'err');
      return;
    }
    const ok = await loadPatientDetail(id);
    if (!ok) toast('Could not load patient', 'err');
  }

  function handleTabChange(t: TabId) {
    setTab(t);
    setSelectedId(null);
    setPatientDetail(null);
    setPrefillPt(null);
  }

  function handleBooked() {
    loadToday();
    loadPatients();
    setTab('today');
    setPrefillPt(null);
  }

  function handleBookFollowup(patient: Patient) {
    setPrefillPt(patient);
    setSelectedId(null);
    setPatientDetail(null);
    setTab('book');
  }

  function handleCancelBookPrefill() {
    const pt = prefillPt;
    setPrefillPt(null);
    if (pt) {
      setTab('patients');
      loadPatientDetail(pt.id);
    } else {
      setTab('book');
    }
  }

  const pageInfo = PAGE_TITLES[tab];
  const isPatientOpen = Boolean(selectedId && patientDetail);

  return (
    <div className="clinic-app">
      {/* Sidebar — desktop */}
      <Sidebar
        active={isPatientOpen ? 'patients' : tab}
        collapsed={collapsed}
        onChange={handleTabChange}
        onToggle={() => setCollapsed(c => !c)}
      />

      <div className={`clinic-main${isPatientOpen ? ' patient-detail-open' : ''}`}>
        {/* Mobile top bar */}
        <div className={`top-bar${isPatientOpen ? ' top-bar-patient' : ''}`}>
          {isPatientOpen ? (
            <>
              <button
                type="button"
                className="top-bar-back"
                onClick={() => { setSelectedId(null); setPatientDetail(null); }}
                aria-label="Back"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <div className="top-bar-text">
                <span className="top-bar-name">{patientDetail!.patient.name}</span>
                <span className="top-bar-sub">{patientDetail!.patient.phone}</span>
              </div>
            </>
          ) : (
            <div className="top-bar-brand">
              <div className="top-bar-logo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3c-1.2 0-2.4.6-3 1.5C8.4 5.4 8 7 8 8.5c0 1.5.4 3 .8 4.5.4 1.5.5 3 .5 4 0 1 .4 2 1.2 2s1.2-1.3 1.5-3c.3 1.7.7 3 1.5 3s1.2-1 1.2-2c0-1 .1-2.5.5-4 .4-1.5.8-3 .8-4.5 0-1.5-.4-3.1-1-4C15.4 3.6 13.2 3 12 3z"/>
                </svg>
              </div>
              <div className="top-bar-text">
                <span className="top-bar-name">Denta Care</span>
                <span className="top-bar-sub">Dr. D. Ajit · Visakhapatnam</span>
              </div>
            </div>
          )}
          {!isPatientOpen && <div className="top-bar-avatar" title="Dr. D. Ajit">DA</div>}
        </div>

        {/* Desktop topbar */}
        <div className="desktop-topbar">
          <div className="desktop-topbar-title">
            <h2>{isPatientOpen ? patientDetail!.patient.name : pageInfo.title}</h2>
            <p>{isPatientOpen ? `Patient · ${clinicName}` : pageInfo.sub}</p>
          </div>
          <div className="desktop-topbar-right">
            {(tab === 'today' || tab === 'overview') && !isPatientOpen && (
              <button type="button" className="icon-btn" onClick={loadToday} aria-label="Refresh">
                <RefreshCw size={15} />
              </button>
            )}
            <div className="dt-avatar" title="Dr. D. Ajit">DA</div>
          </div>
        </div>

        {/* Content */}
        <main className={`main-content${isPatientOpen ? ' no-bottom-nav' : ''}`}>
          {isPatientOpen ? (
            <PatientDetail
              patient={patientDetail!.patient}
              appointments={patientDetail!.appointments}
              onBack={() => { setSelectedId(null); setPatientDetail(null); }}
              onUpdated={() => loadPatientDetail(selectedId!)}
              onToast={toast}
              onBookFollowup={handleBookFollowup}
            />
          ) : tab === 'overview' ? (
            <OverviewTab
              today={today}
              totalPatients={patients.length}
              onGoToToday={() => handleTabChange('today')}
              onGoToBook={() => handleTabChange('book')}
              onOpenPatient={handleOpenPatient}
              onToast={toast}
              onRefresh={loadToday}
            />
          ) : tab === 'today' ? (
            <TodayView
              appointments={today?.appointments ?? []}
              stats={{
                unconfirmed: today?.unconfirmed ?? 0,
                confirmed:   today?.confirmed   ?? 0,
                arrived:     today?.arrived     ?? 0,
                total:       today?.total       ?? 0,
              }}
              onRefresh={loadToday}
              onOpenPatient={handleOpenPatient}
              onGoToBook={() => handleTabChange('book')}
              onToast={toast}
            />
          ) : tab === 'patients' ? (
            <PatientsView
              patients={patients}
              onSearch={loadPatients}
              onSelect={loadPatientDetail}
            />
          ) : (
            <BookView
              onBooked={handleBooked}
              onToast={toast}
              prefillPatient={prefillPt}
              onCancelPrefill={prefillPt ? handleCancelBookPrefill : undefined}
            />
          )}
        </main>

        {/* Mobile bottom nav */}
        {!isPatientOpen && <BottomNav active={tab} onChange={handleTabChange} />}
      </div>

      {/* Toast notifications */}
      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <LoginGate>
      <ClinicApp />
    </LoginGate>
  );
}
