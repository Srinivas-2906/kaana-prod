import { useEffect } from 'react';
import { initAnalytics } from '../lib/analytics';

/** Loads optional Plausible / Google Analytics scripts from env vars. */
export function Analytics() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return null;
}
