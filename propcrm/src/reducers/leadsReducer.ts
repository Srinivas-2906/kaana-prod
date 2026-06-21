import type { AppAction, AppState, Lead, Stage } from '../types';

const STAGE_ORDER: Stage[] = ['new', 'contacted', 'site', 'negotiation'];

function stageLabel(stage: Stage): string {
  return { new: 'New enquiry', contacted: 'Contacted', site: 'Site visit', negotiation: 'Negotiation' }[stage];
}

function bumpScore(stage: Stage, score: number): number {
  if (stage === 'negotiation') return Math.max(score, 85);
  if (stage === 'site') return Math.max(score, 70);
  if (stage === 'contacted') return Math.max(score, 55);
  return score;
}

function moveLead(leads: Lead[], id: number, stage: Stage): Lead[] {
  return leads.map((l) => {
    if (l.id !== id) return l;
    const score = bumpScore(stage, l.score);
    return {
      ...l,
      stage,
      score,
      daysInStage: 0,
      stageEnteredAt: new Date().toISOString().slice(0, 10),
      scoreBreakdown: {
        engagement: Math.min(10, Math.round(score / 10)),
        budgetFit: Math.min(10, Math.round((score + 5) / 11)),
        timeline: Math.min(10, Math.round((score - 3) / 10)),
      },
      aiNextAction:
        score >= 80 ? 'Call today — high close probability' :
        stage === 'new' ? 'Schedule first callback within 2 hours' :
        stage === 'negotiation' ? 'Share token payment link' :
        'Send property update email',
    };
  });
}

export function leadsReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SELECT_LEAD':
      return { ...state, selectedLeadId: action.id };

    case 'SET_GLOBAL_SEARCH':
      return { ...state, globalSearch: action.value };

    case 'SET_TABLE_SEARCH':
      return { ...state, tableSearch: action.value };

    case 'SET_PIPELINE_FILTER':
      return { ...state, pipelineFilter: action.value };

    case 'SET_SORT': {
      const sortDir = state.sortKey === action.key ? (state.sortDir === 1 ? -1 : 1) as 1 | -1 : action.key === 'name' ? 1 : -1;
      return { ...state, sortKey: action.key, sortDir };
    }

    case 'MOVE_STAGE': {
      const lead = state.leads.find((l) => l.id === action.id);
      if (!lead || lead.stage === action.stage) return state;
      return {
        ...state,
        leads: moveLead(state.leads, action.id, action.stage),
        activities: [
          {
            id: `a-${Date.now()}`,
            leadId: action.id,
            text: `${lead.name} moved from ${stageLabel(lead.stage)} to ${stageLabel(action.stage)}`,
            timestamp: new Date().toISOString(),
            type: 'stage',
          },
          ...state.activities,
        ],
      };
    }

    case 'BULK_MOVE_STAGE':
      return action.ids.reduce(
        (s, id) => leadsReducer(s, { type: 'MOVE_STAGE', id, stage: action.stage }),
        state,
      );

    case 'BULK_ASSIGN':
      return {
        ...state,
        leads: state.leads.map((l) =>
          action.ids.includes(l.id) ? { ...l, assignedAgent: action.agent } : l,
        ),
        selectedIds: [],
      };

    case 'ADD_LEAD':
      return {
        ...state,
        leads: [action.lead, ...state.leads],
        selectedLeadId: action.lead.id,
        nextId: state.nextId + 1,
        activities: [
          {
            id: `a-${Date.now()}`,
            leadId: action.lead.id,
            text: `New lead added: ${action.lead.name} — ${action.lead.prop}`,
            timestamp: new Date().toISOString(),
            type: 'system',
          },
          ...state.activities,
        ],
      };

    case 'UPDATE_NOTE': {
      const lead = state.leads.find((l) => l.id === action.id);
      if (!lead) return state;
      return {
        ...state,
        leads: state.leads.map((l) =>
          l.id === action.id
            ? { ...l, note: action.note, notes: [...l.notes, action.note] }
            : l,
        ),
        activities: [
          {
            id: `a-${Date.now()}`,
            leadId: action.id,
            text: `Note added for ${lead.name}`,
            timestamp: new Date().toISOString(),
            type: 'note',
          },
          ...state.activities,
        ],
      };
    }

    case 'ADD_ACTIVITY':
      return { ...state, activities: [action.activity, ...state.activities] };

    case 'TOGGLE_SELECT':
      return {
        ...state,
        selectedIds: state.selectedIds.includes(action.id)
          ? state.selectedIds.filter((i) => i !== action.id)
          : [...state.selectedIds, action.id],
      };

    case 'SELECT_ALL':
      return { ...state, selectedIds: action.ids };

    case 'CLEAR_SELECTION':
      return { ...state, selectedIds: [] };

    case 'REPLACE_LEADS':
      return {
        ...state,
        leads: action.leads,
        nextId: Math.max(state.nextId, ...action.leads.map((l) => l.id + 1), 1),
      };

    case 'SYNC_WHATSAPP_LEADS': {
      const existingIds = new Set(state.leads.map((l) => l.id));
      const fresh = action.leads.filter((l) => !existingIds.has(l.id));
      if (!fresh.length) return state;
      return {
        ...state,
        leads: [...fresh, ...state.leads],
        activities: [
          ...fresh.map((l) => ({
            id: `a-wa-${l.id}`,
            leadId: l.id,
            text: `WhatsApp lead: ${l.name} — ${l.prop}`,
            timestamp: new Date().toISOString(),
            type: 'message' as const,
          })),
          ...state.activities,
        ],
      };
    }

    default:
      return state;
  }
}

export { STAGE_ORDER, stageLabel };
