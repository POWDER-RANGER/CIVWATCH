import { useState, useEffect, useCallback } from 'react';

interface AnomalyDataState {
  data: unknown[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

/**
 * Electron-aware data hook.
 *
 * In Electron: uses IPC bridge (window.api) — no HTTP, no CORS.
 * In browser: falls back to direct HTTP fetch against localhost.
 *
 * This dual-mode pattern lets the same React component tree run
 * inside Electron and as a standalone web app without modification.
 */
export function useAnomalyData() {
  const [state, setState] = useState<AnomalyDataState>({
    data: [],
    loading: false,
    error: null,
    lastFetched: null,
  });

  const isElectron = typeof window !== 'undefined' && 'api' in window;

  const fetchAnomalies = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = isElectron
        ? await window.api.getAnomalies()
        : await fetch('http://localhost:3000/api/anomalies').then((r) => r.json());

      setState({ data, loading: false, error: null, lastFetched: Date.now() });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown fetch error',
      }));
    }
  }, [isElectron]);

  const postReport = useCallback(
    async (payload: unknown) => {
      try {
        return isElectron
          ? await window.api.postReport(payload)
          : await fetch('http://localhost:3000/reports', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            }).then((r) => r.json());
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Report submission failed');
      }
    },
    [isElectron]
  );

  const getHeatmap = useCallback(async () => {
    return isElectron
      ? await window.api.getHeatmap()
      : await fetch('http://localhost:3000/heatmap').then((r) => r.json());
  }, [isElectron]);

  const getTrends = useCallback(async () => {
    return isElectron
      ? await window.api.getTrends()
      : await fetch('http://localhost:3000/trends').then((r) => r.json());
  }, [isElectron]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchAnomalies();
  }, [fetchAnomalies]);

  return {
    ...state,
    isElectron,
    fetchAnomalies,
    postReport,
    getHeatmap,
    getTrends,
  };
}
