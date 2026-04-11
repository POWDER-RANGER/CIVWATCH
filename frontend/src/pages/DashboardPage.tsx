import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../api/client';
import AdvancedAnalytics from '../components/AdvancedAnalytics';

interface Overview {
  documentsTotal: number;
  avgSentimentScore: number | null;
  recentAlerts: { id: string; rule_name: string; value: number; triggered_at: string }[];
}

function sentimentBadge(score: number | null) {
  if (score === null) return <span className="badge badge-neutral">N/A</span>;
  if (score > 0.1)   return <span className="badge badge-positive">Positive ({score.toFixed(3)})</span>;
  if (score < -0.1)  return <span className="badge badge-negative">Negative ({score.toFixed(3)})</span>;
  return <span className="badge badge-neutral">Neutral ({score.toFixed(3)})</span>;
}

export function DashboardPage() {
  const [overview,  setOverview]  = useState<Overview | null>(null);
  const [anomaly,   setAnomaly]   = useState<number | null>(null);
  const [trend,     setTrend]     = useState<any[]>([]);
  const [clusters,  setClusters]  = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.allSettled([
      analyticsApi.overview().then(r       => setOverview(r.data)),
      analyticsApi.anomalyScore().then(r   => setAnomaly(r.data?.score ?? null)),
      analyticsApi.trend(30).then(r        => setTrend(r.data?.points ?? [])),
      analyticsApi.clusterSummary().then(r => setClusters(r.data?.clusters ?? [])),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  const threatColor = anomaly === null ? 'var(--muted)'
    : anomaly > 0.75 ? '#e03030' : anomaly > 0.45 ? '#f0a020' : '#28a870';

  return (
    <div>
      <h2 className="page-title">Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Documents Ingested</div>
          <div className="value">{overview?.documentsTotal ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">Avg Sentiment</div>
          <div className="value" style={{ fontSize: '1.2rem', paddingTop: '.5rem' }}>
            {sentimentBadge(overview?.avgSentimentScore ?? null)}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Active Alerts</div>
          <div className="value">{overview?.recentAlerts?.length ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">Anomaly Score</div>
          <div className="value" style={{ color: threatColor, fontFamily: 'monospace' }}>
            {anomaly !== null ? anomaly.toFixed(3) : 'N/A'}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">DBSCAN Clusters</div>
          <div className="value">{clusters.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Trend Points (30d)</div>
          <div className="value">{trend.length}</div>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <AdvancedAnalytics trend={trend} clusters={clusters} anomalyScore={anomaly} />
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Recent Alert Events</h3>
        {overview?.recentAlerts?.length ? (
          <table>
            <thead><tr><th>Rule</th><th>Value</th><th>Triggered</th></tr></thead>
            <tbody>
              {overview.recentAlerts.map((a) => (
                <tr key={a.id}>
                  <td>{a.rule_name}</td>
                  <td>{a.value.toFixed(4)}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '.8rem' }}>
                    {new Date(a.triggered_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div style={{ fontSize: '2rem' }}>🔔</div>
            <p>No alerts triggered yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
