import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { currentMonth, todayISO } from '../lib/dates';

export type PlanParams = {
  date: string;
  month: string;
  projectId?: number;
  itemType: string;
  setDate: (date: string) => void;
  setMonth: (month: string) => void;
  setProjectId: (id?: number) => void;
  setItemType: (type: string) => void;
  planQuery: (overrides?: Record<string, string | number | undefined>) => string;
  daybookQuery: (overrides?: Record<string, string | number | undefined>) => string;
};

export function usePlanParams(options?: { fixedProjectId?: number }): PlanParams {
  const [searchParams, setSearchParams] = useSearchParams();

  const date = searchParams.get('date') || todayISO();
  const month = searchParams.get('month') || date.slice(0, 7) || currentMonth();
  const projectId = options?.fixedProjectId ?? (searchParams.get('projectId') ? Number(searchParams.get('projectId')) : undefined);
  const itemType = searchParams.get('itemType') || '';

  const patch = useCallback((updates: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === '') next.delete(k);
        else next.set(k, v);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setDate = useCallback((d: string) => {
    patch({ date: d, month: d.slice(0, 7) });
  }, [patch]);

  const setMonth = useCallback((m: string) => {
    patch({ month: m });
  }, [patch]);

  const setProjectId = useCallback((id?: number) => {
    if (options?.fixedProjectId) return;
    patch({ projectId: id ? String(id) : null });
  }, [patch, options?.fixedProjectId]);

  const setItemType = useCallback((type: string) => {
    patch({ itemType: type || null });
  }, [patch]);

  const buildQuery = useCallback((base: string, overrides?: Record<string, string | number | undefined>) => {
    const q = new URLSearchParams();
    const vals = {
      date,
      month,
      projectId: projectId ?? '',
      itemType,
      ...overrides,
    };
    for (const [k, v] of Object.entries(vals)) {
      if (v !== '' && v !== undefined && v !== null) q.set(k, String(v));
    }
    const qs = q.toString();
    return qs ? `${base}?${qs}` : base;
  }, [date, month, projectId, itemType]);

  const planQuery = useCallback((overrides?: Record<string, string | number | undefined>) => buildQuery('/plan', overrides), [buildQuery]);
  const daybookQuery = useCallback((overrides?: Record<string, string | number | undefined>) => buildQuery('/daybook', overrides), [buildQuery]);

  return useMemo(() => ({
    date, month, projectId, itemType,
    setDate, setMonth, setProjectId, setItemType,
    planQuery, daybookQuery,
  }), [date, month, projectId, itemType, setDate, setMonth, setProjectId, setItemType, planQuery, daybookQuery]);
}
