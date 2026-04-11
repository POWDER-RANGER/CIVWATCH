import { useState, useEffect, useCallback } from 'react';

export interface AnomalyEvent {
  id: number;
  timestamp: string;
  source: string;
  category: string;
  value: number;
  zScore: number;
}

interface UseAnomaliesResult {
  anomalies: AnomalyEvent[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  sourceFilter: string;
  setSourceFilter: (source: string) => void;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export function useAnomalies(initialSource = ''): UseAnomaliesResult {
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState(initialSource);

  const fetchAnomalies = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL(`${API_BASE}/anomalies`, window.location.origin);
      if (sourceFilter) url.searchParams.set('source', sourceFilter);
      
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      setAnomalies(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [sourceFilter]);

  useEffect(() => {
    fetchAnomalies();
  }, [fetchAnomalies]);

  return { anomalies, loading, error, refresh: fetchAnomalies, sourceFilter, setSourceFilter };
}
