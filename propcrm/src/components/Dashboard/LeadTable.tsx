import type { AppAction, AppState, Lead, SortKey, Stage } from '../../types';
import { stageLabel } from '../../reducers/leadsReducer';
import { formatDate, scoreColor, sortLeads } from '../../utils/format';
import { useToast } from '../../hooks/useToast';

interface LeadTableProps {
  leads: Lead[];
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  showBulk?: boolean;
}

const sortLabels: Record<SortKey, string> = {
  name: 'Lead',
  score: 'AI score',
  budget: 'Budget',
  followupDate: 'Follow-up',
  lastContacted: 'Last contacted',
};

export function LeadTable({ leads, state, dispatch, showBulk = true }: LeadTableProps) {
  const { showToast } = useToast();
  const filtered = sortLeads(
    leads.filter((l) => {
      const q = state.tableSearch.trim().toLowerCase();
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.prop.toLowerCase().includes(q) ||
        l.phone.includes(q)
      );
    }),
    state.sortKey,
    state.sortDir,
  );

  const allSelected = filtered.length > 0 && filtered.every((l) => state.selectedIds.includes(l.id));

  const toggleAll = () => {
    if (allSelected) dispatch({ type: 'CLEAR_SELECTION' });
    else dispatch({ type: 'SELECT_ALL', ids: filtered.map((l) => l.id) });
  };

  const bulkMove = (stage: Stage) => {
    const count = state.selectedIds.length;
    dispatch({ type: 'BULK_MOVE_STAGE', ids: state.selectedIds, stage });
    dispatch({ type: 'CLEAR_SELECTION' });
    if (count) showToast(`${count} lead(s) moved to ${stageLabel(stage)}`);
  };

  const bulkAssign = () => {
    const agent = prompt('Assign to agent:', 'Ravi Kapoor');
    if (agent) {
      dispatch({ type: 'BULK_ASSIGN', ids: state.selectedIds, agent });
    }
  };

  const bulkMessage = () => {
    alert(`Draft message for ${state.selectedIds.length} selected leads`);
  };

  return (
    <div className="table-section">
      <div className="table-toolbar">
        <div className="table-search-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            placeholder="Filter table..."
            value={state.tableSearch}
            onChange={(e) => dispatch({ type: 'SET_TABLE_SEARCH', value: e.target.value })}
          />
        </div>
      </div>

      {showBulk && state.selectedIds.length > 0 && (
        <div className="bulk-bar">
          <span>{state.selectedIds.length} selected</span>
          <button type="button" onClick={bulkAssign}>Bulk assign</button>
          <button type="button" onClick={bulkMessage}>Bulk message</button>
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) bulkMove(e.target.value as Stage);
              e.target.value = '';
            }}
          >
            <option value="">Bulk move stage...</option>
            <option value="new">New enquiry</option>
            <option value="contacted">Contacted</option>
            <option value="site">Site visit</option>
            <option value="negotiation">Negotiation</option>
          </select>
          <button type="button" className="ghost" onClick={() => dispatch({ type: 'CLEAR_SELECTION' })}>
            Clear
          </button>
        </div>
      )}

      <div className="leads-table panel">
        <div className="tbl-head">
          {showBulk && (
            <div className="tbl-check">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
            </div>
          )}
          {(Object.keys(sortLabels) as SortKey[]).map((key) => (
            <div
              key={key}
              className={`tbl-hcell sortable ${state.sortKey === key ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_SORT', key })}
            >
              {sortLabels[key]}
              {state.sortKey === key && (state.sortDir === 1 ? ' ↑' : ' ↓')}
            </div>
          ))}
          <div className="tbl-hcell">Stage</div>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">No leads match your filter.</div>
        ) : (
          filtered.map((l) => (
            <div
              key={l.id}
              className={`tbl-row ${state.selectedLeadId === l.id ? 'selected' : ''}`}
              onClick={() => dispatch({ type: 'SELECT_LEAD', id: l.id })}
            >
              {showBulk && (
                <div className="tbl-check" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={state.selectedIds.includes(l.id)}
                    onChange={() => dispatch({ type: 'TOGGLE_SELECT', id: l.id })}
                    aria-label={`Select ${l.name}`}
                  />
                </div>
              )}
              <div>
                <div className="cell-name">{l.name}</div>
                <div className="cell-sub">{l.source}</div>
              </div>
              <div>
                <div className="score-cell" style={{ color: scoreColor(l.score) }}>{l.score}</div>
                <div className="score-bar"><div className="score-fill" style={{ width: `${l.score}%`, background: scoreColor(l.score) }} /></div>
              </div>
              <div className="budget-val">{l.budget}</div>
              <div className="cell">{l.followup}</div>
              <div className="cell">{formatDate(l.lastContacted)}</div>
              <div><span className={`badge badge-${l.stage}`}>{stageLabel(l.stage)}</span></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
