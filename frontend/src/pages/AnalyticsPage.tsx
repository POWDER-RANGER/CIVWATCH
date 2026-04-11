import React, { useEffect, useState } from 'react';
import AdvancedAnalytics from '../components/AdvancedAnalytics';
import { analyticsApi } from '../api/client';

export function AnalyticsPage() {
  const [anomaly,  setAnomaly]  = useState<number | null>(null);
  const [trend,    setTrend]    = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.allSettled([
      analyticsApi.anomalyScore().then(r   => setAnomaly(r.data?.score ?? null)),
      analyticsApi.trend(90).then(r        => setTrend(r.data?.points ?? [])),
      analyticsApi.clusterSummary().then(r => setClusters(r.data?.clusters ?? [])),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <h2 className="page-title">Analytics</h2>
      <AdvancedAnalytics trend={trend} clusters={clusters} anomalyScore={anomaly} />
    </div>
  );
}
