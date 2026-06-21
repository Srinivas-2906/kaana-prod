import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'kaana-theme';

interface ThemeContextValue {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getStoredPreference(): ThemePreference {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    /* ignore */
  }
  return 'light'; // Default light — Indian SMB market is WhatsApp-familiar, light-first
}

function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === 'light') return 'light';
  if (pref === 'dark') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyToDocument(resolved: ResolvedTheme, preference: ThemePreference) {
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  root.setAttribute('data-theme-pref', preference);
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    if (typeof window === 'undefined') return 'system';
    return getStoredPreference();
  });
  const [resolved, setResolved] = useState<ResolvedTheme>(() => {
    if (typeof window === 'undefined') return 'dark';
    return resolveTheme(getStoredPreference());
  });

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    try {
      localStorage.setItem(STORAGE_KEY, pref);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const sync = () => {
      const next = resolveTheme(preference);
      setResolved(next);
      applyToDocument(next, preference);
      document.querySelector('meta[name="theme-color"]')?.setAttribute(
        'content',
        next === 'dark' ? '#0b0f19' : '#ffffff',
      );
    };
    sync();

    if (preference !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [preference]);

  return (
    <ThemeContext.Provider value={{ preference, resolved, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
