const LEGACY_TOKEN_KEY = 'tracker_token';

let tokenGetter: (() => Promise<string | null>) | null = null;

export function isClerkEnabled() {
  const key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  return Boolean(key && !key.includes('placeholder'));
}

export function setTokenGetter(fn: () => Promise<string | null>) {
  tokenGetter = fn;
}

export function getLegacyToken() {
  return localStorage.getItem(LEGACY_TOKEN_KEY);
}

export function saveLegacyToken(token: string) {
  localStorage.setItem(LEGACY_TOKEN_KEY, token);
}

export function clearLegacyToken() {
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export async function authHeaders(): Promise<HeadersInit> {
  if (tokenGetter) {
    try {
      const token = await tokenGetter();
      if (token) return { Authorization: `Bearer ${token}` };
    } catch {
      // Fall through to legacy token during migration.
    }
  }

  const legacy = getLegacyToken();
  return legacy ? { Authorization: `Bearer ${legacy}` } : {};
}

export function isLegacyAuthenticated() {
  return !!getLegacyToken();
}

export function legacyLogout() {
  clearLegacyToken();
  window.location.href = '/login';
}

const API = import.meta.env.VITE_TRACKER_API || '/api';

export async function clerkRegister(email: string, password: string) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function legacyLogin(email: string, password: string) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  saveLegacyToken(data.token);
  return data;
}
