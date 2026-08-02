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
      // Refresh current route so any auth-gated data loads.
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

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('kaana_user');
  localStorage.removeItem('kaana_tenant');
  window.location.href = import.meta.env.VITE_PLATFORM_URL || 'http://localhost:5180/login';
}
