const API = import.meta.env.VITE_API_URL || 'http://localhost:3002/api/platform';
const BILLING = import.meta.env.VITE_BILLING_URL || 'http://localhost:3002/api/billing';
const BOTIQ = import.meta.env.VITE_BOTIQ_URL || 'http://localhost:5174';
const CRM = import.meta.env.VITE_CRM_URL || 'http://localhost:5175';
const WHATSAPP_API = import.meta.env.VITE_WHATSAPP_API || 'http://localhost:3002/api';

export { API, BILLING, BOTIQ, CRM, WHATSAPP_API };

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  isPlatformAdmin?: boolean;
};

export type Tenant = {
  id: string;
  slug: string;
  name: string;
  botName: string;
  plan: string;
  status: string;
  industry?: string;
  whatsappConnected?: boolean;
  whatsappNumber?: string;
  agentPhone?: string;
  isLive?: boolean;
  onboardingPending?: boolean;
  intakeSubmitted?: boolean;
  intakeStatus?: string;
  intakeSubmittedAt?: string | null;
  trialEndsAt?: string | null;
  trialEndsAtFormatted?: string | null;
  trialDaysLeft?: number | null;
  trialStarted?: boolean;
  setupStatus?: { id: string; label: string; status: 'complete' | 'current' | 'pending' }[];
  setupCurrentStep?: string;
};

export async function fetchPlatformConfig() {
  return apiGet<import('./onboarding').PlatformConfig>('/config');
}

export function saveAuth(token: string, user: AuthUser, tenant: Tenant | null) {
  localStorage.setItem('kaana_token', token);
  localStorage.setItem('kaana_user', JSON.stringify(user));
  if (tenant) localStorage.setItem('kaana_tenant', JSON.stringify(tenant));
}

export function clearAuth() {
  localStorage.removeItem('kaana_token');
  localStorage.removeItem('kaana_user');
  localStorage.removeItem('kaana_tenant');
}

export function getToken() {
  return localStorage.getItem('kaana_token');
}

// redirectToApp removed: tokens must not be passed in URLs.

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

export async function billingPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BILLING}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Payment failed');
  return data as T;
}

export type Plan = {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  customPrice?: boolean;
};

export async function fetchPlans(): Promise<Plan[]> {
  const { plans } = await apiGet<{ plans: Plan[] }>('/plans');
  return plans;
}

export type Analytics = {
  month: string;
  leadsTotal: number;
  conversationsTotal: number;
  siteVisitsBooked: number;
  botReplies: number;
  messagesSent: number;
  avgReplySeconds: number;
  conversionRate: number;
};

export async function fetchAnalytics(): Promise<Analytics> {
  return apiGet<Analytics>('/analytics');
}

export async function connectWhatsApp(payload: {
  phoneNumberId: string;
  accessToken: string;
  whatsappNumber?: string;
}) {
  return apiPatch<Tenant>('/tenant/whatsapp', payload);
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
}

export async function checkoutPlan(planId: string) {
  await loadRazorpayScript();
  const result = await billingPost<{
    demo?: boolean;
    order: { id: string; amount: number; currency: string; plan?: string };
    key: string;
    subscriptionId?: string;
  }>('/create-order', { plan: planId });

  if (result.demo) {
    await billingPost('/verify', {
      razorpay_order_id: result.order.id,
      razorpay_payment_id: `demo_${Date.now()}`,
      plan: planId,
    });
    return { ok: true, demo: true };
  }

  return new Promise<{ ok: boolean }>((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: result.key,
      amount: result.order.amount,
      currency: result.order.currency,
      order_id: result.order.id,
      name: 'Kaana',
      description: `${planId} plan`,
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        try {
          await billingPost('/verify', { ...response, plan: planId });
          resolve({ ok: true });
        } catch (e) {
          reject(e);
        }
      },
      theme: { color: '#25D366' },
    });
    rzp.open();
  });
}
