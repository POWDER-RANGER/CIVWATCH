import { useState, useEffect, useCallback } from 'react';

export interface AnomalyEvent {
  id: number;
  civic_record_id: number;
  z_score: number;
  is_anomalous: boolean;
  flags: string[];
  detected_at: string;
  recorded_at: string;
  source: string;
  category: string;
  value: number;
  raw_text: string | null;
}

interface AnomaliesResponse {
  total: number;
  limit: number;
  offset: number;
  anomalies: AnomalyEvent[];
}

interface UseAnomaliesResult {
  anomalies: AnomalyEvent[];
  total: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  sourceFilter: string;
  setSourceFilter: (source: string) => void;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export function useAnomalies(initialSource = ''): UseAnomaliesResult {
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState(initialSource);

  const fetchAnomalies = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL(`${API_BASE}/anomalies`, window.location.origin);
      if (sourceFilter) url.searchParams.set('source', sourceFilter);
      
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cw_token') || ''}`,
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json() as AnomaliesResponse;
      // Backend returns { total, limit, offset, anomalies: [...] }
      setAnomalies(Array.isArray(data.anomalies) ? data.anomalies : []);
      setTotal(data.total ?? 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setAnomalies([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [sourceFilter]);

  useEffect(() => {
    fetchAnomalies();
  }, [fetchAnomalies]);

  return { anomalies, total, loading, error, refresh: fetchAnomalies, sourceFilter, setSourceFilter };
}
