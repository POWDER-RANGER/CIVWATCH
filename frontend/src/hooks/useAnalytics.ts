import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

export interface AnalyticsOverview {
  totalDocuments: number;
  totalSources: number;
  totalAnomalies: number;
  totalAlerts: number;
  documentsByCategory: Array<{ category: string; count: number }>;
  anomalyTrend: Array<{ date: string; count: number }>;
  ingestionVolume: Array<{ date: string; count: number }>;
}

export const useAnalytics = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/analytics/overview');
      setOverview(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const getTrends = useCallback(async (days: number = 30) => {
    const res = await api.get(`/analytics/trends?days=${days}`);
    return res.data;
  }, []);

  const getSourceHealth = useCallback(async () => {
    const res = await api.get('/analytics/source-health');
    return res.data;
  }, []);

  return {
    overview,
    loading,
    error,
    refresh: fetchOverview,
    getTrends,
    getSourceHealth,
  };
};
