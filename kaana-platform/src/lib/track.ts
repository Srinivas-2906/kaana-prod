import { API } from './api';

export function trackEvent(event: string, path: string, meta?: Record<string, unknown>) {
  fetch(`${API}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event,
      path,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      meta,
    }),
    keepalive: true,
  }).catch(() => {});
}

export function trackPageView(path: string) {
  trackEvent('pageview', path);
}
