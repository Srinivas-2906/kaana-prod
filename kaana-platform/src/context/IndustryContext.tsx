import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { DEFAULT_INDUSTRY, getIndustry, type IndustryId } from '../data/industries';

interface IndustryContextValue {
  industryId: IndustryId;
  industry: ReturnType<typeof getIndustry>;
  setIndustryId: (id: IndustryId) => void;
}

const IndustryContext = createContext<IndustryContextValue | null>(null);

export function IndustryProvider({ children }: { children: ReactNode }) {
  const [industryId, setIndustryIdState] = useState<IndustryId>(DEFAULT_INDUSTRY);
  const setIndustryId = useCallback((id: IndustryId) => setIndustryIdState(id), []);
  const industry = getIndustry(industryId);

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<IndustryId>).detail;
      if (id) setIndustryIdState(id);
    };
    window.addEventListener('kaana-industry', handler);
    return () => window.removeEventListener('kaana-industry', handler);
  }, []);

  return (
    <IndustryContext.Provider value={{ industryId, industry, setIndustryId }}>
      {children}
    </IndustryContext.Provider>
  );
}

export function useIndustry() {
  const ctx = useContext(IndustryContext);
  if (!ctx) throw new Error('useIndustry must be used within IndustryProvider');
  return ctx;
}
