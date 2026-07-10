import { useCallback, useEffect, useRef, useState } from 'react';
import { LogOut, RefreshCw, Search } from 'lucide-react';
import { LoginGate } from './components/LoginGate';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { OverviewTab } from './components/OverviewTab';
import { TodayView } from './components/TodayView';
import { PatientsView } from './components/PatientsView';
import { PatientDetail, BookView } from './components/PatientDetail';
import { Toaster } from './components/Toaster';
import { PaymentsView } from './components/PaymentsView';
import { GlobalSearchDialog } from './components/GlobalSearchDialog';
import { useKeyboardOpen } from './hooks/useKeyboardOpen';
import { fetchToday, fetchPatients, fetchPatient, fetchClient, fetchPayments, fetchMe } from './lib/api';
import { logout } from './lib/auth';
import type { Patient, TabId, TodayStats, ToastMsg, Payment, PaymentSummary } from './types';
import './styles.css';

const PAGE_TITLES: Record<TabId, { title: string; sub: string }> = {
  overview:  { title: 'Home',      sub: 'See what is happening today' },
  today:     { title: 'Today',     sub: 'All appointments for today' },
  patients:  { title: 'Patients',  sub: 'Find and open patient details' },
  book:      { title: 'Book',      sub: 'Add a new appointment' },
  payments:  { title: 'Payments',  sub: 'Track collections and dues' },
};

function ClinicApp() {
  const [tab,           setTab]           = useState<TabId>('overview');
  const [collapsed,     setCollapsed]     = useState(false);
  const [today,         setToday]         = useState<TodayStats | null>(null);
  const [patients,      setPatients]      = useState<Patient[]>([]);
  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const [patientDetail, setPatientDetail] = useState<{ patient: Patient; appointments: import('./types').Appointment[] } | null>(null);
  const [clinicName,    setClinicName]    = useState('Clinic');
  const [clinicEmoji,   setClinicEmoji]   = useState('🏥');
  const [toasts,        setToasts]        = useState<ToastMsg[]>([]);
  const [prefillPt,     setPrefillPt]     = useState<Patient | null>(null);
  const [showUserMenu,  setShowUserMenu]  = useState(false);
  const [showSearch,    setShowSearch]    = useState(false);
  const [displayName,   setDisplayName]   = useState<string>('');
  const [payments,      setPayments]      = useState<Payment[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({ todayTotal: 0, monthTotal: 0, dueCount: 0 });
  const userMenuRef = useRef<HTMLDivElement>(null);
  const lastApiErrorRef = useRef<{ at: number; msg: string } | null>(null);

  useEffect(() => {
    if (!showUserMenu) return;
    function onDocClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showUserMenu]);

  /* ── Toast ── */
  function toast(text: string, type: 'ok' | 'err' = 'ok') {
    const id = Date.now();
    setToasts(ts => [...ts, { id, text, type }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3500);
  }
  function dismissToast(id: number) { setToasts(ts => ts.filter(t => t.id !== id)); }

  function toastApiError(e: unknown) {
    const msg = e instanceof Error ? e.message : 'API error';
    const now = Date.now();
    const prev = lastApiErrorRef.current;
    // Avoid spamming (polling / repeated failures)
    if (prev && prev.msg === msg && now - prev.at < 60_000) return;
    lastApiErrorRef.current = { msg, at: now };
    toast(msg, 'err');
  }

  /* ── Data loaders ── */
  const loadToday = useCallback(async () => {
    try { setToday(await fetchToday()); } catch (e) { toastApiError(e); }
  }, []);

  const loadPatients = useCallback(async (search?: string) => {
    try { setPatients(await fetchPatients(search)); } catch (e) { toastApiError(e); }
  }, []);

  const loadPatientDetail = useCallback(async (id: string) => {
    try {
      const data = await fetchPatient(id);
      setPatientDetail(data);
      setSelectedId(id);
      return true;
    } catch {
      toast('Could not load patient', 'err');
      return false;
    }
  }, []);

  const loadPayments = useCallback(async () => {
    try {
      const data = await fetchPayments();
      setPayments(data.payments || []);
      setPaymentSummary(data.summary || { todayTotal: 0, monthTotal: 0, dueCount: 0 });
    } catch (e) {
      toastApiError(e);
    }
  }, []);

  useEffect(() => {
    loadToday();
    loadPatients();
    fetchClient().then((c) => {
      if (c?.name) setClinicName(c.name);
      if (c?.emoji) setClinicEmoji(c.emoji);
    }).catch(() => {});
    fetchMe().then((m) => {
      const n = m?.user?.name || m?.user?.username || m?.user?.email || '';
      if (n) setDisplayName(n);
    }).catch(() => {});
    const id = setInterval(loadToday, 15000);
    return () => clearInterval(id);
  }, [loadToday, loadPatients]);

  useEffect(() => {
    if (tab !== 'payments') return;
    loadPayments();
    loadPatients();
  }, [tab, loadPayments, loadPatients]);

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
  const keyboardOpen = useKeyboardOpen();
  const hideBottomNav = isPatientOpen || keyboardOpen;
  const initials = clinicName.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('') || 'AD';

  return (
    <div className={`clinic-app${keyboardOpen ? ' keyboard-open' : ''}`}>
      {/* Sidebar — desktop */}
      <Sidebar
        active={isPatientOpen ? 'patients' : tab}
        collapsed={collapsed}
        onChange={handleTabChange}
        onToggle={() => setCollapsed(c => !c)}
        brandName={`${clinicEmoji} ${clinicName}`}
        brandSub="Clinic desk"
        userInitials={initials}
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
                <span className="top-bar-name">{clinicName}</span>
                <span className="top-bar-sub">Clinic desk</span>
              </div>
            </div>
          )}
          {!isPatientOpen && (
            <div className="top-bar-actions">
              <button type="button" className="icon-btn" onClick={() => setShowSearch(true)} aria-label="Search">
                <Search size={18} />
              </button>
              <div className="user-menu-wrap" ref={userMenuRef}>
                <button
                  type="button"
                  className="top-bar-avatar"
                  title="Account"
                  onClick={() => setShowUserMenu((v) => !v)}
                  aria-label="Account menu"
                >
                  {initials}
                </button>
                {showUserMenu && (
                  <div className="user-menu">
                    <div className="user-menu-name">{clinicName}</div>
                    <button type="button" className="user-menu-item" onClick={logout}>
                      <LogOut size={14} /> Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Desktop topbar */}
        <div className="desktop-topbar">
          <div className="desktop-topbar-title">
            <h2>{isPatientOpen ? patientDetail!.patient.name : pageInfo.title}</h2>
            <p>{isPatientOpen ? `Patient · ${clinicName}` : pageInfo.sub}</p>
          </div>
          <div className="desktop-topbar-right">
            {!isPatientOpen && (
              <button type="button" className="icon-btn" onClick={() => setShowSearch(true)} aria-label="Search">
                <Search size={15} />
              </button>
            )}
            {(tab === 'today' || tab === 'overview') && !isPatientOpen && (
              <button type="button" className="icon-btn" onClick={loadToday} aria-label="Refresh">
                <RefreshCw size={15} />
              </button>
            )}
            <div className="dt-avatar" title="Admin">{initials}</div>
          </div>
        </div>

        {/* Content */}
        <main className={`main-content${hideBottomNav ? ' no-bottom-nav' : ''}`}>
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
              displayName={displayName}
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
              onRefresh={() => { loadToday(); loadPatients(); }}
              onOpenPatient={handleOpenPatient}
              onGoToBook={() => handleTabChange('book')}
              onToast={toast}
            />
          ) : tab === 'patients' ? (
            <PatientsView
              patients={patients}
              onSearch={loadPatients}
              onSelect={loadPatientDetail}
              onToast={toast}
              onPatientSaved={loadPatients}
              onPaymentRecorded={() => { loadPatients(); loadPayments(); }}
            />
          ) : tab === 'payments' ? (
            <PaymentsView
              summary={paymentSummary}
              payments={payments}
              patients={patients}
              onRecorded={() => { loadPayments(); loadToday(); loadPatients(); }}
              onOpenPatient={handleOpenPatient}
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
        {!hideBottomNav && <BottomNav active={tab} onChange={handleTabChange} />}
      </div>

      {/* Toast notifications */}
      <Toaster toasts={toasts} onDismiss={dismissToast} />

      {showSearch && (
        <GlobalSearchDialog
          todayAppointments={today?.appointments ?? []}
          onClose={() => setShowSearch(false)}
          onOpenPatient={handleOpenPatient}
          onToast={toast}
          onGoToToday={() => { setShowSearch(false); handleTabChange('today'); }}
        />
      )}
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
