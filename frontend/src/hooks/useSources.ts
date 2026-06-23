import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

export interface DataSource {
  id: string;
  name: string;
  url: string;
  category: string;
  status: 'active' | 'error' | 'paused';
  last_run: string;
  record_count: number;
  config: Record<string, any>;
}

export const useSources = () => {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchSources = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/sources');
      setSources(res.data.records || res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch sources');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const createSource = useCallback(async (data: Partial<DataSource>) => {
    const res = await api.post('/sources', data);
    setSources((prev) => [...prev, res.data]);
    return res.data;
  }, []);

  const updateSource = useCallback(async (id: string, data: Partial<DataSource>) => {
    const res = await api.patch(`/sources/${id}`, data);
    setSources((prev) => prev.map((s) => (s.id === id ? res.data : s)));
    return res.data;
  }, []);

  const deleteSource = useCallback(async (id: string) => {
    await api.delete(`/sources/${id}`);
    setSources((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const runSource = useCallback(async (id: string) => {
    const res = await api.post(`/sources/${id}/run`);
    return res.data;
  }, []);

  return {
    sources,
    loading,
    error,
    refresh: fetchSources,
    createSource,
    updateSource,
    deleteSource,
    runSource,
  };
};
