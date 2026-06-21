import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function decodeHash(hash: string) {
  try {
    return decodeURIComponent(hash);
  } catch {
    return hash;
  }
}

export function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    const hash = decodeHash(location.hash || '');
    if (hash && hash.startsWith('#')) {
      const id = hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    // On normal route changes, reset scroll.
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  return null;
}
