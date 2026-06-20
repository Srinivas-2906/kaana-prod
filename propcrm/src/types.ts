export type Stage = 'new' | 'contacted' | 'site' | 'negotiation';

export type ViewId =
  | 'dashboard'
  | 'properties'
  | 'leads'
  | 'followups'
  | 'calendar'
  | 'reports'
  | 'settings';

export type SortKey = 'name' | 'score' | 'budget' | 'followupDate' | 'lastContacted';

export interface ScoreBreakdown {
  engagement: number;
  budgetFit: number;
  timeline: number;
}

export interface Activity {
  id: string;
  leadId: number;
  text: string;
  timestamp: string;
  type: 'call' | 'note' | 'stage' | 'visit' | 'system' | 'message';
}

export interface Document {
  name: string;
  type: string;
  addedAt: string;
}

export interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  prop: string;
  budget: string;
  budgetNum: number;
  stage: Stage;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  interest: string;
  source: string;
  followup: string;
  followupDate: string;
  lastContacted: string;
  daysInStage: number;
  assignedAgent: string;
  note: string;
  notes: string[];
  documents: Document[];
  aiNextAction: string;
  stageEnteredAt: string;
}

export interface Property {
  title: string;
  beds: string;
  status: string;
  price: string;
  match: number;
}

export interface AppState {
  leads: Lead[];
  activities: Activity[];
  selectedLeadId: number | null;
  selectedIds: number[];
  globalSearch: string;
  tableSearch: string;
  pipelineFilter: 'all' | 'hot' | 'today';
  sortKey: SortKey;
  sortDir: 1 | -1;
  nextId: number;
}

export type AppAction =
  | { type: 'SELECT_LEAD'; id: number | null }
  | { type: 'SET_GLOBAL_SEARCH'; value: string }
  | { type: 'SET_TABLE_SEARCH'; value: string }
  | { type: 'SET_PIPELINE_FILTER'; value: AppState['pipelineFilter'] }
  | { type: 'SET_SORT'; key: SortKey }
  | { type: 'MOVE_STAGE'; id: number; stage: Stage }
  | { type: 'BULK_MOVE_STAGE'; ids: number[]; stage: Stage }
  | { type: 'BULK_ASSIGN'; ids: number[]; agent: string }
  | { type: 'ADD_LEAD'; lead: Lead }
  | { type: 'UPDATE_NOTE'; id: number; note: string }
  | { type: 'ADD_ACTIVITY'; activity: Activity }
  | { type: 'TOGGLE_SELECT'; id: number }
  | { type: 'SELECT_ALL'; ids: number[] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'INCREMENT_DAYS'; id: number }
  | { type: 'SYNC_WHATSAPP_LEADS'; leads: Lead[] }
  | { type: 'REPLACE_LEADS'; leads: Lead[] };
