declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Load Plausible or Google Analytics when env vars are set. */
export function initAnalytics() {
  const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (plausibleDomain && !document.querySelector('[data-plausible]')) {
    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = plausibleDomain;
    script.dataset.plausible = 'true';
    script.src = import.meta.env.VITE_PLAUSIBLE_SCRIPT_URL || 'https://plausible.io/js/script.js';
    document.head.appendChild(script);
  }

  if (gaId && !document.querySelector('[data-ga]')) {
    const loader = document.createElement('script');
    loader.async = true;
    loader.dataset.ga = 'true';
    loader.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(loader);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', gaId, { send_page_view: false });
  }
}

export function trackAnalyticsEvent(name: string, props?: Record<string, string>) {
  if (name === 'pageview' && typeof window.plausible === 'function') {
    window.plausible('pageview', props?.path ? { props: { path: props.path } } : undefined);
  } else if (typeof window.plausible === 'function') {
    window.plausible(name, props ? { props } : undefined);
  }
  if (typeof window.gtag === 'function') {
    if (name === 'pageview') {
      window.gtag('event', 'page_view', { page_path: props?.path || window.location.pathname });
    } else {
      window.gtag('event', name, props);
    }
  }
}
