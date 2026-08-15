const TOKEN_KEY = 'tracker_token';

const API = import.meta.env.VITE_TRACKER_API || '/api';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return !!getToken();
}

export function isGoogleAuthEnabled() {
  const id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return Boolean(id && !id.includes('placeholder'));
}

export async function authHeaders(): Promise<HeadersInit> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function logout() {
  clearToken();
  window.location.href = '/login';
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  saveToken(data.token);
  return data;
}

export async function register(email: string, password: string, name?: string) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  saveToken(data.token);
  return data;
}

export async function loginWithGoogle(credential: string) {
  const res = await fetch(`${API}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Google sign-in failed');
  saveToken(data.token);
  return data;
}

export function authUrlWithRedirect(basePath: string, redirectUrl: string) {
  if (redirectUrl === '/') return basePath;
  return `${basePath}?redirect_url=${encodeURIComponent(redirectUrl)}`;
}

export function safeRedirectUrl(input: string | null) {
  if (!input) return '/';
  return input.startsWith('/') ? input : '/';
}
