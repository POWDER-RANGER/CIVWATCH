import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

export interface AlertRule {
  id: string;
  name: string;
  source_category: string;
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'contains';
  threshold: number | string;
  channel: 'email' | 'webhook' | 'websocket' | 'all';
  enabled: boolean;
  created_at: string;
}

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data.records || res.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const createAlert = useCallback(async (data: Partial<AlertRule>) => {
    const res = await api.post('/alerts', data);
    setAlerts((prev) => [...prev, res.data]);
    return res.data;
  }, []);

  const updateAlert = useCallback(async (id: string, data: Partial<AlertRule>) => {
    const res = await api.patch(`/alerts/${id}`, data);
    setAlerts((prev) => prev.map((a) => (a.id === id ? res.data : a)));
    return res.data;
  }, []);

  const deleteAlert = useCallback(async (id: string) => {
    await api.delete(`/alerts/${id}`);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const toggleAlert = useCallback(async (id: string) => {
    const alert = alerts.find((a) => a.id === id);
    if (!alert) return;
    const res = await api.patch(`/alerts/${id}`, { enabled: !alert.enabled });
    setAlerts((prev) => prev.map((a) => (a.id === id ? res.data : a)));
  }, [alerts]);

  return {
    alerts,
    loading,
    refresh: fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlert,
  };
};
