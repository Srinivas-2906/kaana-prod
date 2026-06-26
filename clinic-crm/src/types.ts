export type AppointmentStatus =
  | 'requested'
  | 'confirmed'
  | 'arrived'
  | 'visited'
  | 'cancelled'
  | 'no_show';

export interface Patient {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  age?: number | null;
  gender?: string;
  chiefComplaint?: string;
  isReturning?: boolean;
  tags?: string[];
  notes?: { text: string; at: string; by: string }[];
  lastVisit?: string | null;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Appointment {
  id: string;
  tenantId: string;
  patientId: string;
  patientName?: string;
  patientPhone?: string;
  service: string;
  scheduledAt: string;
  durationMin?: number;
  status: AppointmentStatus;
  assignedDoctor?: string;
  notes?: string;
  source?: string;
  createdAt?: string;
}

export interface TodayStats {
  date: string;
  total: number;
  unconfirmed: number;
  confirmed: number;
  arrived: number;
  totalPatients: number;
  appointments: Appointment[];
}

export interface Payment {
  id: string;
  patientId: string;
  patientName?: string;
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
  status: string;
  createdAt?: string;
}

export interface PaymentSummary {
  todayTotal: number;
  monthTotal: number;
  dueCount: number;
}

export type TabId = 'overview' | 'today' | 'patients' | 'book';

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  requested: 'Not confirmed',
  confirmed: 'Confirmed',
  arrived:   'In clinic',
  visited:   'Completed',
  cancelled: 'Cancelled',
  no_show:   'Did not come',
};

export const SERVICES = [
  'Check-up',
  'Teeth cleaning',
  'Root canal',
  'Tooth removal',
  'Dentures',
  'Smile work',
  'Braces',
  'Tooth filling',
  'X-ray',
  'Follow-up visit',
];

export interface ToastMsg {
  id: number;
  text: string;
  type: 'ok' | 'err';
}
