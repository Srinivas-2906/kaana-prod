import { authHeaders } from './auth';
import type { Appointment, Patient, TodayStats, Payment, PaymentSummary } from '../types';

const API = import.meta.env.VITE_WHATSAPP_API || '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      ...init,
      headers: { ...authHeaders(), ...(init?.headers || {}) },
    });
  } catch {
    throw new Error(
      'Cannot reach the API server. Start botiq-whatsapp-server (npm run dev in botiq-whatsapp-server).',
    );
  }
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json() as Promise<T>;
}

export function fetchToday() {
  return request<TodayStats>('/clinic/today');
}

export function fetchPatients(search?: string) {
  const q = search ? `?search=${encodeURIComponent(search)}` : '';
  return request<Patient[]>(`/patients${q}`);
}

export function fetchPatient(id: string) {
  return request<{ patient: Patient; appointments: Appointment[] }>(`/patients/${id}`);
}

export function createPatient(data: Partial<Patient> & { name: string; phone: string }) {
  return request<Patient>('/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function updatePatient(id: string, patch: Partial<Patient> & { note?: string }) {
  return request<Patient>(`/patients/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
}

export function createAppointment(data: {
  patientId?: string;
  patientName?: string;
  phone?: string;
  service: string;
  scheduledAt: string;
  status?: string;
  source?: string;
}) {
  return request<Appointment>('/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function updateAppointment(id: string, patch: Partial<Appointment>) {
  return request<Appointment>(`/appointments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
}

export function fetchAppointments(params?: { date?: string }) {
  const q = params?.date ? `?date=${encodeURIComponent(params.date)}` : '';
  return request<Appointment[]>(`/appointments${q}`);
}

export function fetchClient() {
  return request<{ name: string; emoji: string; agentPhone: string }>('/client');
}

export function fetchPayments() {
  return request<{ summary: PaymentSummary; payments: Payment[] }>('/clinic/payments');
}

export function recordPayment(data: {
  patientId: string;
  amount: number;
  method?: string;
  reference?: string;
  notes?: string;
  appointmentId?: string;
}) {
  return request<Payment>('/clinic/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
