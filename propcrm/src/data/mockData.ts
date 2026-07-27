import type { Activity, AppState, Lead, Property } from '../types';

const agents = ['Ravi Kapoor', 'Priya Nair', 'Anil Sharma'];

function scoreLabel(score: number): { engagement: number; budgetFit: number; timeline: number } {
  const engagement = Math.min(10, Math.round(score / 10));
  const budgetFit = Math.min(10, Math.round((score + 5) / 11));
  const timeline = Math.min(10, Math.round((score - 3) / 10));
  return { engagement, budgetFit, timeline };
}

function aiAction(lead: Partial<Lead>): string {
  if ((lead.score ?? 0) >= 80) return 'Call today — high close probability';
  if (lead.stage === 'new') return 'Schedule first callback within 2 hours';
  if (lead.stage === 'site') return 'Send comparable listings after visit';
  if (lead.stage === 'negotiation') return 'Share token payment link';
  return 'Send property update email';
}

const baseLeads: Omit<Lead, 'scoreBreakdown' | 'aiNextAction'>[] = [
  { id: 1, name: 'Rajesh Kumar', phone: '9840012345', email: 'rajesh@email.com', prop: '3BHK Banjara Hills', budget: '₹85L', budgetNum: 8500000, stage: 'negotiation', score: 92, interest: 'Villa / independent house', source: '99acres', followup: 'Today', followupDate: '2026-06-09', lastContacted: '2026-06-08', daysInStage: 5, assignedAgent: 'Ravi Kapoor', note: 'Very serious buyer, has visited twice', notes: ['Visited twice', 'Prefers east-facing'], documents: [{ name: 'ID proof.pdf', type: 'PDF', addedAt: '2026-06-01' }], stageEnteredAt: '2026-06-04' },
  { id: 2, name: 'Priya Sharma', phone: '9700155432', email: 'priya.s@gmail.com', prop: '2BHK Jubilee Hills', budget: '₹55L', budgetNum: 5500000, stage: 'site', score: 78, interest: 'Flat / apartment', source: 'MagicBricks', followup: 'Tomorrow', followupDate: '2026-06-10', lastContacted: '2026-06-07', daysInStage: 3, assignedAgent: 'Priya Nair', note: 'Wants south-facing, 2nd floor+', notes: ['Site visit booked'], documents: [], stageEnteredAt: '2026-06-06' },
  { id: 3, name: 'Anil Mehta', phone: '9000077821', email: 'anil.m@outlook.com', prop: '3BHK Jubilee Hills', budget: '₹70L', budgetNum: 7000000, stage: 'new', score: 61, interest: 'Flat / apartment', source: 'Walk-in', followup: 'Today', followupDate: '2026-06-09', lastContacted: '2026-06-09', daysInStage: 1, assignedAgent: 'Ravi Kapoor', note: 'First enquiry, needs callback', notes: [], documents: [], stageEnteredAt: '2026-06-08' },
  { id: 4, name: 'Sunita Reddy', phone: '8800134521', email: 'sunita.r@yahoo.com', prop: 'Villa Gachibowli', budget: '₹1.2Cr', budgetNum: 12000000, stage: 'contacted', score: 55, interest: 'Villa / row house', source: 'Instagram ad', followup: 'Thu', followupDate: '2026-06-12', lastContacted: '2026-06-05', daysInStage: 7, assignedAgent: 'Anil Sharma', note: 'Interested but comparing 3 properties', notes: ['Sent brochure'], documents: [{ name: 'Brochure.pdf', type: 'PDF', addedAt: '2026-06-03' }], stageEnteredAt: '2026-06-02' },
  { id: 5, name: 'Kiran Verma', phone: '9950011230', email: 'kiran.v@gmail.com', prop: '1BHK Kondapur', budget: '₹32L', budgetNum: 3200000, stage: 'new', score: 44, interest: 'Flat / apartment', source: 'Housing.com', followup: 'Fri', followupDate: '2026-06-13', lastContacted: '2026-06-06', daysInStage: 4, assignedAgent: 'Priya Nair', note: 'Budget sensitive, first-time buyer', notes: [], documents: [], stageEnteredAt: '2026-06-05' },
  { id: 6, name: 'Deepa Nair', phone: '8765498765', email: 'deepa.n@email.com', prop: '2BHK Madhapur', budget: '₹48L', budgetNum: 4800000, stage: 'site', score: 82, interest: 'Ready to move', source: 'Referral', followup: 'Today', followupDate: '2026-06-09', lastContacted: '2026-06-08', daysInStage: 2, assignedAgent: 'Ravi Kapoor', note: 'Referral from existing client, very warm', notes: ['Referral from client #1042'], documents: [], stageEnteredAt: '2026-06-07' },
  { id: 7, name: 'Vikram Singh', phone: '9632100987', email: 'vikram.s@corp.com', prop: 'Office space Hitech City', budget: '₹95L', budgetNum: 9500000, stage: 'contacted', score: 67, interest: 'Commercial', source: 'LinkedIn', followup: 'Wed', followupDate: '2026-06-11', lastContacted: '2026-06-04', daysInStage: 6, assignedAgent: 'Anil Sharma', note: 'Looking for commercial investment', notes: [], documents: [], stageEnteredAt: '2026-06-03' },
  { id: 8, name: 'Meena Iyer', phone: '9123456789', email: 'meena.i@gmail.com', prop: '3BHK Manikonda', budget: '₹62L', budgetNum: 6200000, stage: 'new', score: 38, interest: 'Flat / apartment', source: '99acres', followup: 'Next week', followupDate: '2026-06-16', lastContacted: '2026-06-01', daysInStage: 8, assignedAgent: 'Priya Nair', note: 'Early stage, just browsing', notes: [], documents: [], stageEnteredAt: '2026-06-01' },
];

export const initialLeads: Lead[] = baseLeads.map((l) => ({
  ...l,
  scoreBreakdown: scoreLabel(l.score),
  aiNextAction: aiAction(l),
}));

export const initialActivities: Activity[] = [
  { id: 'a1', leadId: 2, text: 'Priya Sharma booked site visit for Banjara Hills villa', timestamp: '2026-06-09T10:30:00', type: 'visit' },
  { id: 'a2', leadId: 1, text: 'Rajesh Kumar moved to Negotiation stage', timestamp: '2026-06-09T08:15:00', type: 'stage' },
  { id: 'a3', leadId: 3, text: 'New enquiry: Anil Mehta — 3BHK Jubilee Hills', timestamp: '2026-06-09T09:15:00', type: 'system' },
  { id: 'a4', leadId: 0, text: 'Auto follow-up SMS sent to 5 cold leads', timestamp: '2026-06-08T18:00:00', type: 'message' },
  { id: 'a5', leadId: 1, text: 'Call completed — discussed token amount', timestamp: '2026-06-08T16:00:00', type: 'call' },
  { id: 'a6', leadId: 6, text: 'Deepa Nair confirmed site visit for today', timestamp: '2026-06-08T14:20:00', type: 'visit' },
];

export const properties: Property[] = [
  { title: '3BHK Banjara Hills Villa', beds: '3 BHK · 2,400 sqft', status: 'Ready to move', price: '₹85L', match: 3 },
  { title: '2BHK Jubilee Hills Flat', beds: '2 BHK · 1,450 sqft', status: 'Under negotiation', price: '₹55L', match: 2 },
  { title: 'Villa Gachibowli', beds: '4 BHK · 3,100 sqft', status: 'Premium listing', price: '₹1.2Cr', match: 1 },
  { title: '2BHK Madhapur', beds: '2 BHK · 1,280 sqft', status: 'Hot demand', price: '₹48L', match: 4 },
  { title: 'Office Hitech City', beds: '1,800 sqft commercial', status: 'Investment grade', price: '₹95L', match: 1 },
  { title: '1BHK Kondapur', beds: '1 BHK · 780 sqft', status: 'Budget segment', price: '₹32L', match: 2 },
];

export const agentsList = agents;

export const initialState: AppState = {
  leads: initialLeads,
  activities: initialActivities,
  selectedLeadId: 1,
  selectedIds: [],
  globalSearch: '',
  tableSearch: '',
  pipelineFilter: 'all',
  sortKey: 'score',
  sortDir: -1,
  nextId: 9,
};

export const sourceChartData = [
  { name: '99acres', value: 18 },
  { name: 'MagicBricks', value: 12 },
  { name: 'Walk-in', value: 8 },
  { name: 'Referral', value: 10 },
  { name: 'Instagram', value: 6 },
  { name: 'Other', value: 9 },
];

export const pipelineTrendData = [
  { month: 'Jan', value: 1.8 },
  { month: 'Feb', value: 2.0 },
  { month: 'Mar', value: 2.1 },
  { month: 'Apr', value: 2.3 },
  { month: 'May', value: 2.2 },
  { month: 'Jun', value: 2.4 },
];
