import React, { useEffect, useState } from 'react';
import { analyticsApi, anomaliesApi, alertsApi } from '../api/client';
import { Link } from 'react-router-dom';

interface SourceBreakdown {
  source: string;
  count: number;
}

interface RecentRecord {
  id: string;
  source: string;
  content: string;
  created_at: string;
  score: number | null;
  label: string;
}

interface AlertEvent {
  id: string;
  rule_name: string;
  value: number;
  triggered_at: string;
}

export function DashboardPage() {
  const [overview,       setOverview]       = useState<any>(null);
  const [anomalyStats,   setAnomalyStats]   = useState<any>(null);
  const [trend,          setTrend]          = useState<any[]>([]);
  const [sources,        setSources]        = useState<SourceBreakdown[]>([]);
  const [recentAlerts,   setRecentAlerts]   = useState<AlertEvent[]>([]);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    Promise.allSettled([
      analyticsApi.overview().then(r => setOverview(r.data)),
      anomaliesApi.stats().then(r => setAnomalyStats(r.data)),
      analyticsApi.trends(30).then(r => setTrend(r.data?.trends ?? [])),
      analyticsApi.sources().then(r => setSources(r.data?.sources ?? [])),
      alertsApi.recent().then(r => setRecentAlerts(r.data?.alerts ?? [])),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <div className="spinner" />
    </div>
  );

  const threatColor = !anomalyStats?.avg_score ? 'var(--muted)'
    : parseFloat(anomalyStats.avg_score) > 0.75 ? '#e03030'
    : parseFloat(anomalyStats.avg_score) > 0.45 ? '#f0a020'
    : '#28a870';

  return (
    <div>
      <h2 className="page-title">CIVWATCH Dashboard</h2>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Records Ingested</div>
          <div className="value">{overview?.total_records ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">Anomalies Detected</div>
          <div className="value" style={{ color: anomalyStats?.last_24h > 0 ? '#e03030' : '#e2e8f0' }}>
            {anomalyStats?.total_anomalies ?? 0}
          </div>
          {anomalyStats?.last_24h > 0 && (
            <div style={{ fontSize: '0.75rem', color: '#e03030' }}>
              +{anomalyStats.last_24h} in 24h
            </div>
          )}
        </div>
        <div className="stat-card">
          <div className="label">Avg Anomaly Score</div>
          <div className="value" style={{ color: threatColor, fontFamily: 'monospace' }}>
            {anomalyStats?.avg_score ? parseFloat(anomalyStats.avg_score).toFixed(4) : 'N/A'}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Data Sources</div>
          <div className="value">{sources.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Trend Points (30d)</div>
          <div className="value">{trend.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Max Score</div>
          <div className="value" style={{ color: '#e03030', fontFamily: 'monospace' }}>
            {anomalyStats?.max_score ? parseFloat(anomalyStats.max_score).toFixed(4) : 'N/A'}
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        {/* Top Sources */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            Top Sources
            <Link to="/sources" style={{ fontSize: '0.8rem', fontWeight: 400 }}>View all →</Link>
          </h3>
          {sources.length > 0 ? (
            <table style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Source</th>
                  <th style={{ textAlign: 'right' }}>Records</th>
                  <th style={{ textAlign: 'right' }}>Anomalies</th>
                </tr>
              </thead>
              <tbody>
                {sources.slice(0, 8).map((s: any) => (
                  <tr key={s.source}>
                    <td>{s.source}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{s.total_records}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: s.anomaly_count > 0 ? '#e03030' : 'inherit' }}>
                      {s.anomaly_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">No data sources yet. <Link to="/sources">Add one →</Link></div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            Recent Activity
            <Link to="/anomalies" style={{ fontSize: '0.8rem', fontWeight: 400 }}>View all →</Link>
          </h3>
          {overview?.recent_activity?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {overview.recent_activity.slice(0, 8).map((r: RecentRecord) => (
                <div key={r.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.5rem', borderRadius: '0.375rem', background: '#1a1d2e',
                }}>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.content?.substring(0, 60) || 'Untitled record'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{r.source}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {r.score !== null && (
                      <div style={{
                        fontSize: '0.8rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums',
                        color: r.score > 0.75 ? '#e03030' : r.score > 0.5 ? '#f0a020' : '#28a870'
                      }}>
                        {r.score.toFixed(3)}
                      </div>
                    )}
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No records ingested yet.</div>
          )}
        </div>
      </div>

      {/* Trend Chart Placeholder */}
      {trend.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>30-Day Trend</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '120px', padding: '0.5rem 0' }}>
            {trend.map((t: any, i: number) => {
              const maxTotal = Math.max(...trend.map((x: any) => x.total || 1));
              const height = ((t.total || 0) / maxTotal) * 100;
              const isAnomalous = (t.anomalies || 0) > 0;
              return (
                <div key={i} style={{
                  flex: 1,
                  height: `${height}%`,
                  background: isAnomalous ? '#e03030' : '#3b82f6',
                  borderRadius: '2px 2px 0 0',
                  minWidth: '4px',
                  opacity: 0.8,
                  transition: 'height 0.3s ease',
                }} title={`${t.day}: ${t.total} records, ${t.anomalies} anomalies`} />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748b', marginTop: '0.5rem' }}>
            <span>{trend[0]?.day}</span>
            <span>{trend[trend.length - 1]?.day}</span>
          </div>
        </div>
      )}
    </div>
  );
}
