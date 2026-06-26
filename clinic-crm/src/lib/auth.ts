const TOKEN_KEY = 'kaana_token';

export function requestSSOFromPlatform() {
  const platform = import.meta.env.VITE_PLATFORM_URL || 'http://localhost:5180';
  const targetOrigin = new URL(platform).origin;
  window.opener?.postMessage({ type: 'KAANA_SSO_REQUEST' }, targetOrigin);

  function onMessage(ev: MessageEvent) {
    if (ev.origin !== targetOrigin) return;
    const data = ev.data as unknown;
    if (!data || typeof data !== 'object') return;
    if ((data as { type?: string }).type !== 'KAANA_SSO_TOKEN') return;
    const token = (data as { token?: string }).token;
    if (typeof token === 'string' && token.length > 10) {
      localStorage.setItem(TOKEN_KEY, token);
      window.removeEventListener('message', onMessage);
      window.location.reload();
    }
  }

  window.addEventListener('message', onMessage);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function isAuthenticated() {
  return !!getAuthToken();
}

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export async function loginWithCredentials(email: string, password: string) {
  const API = import.meta.env.VITE_WHATSAPP_API || '/api';
  const base = API.replace(/\/api$/, '') || '';
  const res = await fetch(`${base}/api/platform/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Invalid email or password');
  if (!data.token) throw new Error('No token returned');
  return data.token as string;
}
