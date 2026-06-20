import { BOTIQ, CRM, getToken } from './api';

type AppKey = 'botiq' | 'crm';

function appUrl(app: AppKey) {
  return app === 'botiq' ? BOTIQ : CRM;
}

function originOf(url: string) {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
}

/**
 * Opens BotIQ/CRM without leaking JWT in the URL.
 * Flow:
 * - Platform opens app in a new tab.
 * - App asks for auth via postMessage.
 * - Platform replies once with the token (targetOrigin locked).
 *
 * NOTE: This is a pragmatic stopgap for separate frontends. Long-term, use
 * httpOnly cookies or a backend-issued one-time SSO code.
 */
export function openAppWithSSO(app: AppKey) {
  const token = getToken();
  if (!token) {
    window.location.href = '/login';
    return;
  }

  const url = appUrl(app);
  const targetOrigin = originOf(url);
  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  if (!opened) {
    // Popup blocked: fall back to direct nav (still without query token).
    window.location.href = url;
    return;
  }
  const w = opened;

  const timeout = window.setTimeout(() => {
    window.removeEventListener('message', onMessage);
  }, 12_000);

  function onMessage(ev: MessageEvent) {
    if (!targetOrigin || ev.origin !== targetOrigin) return;
    const data = ev.data as unknown;
    if (!data || typeof data !== 'object') return;
    if ((data as { type?: string }).type !== 'KAANA_SSO_REQUEST') return;

    window.clearTimeout(timeout);
    window.removeEventListener('message', onMessage);

    try {
      if (!w.closed) w.postMessage({ type: 'KAANA_SSO_TOKEN', token }, targetOrigin);
    } catch {
      // If postMessage fails, user can still log in from app.
    }
  }

  window.addEventListener('message', onMessage);

  // Best-effort: if the child is ready quickly, request will arrive; otherwise
  // user can still manually log in from the opened app.
}

