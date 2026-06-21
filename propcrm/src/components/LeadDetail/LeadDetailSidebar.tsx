import { useState } from 'react';
import type { Activity, AppAction, Lead, Stage } from '../../types';
import { stageLabel } from '../../reducers/leadsReducer';
import { formatDateTime, initials, scoreColor } from '../../utils/format';
import { whatsappHref } from '../../lib/whatsapp';

type Tab = 'overview' | 'timeline' | 'notes' | 'documents';

interface LeadDetailSidebarProps {
  lead: Lead | null;
  activities: Activity[];
  dispatch: React.Dispatch<AppAction>;
}

export function LeadDetailSidebar({ lead, activities, dispatch }: LeadDetailSidebarProps) {
  const [tab, setTab] = useState<Tab>('overview');
  const [noteDraft, setNoteDraft] = useState('');

  if (!lead) {
    return (
      <aside className="detail-sidebar">
        <div className="side-card">
          <div className="side-head">Lead detail</div>
          <div className="empty-state">Select a lead to view details</div>
        </div>
      </aside>
    );
  }

  const leadActivities = activities.filter((a) => a.leadId === lead.id || a.leadId === 0);

  const saveNote = () => {
    if (!noteDraft.trim()) return;
    dispatch({ type: 'UPDATE_NOTE', id: lead.id, note: noteDraft.trim() });
    setNoteDraft('');
    setTab('timeline');
  };

  const moveStage = (stage: Stage) => {
    dispatch({ type: 'MOVE_STAGE', id: lead.id, stage });
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'notes', label: 'Notes' },
    { id: 'documents', label: 'Documents' },
  ];

  return (
    <aside className="detail-sidebar">
      <div className="side-card">
        <div className="side-head">
          <span>Lead detail</span>
          <span className={`badge badge-${lead.stage}`}>{stageLabel(lead.stage)}</span>
        </div>

        <div className="detail-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={tab === t.id ? 'active' : ''}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="side-body">
          {tab === 'overview' && (
            <>
              <div className="detail-hero">
                <div className="detail-avatar">{initials(lead.name)}</div>
                <div>
                  <div className="detail-name">{lead.name}</div>
                  <div className="detail-phone">{lead.phone} · {lead.email}</div>
                </div>
              </div>
              <div className="detail-row"><span>Property</span><strong>{lead.prop}</strong></div>
              <div className="detail-row"><span>Budget</span><strong className="budget-val">{lead.budget}</strong></div>
              <div className="detail-row"><span>Interest</span><strong>{lead.interest}</strong></div>
              <div className="detail-row"><span>Source</span><strong>{lead.source}</strong></div>
              <div className="detail-row"><span>Assigned</span><strong>{lead.assignedAgent}</strong></div>
              <div className="detail-row"><span>Follow-up</span><strong>{lead.followup}</strong></div>
              <div className="detail-row">
                <span>AI score</span>
                <div className="score-tooltip-wrap inline">
                  <strong style={{ color: scoreColor(lead.score) }}>{lead.score}/100</strong>
                  <div className="score-tooltip">
                    <div className="score-tooltip-title">AI score breakdown</div>
                    <div>Engagement: {lead.scoreBreakdown.engagement}/10</div>
                    <div>Budget fit: {lead.scoreBreakdown.budgetFit}/10</div>
                    <div>Timeline: {lead.scoreBreakdown.timeline}/10</div>
                  </div>
                </div>
              </div>
              <div className="note-box">{lead.note}</div>

              <label className="stage-select-label" htmlFor="stage-select">Move stage</label>
              <select
                id="stage-select"
                className="stage-select"
                value={lead.stage}
                onChange={(e) => moveStage(e.target.value as Stage)}
              >
                <option value="new">New enquiry</option>
                <option value="contacted">Contacted</option>
                <option value="site">Site visit</option>
                <option value="negotiation">Negotiation</option>
              </select>

              <div className="action-grid">
                <a className="btn btn-primary" href={`tel:${lead.phone}`}>
                  Call now
                </a>
                <a
                  className="btn btn-primary"
                  href={whatsappHref(lead.phone, `Hi ${lead.name},`)}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
                <button type="button" className="btn" onClick={() => setTab('notes')}>Add note</button>
                <button type="button" className="btn">Schedule</button>
              </div>
            </>
          )}

          {tab === 'timeline' && (
            <div className="timeline-list">
              {leadActivities.length === 0 ? (
                <div className="empty-state">No activity yet for this lead.</div>
              ) : (
                leadActivities.map((a) => (
                  <div key={a.id} className="timeline-item">
                    <div className="timeline-dot" />
                    <div>
                      <div className="timeline-text">{a.text}</div>
                      <div className="timeline-time">{formatDateTime(a.timestamp)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'notes' && (
            <>
              <textarea
                className="notes-area"
                placeholder="Add a note about this lead..."
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                rows={4}
              />
              <button type="button" className="btn btn-primary btn-block" onClick={saveNote}>
                Save note
              </button>
              <div className="saved-notes">
                <div className="saved-notes-title">Saved notes</div>
                {lead.notes.length === 0 ? (
                  <div className="empty-state small">No saved notes yet.</div>
                ) : (
                  lead.notes.map((n, i) => (
                    <div key={i} className="saved-note-item">{n}</div>
                  ))
                )}
              </div>
            </>
          )}

          {tab === 'documents' && (
            <div className="doc-list">
              {lead.documents.length === 0 ? (
                <div className="empty-state">No documents uploaded yet.</div>
              ) : (
                lead.documents.map((d) => (
                  <div key={d.name} className="doc-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                    </svg>
                    <div>
                      <div className="doc-name">{d.name}</div>
                      <div className="doc-meta">{d.type} · {d.addedAt}</div>
                    </div>
                  </div>
                ))
              )}
              <button type="button" className="btn btn-block" style={{ marginTop: 12 }}>Upload document</button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
