import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useReducer, useState, useMemo, useEffect, useRef } from 'react';
import { initialState } from './data/mockData';
import { leadsReducer, stageLabel } from './reducers/leadsReducer';
import { ToastProvider, useToast } from './hooks/useToast';
import { Sidebar } from './components/Layout/Sidebar';
import { Topbar } from './components/Layout/Topbar';
import { StatsCards } from './components/Dashboard/StatsCards';
import { AISummaryCard } from './components/Dashboard/AISummaryCard';
import { Pipeline } from './components/Dashboard/Pipeline';
import { LeadTable } from './components/Dashboard/LeadTable';
import { LeadDetailSidebar } from './components/LeadDetail/LeadDetailSidebar';
import { NewLeadModal } from './components/Modals/NewLeadModal';
import { ReportsView } from './components/Reports/ReportsView';
import { PropertiesView } from './components/views/PropertiesView';
import { FollowupsView } from './components/views/FollowupsView';
import { CalendarView } from './components/views/CalendarView';
import { SettingsView } from './components/views/SettingsView';
import { filterLeads } from './utils/format';
import { LoginGate } from './components/LoginGate';
import { authHeaders } from './lib/auth';
import type { ViewId, Stage, Lead } from './types';

function CRM() {
  const [state, dispatch] = useReducer(leadsReducer, initialState);
  const [view, setView] = useState<ViewId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStage, setModalStage] = useState<Stage>('new');
  const [activeDragLead, setActiveDragLead] = useState<Lead | null>(null);
  const { showToast } = useToast();
  const prevStageRef = useRef<Map<number, Stage>>(new Map());
  const syncedLeadIds = useRef<Set<number>>(new Set());
  const loadedFromApi = useRef(false);

  useEffect(() => {
    const API = import.meta.env.VITE_WHATSAPP_API || 'http://localhost:3002/api';
    async function syncLeads() {
      try {
        const res = await fetch(`${API}/leads`, { headers: authHeaders() });
        if (res.status === 401) return;
        if (!res.ok) return;
        const leads: Lead[] = await res.json();
        if (!loadedFromApi.current && leads.length > 0) {
          loadedFromApi.current = true;
          leads.forEach((l) => syncedLeadIds.current.add(l.id));
          dispatch({ type: 'REPLACE_LEADS', leads });
          return;
        }
        const fresh = leads.filter((l) => !syncedLeadIds.current.has(l.id));
        if (!fresh.length) return;
        fresh.forEach((l) => syncedLeadIds.current.add(l.id));
        dispatch({ type: 'SYNC_WHATSAPP_LEADS', leads: fresh });
        showToast(`New WhatsApp lead: ${fresh[0].name}`);
      } catch {
        /* API offline */
      }
    }
    syncLeads();
    const id = setInterval(syncLeads, 4000);
    return () => clearInterval(id);
  }, [showToast]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const globalFiltered = useMemo(
    () => filterLeads(state.leads, state.globalSearch),
    [state.leads, state.globalSearch],
  );

  const pipelineFiltered = useMemo(() => {
    let list = globalFiltered;
    if (state.pipelineFilter === 'hot') list = list.filter((l) => l.score >= 75);
    if (state.pipelineFilter === 'today') list = list.filter((l) => l.followup === 'Today');
    return list;
  }, [globalFiltered, state.pipelineFilter]);

  const selectedLead = state.leads.find((l) => l.id === state.selectedLeadId) ?? null;

  useEffect(() => {
    state.leads.forEach((l) => {
      const prev = prevStageRef.current.get(l.id);
      if (prev && prev !== l.stage) {
        showToast(`${l.name} moved to ${stageLabel(l.stage)}`);
      }
      prevStageRef.current.set(l.id, l.stage);
    });
  }, [state.leads, showToast]);

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragLead(null);
    const { active, over } = event;
    if (!over) return;
    const leadId = active.data.current?.leadId as number;
    const newStage = over.id as Stage;
    if (leadId && ['new', 'contacted', 'site', 'negotiation'].includes(newStage)) {
      dispatch({ type: 'MOVE_STAGE', id: leadId, stage: newStage });
      const API = import.meta.env.VITE_WHATSAPP_API || 'http://localhost:3002/api';
      fetch(`${API}/leads/${leadId}`, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      }).catch(() => {});
    }
  };

  const openModal = (stage: Stage = 'new') => {
    setModalStage(stage);
    setModalOpen(true);
  };

  const pipelineValue = state.leads.reduce((s, l) => s + l.budgetNum, 0);

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <Sidebar
        active={view}
        collapsed={sidebarCollapsed}
        onNavigate={(v) => { setView(v); setMobileOpen(false); }}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        leadCount={state.leads.length}
      />

      <div className="main-area">
        <Topbar
          search={state.globalSearch}
          onSearch={(v) => dispatch({ type: 'SET_GLOBAL_SEARCH', value: v })}
          onMenuToggle={() => setMobileOpen((o) => !o)}
        />

        <main className="content">
          {view === 'dashboard' && (
            <DndContext
              sensors={sensors}
              onDragStart={(e) => {
                const id = e.active.data.current?.leadId as number;
                setActiveDragLead(state.leads.find((l) => l.id === id) ?? null);
              }}
              onDragEnd={handleDragEnd}
            >
              <AISummaryCard leads={state.leads} />
              <StatsCards
                leadCount={state.leads.length}
                pipelineValue={pipelineValue}
                siteVisits={state.leads.filter((l) => l.stage === 'site').length}
                negotiations={state.leads.filter((l) => l.stage === 'negotiation').length}
                followupsToday={state.leads.filter((l) => l.followup === 'Today').length}
                hotLeads={state.leads.filter((l) => l.score >= 75).length}
              />

              <div className="section-hd">
                <div>
                  <h2>Lead pipeline</h2>
                  <p>Drag cards between stages or use the detail panel</p>
                </div>
                <div className="chips">
                  {(['all', 'hot', 'today'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      className={`chip ${state.pipelineFilter === f ? 'active' : ''}`}
                      onClick={() => dispatch({ type: 'SET_PIPELINE_FILTER', value: f })}
                    >
                      {f === 'all' ? 'All' : f === 'hot' ? 'Hot leads' : 'Follow-up today'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="dashboard-grid">
                <div className="dashboard-main">
                  <Pipeline
                    leads={pipelineFiltered}
                    selectedId={state.selectedLeadId}
                    onSelect={(id) => dispatch({ type: 'SELECT_LEAD', id })}
                    onAddLead={openModal}
                  />

                  <div className="section-hd">
                    <h2>All leads</h2>
                    <button type="button" className="btn btn-primary" onClick={() => openModal()}>+ Add lead</button>
                  </div>
                  <LeadTable leads={globalFiltered} state={state} dispatch={dispatch} />
                </div>

                <LeadDetailSidebar lead={selectedLead} activities={state.activities} dispatch={dispatch} />
              </div>

              <DragOverlay>
                {activeDragLead ? (
                  <div className="lead-card dragging-overlay" style={{ borderLeftColor: activeDragLead.score >= 80 ? '#22c55e' : activeDragLead.score >= 50 ? '#f59e0b' : '#ef4444' }}>
                    <div className="lead-name">{activeDragLead.name}</div>
                    <div className="lead-prop">{activeDragLead.prop}</div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}

          {view === 'properties' && (
            <>
              <div className="section-hd"><div><h2>Properties</h2><p>Active listings inventory</p></div></div>
              <PropertiesView />
            </>
          )}

          {view === 'leads' && (
            <>
              <div className="section-hd">
                <div><h2>Leads</h2><p>Full lead workspace</p></div>
                <button type="button" className="btn btn-primary" onClick={() => openModal()}>+ Add lead</button>
              </div>
              <div className="leads-layout">
                <LeadTable leads={globalFiltered} state={state} dispatch={dispatch} />
                <LeadDetailSidebar lead={selectedLead} activities={state.activities} dispatch={dispatch} />
              </div>
            </>
          )}

          {view === 'followups' && (
            <>
              <div className="section-hd"><div><h2>Follow-ups</h2><p>Prioritized action queue</p></div></div>
              <FollowupsView leads={state.leads} onOpen={(id) => { dispatch({ type: 'SELECT_LEAD', id }); setView('dashboard'); }} />
            </>
          )}

          {view === 'calendar' && (
            <>
              <div className="section-hd"><div><h2>Calendar</h2><p>Scheduled follow-ups and visits</p></div></div>
              <CalendarView leads={state.leads} />
            </>
          )}

          {view === 'reports' && <ReportsView leads={state.leads} />}

          {view === 'settings' && (
            <>
              <div className="section-hd"><div><h2>Settings</h2><p>CRM preferences</p></div></div>
              <SettingsView />
            </>
          )}
        </main>
      </div>

      <NewLeadModal
        open={modalOpen}
        defaultStage={modalStage}
        onClose={() => setModalOpen(false)}
        onSave={(lead) => dispatch({ type: 'ADD_LEAD', lead })}
        nextId={state.nextId}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <LoginGate>
        <CRM />
      </LoginGate>
    </ToastProvider>
  );
}
