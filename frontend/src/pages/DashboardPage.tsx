import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../api/client';

interface Overview {
  documentsTotal: number;
  avgSentimentScore: number | null;
  recentAlerts: { id: string; rule_name: string; value: number; triggered_at: string }[];
}

function sentimentBadge(score: number | null) {
  if (score === null) return <span className="badge badge-neutral">N/A</span>;
  if (score > 0.1)  return <span className="badge badge-positive">Positive ({score.toFixed(3)})</span>;
  if (score < -0.1) return <span className="badge badge-negative">Negative ({score.toFixed(3)})</span>;
  return <span className="badge badge-neutral">Neutral ({score.toFixed(3)})</span>;
}

export function DashboardPage() {
  const [data, setData]       = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.overview()
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <h2 className="page-title">Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Documents Ingested</div>
          <div className="value">{data?.documentsTotal ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">Avg Sentiment</div>
          <div className="value" style={{ fontSize: '1.2rem', paddingTop: '.5rem' }}>
            {sentimentBadge(data?.avgSentimentScore ?? null)}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Recent Alerts</div>
          <div className="value">{data?.recentAlerts?.length ?? 0}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Recent Alert Events</h3>
        {data?.recentAlerts?.length ? (
          <table>
            <thead><tr>
              <th>Rule</th><th>Value</th><th>Triggered</th>
            </tr></thead>
            <tbody>
              {data.recentAlerts.map((a) => (
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
            <p>No alerts triggered yet. Add sources and configure alert rules.</p>
          </div>
        )}
      </div>
    </div>
  );
}
