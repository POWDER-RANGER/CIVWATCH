import React, { useEffect, useState } from 'react';
import { analyticsApi, anomaliesApi } from '../api/client';

interface TrendPoint {
  day: string;
  total: number;
  anomalies: number;
}

interface SourceStat {
  source: string;
  total_records: number;
  anomaly_count: number;
}

export function AnalyticsPage() {
  const [trend,      setTrend]      = useState<TrendPoint[]>([]);
  const [heatmap,    setHeatmap]    = useState<SourceStat[]>([]);
  const [stats,      setStats]      = useState<any>(null);
  const [timeRange,  setTimeRange]  = useState(30);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      analyticsApi.trends(timeRange).then(r => setTrend(r.data?.trends ?? [])),
      analyticsApi.heatmap().then(r => setHeatmap(r.data?.heatmap ?? [])),
      anomaliesApi.stats().then(r => setStats(r.data)),
    ]).finally(() => setLoading(false));
  }, [timeRange]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <div className="spinner" />
    </div>
  );

  const maxTotal = Math.max(...trend.map(t => t.total || 1), 1);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 className="page-title" style={{ margin: 0 }}>Analytics</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[7, 30, 90].map(days => (
            <button
              key={days}
              className={`btn ${timeRange === days ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTimeRange(days)}
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="label">Total Records</div>
          <div className="value">{stats?.total_anomalies > 0 ? '—' : (heatmap.reduce((a, s) => a + s.total_records, 0))}</div>
        </div>
        <div className="stat-card">
          <div className="label">Anomalies</div>
          <div className="value" style={{ color: '#e03030' }}>
            {stats?.total_anomalies ?? heatmap.reduce((a, s) => a + s.anomaly_count, 0)}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Avg Score</div>
          <div className="value" style={{ fontFamily: 'monospace' }}>
            {stats?.avg_score ? parseFloat(stats.avg_score).toFixed(4) : 'N/A'}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Data Sources</div>
          <div className="value">{heatmap.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Trend Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
            Activity Trend ({timeRange} days)
          </h3>
          {trend.length > 0 ? (
            <>
              <div style={{
                display: 'flex', alignItems: 'flex-end', gap: '2px',
                height: '160px', padding: '0.5rem 0',
              }}>
                {trend.map((t, i) => {
                  const height = ((t.total || 0) / maxTotal) * 100;
                  const hasAnomaly = (t.anomalies || 0) > 0;
                  return (
                    <div key={i} style={{
                      flex: 1, height: `${Math.max(height, 2)}%`,
                      background: hasAnomaly
                        ? `linear-gradient(to top, #e03030, #f0a020)`
                        : '#3b82f6',
                      borderRadius: '2px 2px 0 0',
                      minWidth: '3px',
                      opacity: 0.85,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }} title={`${t.day}: ${t.total} records, ${t.anomalies} anomalies`} />
                  );
                })}
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: '0.65rem', color: '#64748b', marginTop: '0.5rem',
              }}>
                <span>{trend[0]?.day}</span>
                <span>{trend[trend.length - 1]?.day}</span>
              </div>
            </>
          ) : (
            <div className="empty-state">No trend data for this period.</div>
          )}
        </div>

        {/* Source Heatmap */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Source Breakdown</h3>
          {heatmap.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {heatmap.slice(0, 12).map((s, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.4rem 0.6rem', borderRadius: '0.375rem',
                  background: i % 2 === 0 ? '#1a1d2e' : 'transparent',
                }}>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{
                      fontSize: '0.8rem', fontWeight: 500,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {s.source}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                      {s.total_records} records
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.85rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums',
                    color: s.anomaly_count > 0 ? '#e03030' : '#64748b',
                  }}>
                    {s.anomaly_count > 0 && '+'}{s.anomaly_count}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No source data yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
