const API_BASE = (import.meta.env.VITE_CLINIC_API || '/api/platform').replace(/\/$/, '');
const TENANT_SLUG = import.meta.env.VITE_CLINIC_TENANT || 'dentacare';

export interface BookingService {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
}

export interface BookingSlotsResponse {
  date: string;
  slots: string[];
  closed?: boolean;
}

export interface BookingResult {
  ok: boolean;
  appointmentId: string;
  scheduledAt: string;
  message: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Request failed');
  }
  return data as T;
}

export function fetchBookingServices() {
  return request<{ services: BookingService[] }>(`/tenant/${TENANT_SLUG}/booking/services`);
}

export function fetchBookingSlots(date: string) {
  return request<BookingSlotsResponse>(`/tenant/${TENANT_SLUG}/booking/slots?date=${encodeURIComponent(date)}`);
}

export function submitBooking(payload: {
  name: string;
  phone: string;
  service: string;
  date: string;
  slot: string;
  notes?: string;
  website?: string;
}) {
  return request<BookingResult>(`/tenant/${TENANT_SLUG}/booking`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function minBookingDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatBookingConfirmation(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
