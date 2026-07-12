import { authHeaders, clearToken } from './auth';
import type { Appointment, Patient, TodayStats, Payment, PaymentSummary, CatalogItem } from '../types';
import { resolveTenantSlug } from './tenant';

const API = import.meta.env.VITE_WHATSAPP_API || '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    const tenantSlug = resolveTenantSlug();
    res = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        ...authHeaders(),
        ...(tenantSlug ? { 'x-tenant-slug': tenantSlug } : {}),
        ...(init?.headers || {}),
      },
    });
  } catch {
    throw new Error(
      'Cannot reach the API server. Start botiq-whatsapp-server (npm run dev in botiq-whatsapp-server).',
    );
  }
  if (res.status === 401) throw new Error('Unauthorized');
  if (res.status === 403) {
    const err = await res.json().catch(() => ({}));
    const msg = (err as { error?: string }).error || res.statusText;
    if (/tenant access required/i.test(msg)) {
      clearToken();
      throw new Error('Session expired or wrong clinic account. Sign in again with your clinic login.');
    }
    throw new Error(msg);
  }
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
  serviceId?: string;
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

export function fetchMe() {
  return request<{ user: { id: string; name?: string; email?: string; username?: string; role?: string; isPlatformAdmin?: boolean } }>('/platform/me');
}

export function fetchPayments(patientId?: string) {
  const q = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  return request<{ summary: PaymentSummary; payments: Payment[] }>(`/clinic/payments${q}`);
}

export function fetchPatientPayments(patientId: string) {
  return fetchPayments(patientId);
}

export function fetchAvailableSlots(date: string) {
  return request<{ date: string; slots: string[]; hours?: { start: number; end: number; slotMin: number } }>(
    `/appointments/slots?date=${encodeURIComponent(date)}`,
  );
}

export function fetchCatalog() {
  return request<{ items: CatalogItem[] } | CatalogItem[]>('/catalog');
}

export function fetchClinicReport(from: string, to: string) {
  return request<{
    from: string;
    to: string;
    appointments: Appointment[];
    payments: Payment[];
    summary: PaymentSummary & { total: number };
  }>(`/clinic/report?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
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
