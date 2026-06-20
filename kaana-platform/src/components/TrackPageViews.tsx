import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../lib/track';
import { trackAnalyticsEvent } from '../lib/analytics';

/** Sends anonymous page views to Kaana API + optional Plausible/GA. */
export function TrackPageViews() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname + location.search;
    trackPageView(path);
    trackAnalyticsEvent('pageview', { path });
  }, [location.pathname, location.search]);

  return null;
}
