import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { io, Socket }       from 'socket.io-client';
import { anomaliesApi }     from '../api/client';
import IngestForm           from '../components/IngestForm';
import { AnomalyTimelineChart }    from '../components/charts/AnomalyTimelineChart';
import { ScoreDistributionChart }  from '../components/charts/ScoreDistributionChart';
import { SourceBreakdownChart }    from '../components/charts/SourceBreakdownChart';
import { buildChartModel }         from '../components/charts/chartModel';
import type { Anomaly }            from '../components/charts/chartModel';

// ── Normalize field names: handles both legacy API shape and new ML pipeline shape
const normalize = (a: Anomaly): Anomaly => ({
  ...a,
  label:     a.label     ?? `${a.source ?? 'unknown'} / ${a.category ?? 'event'}`,
  score:     a.score     ?? a.anomaly_score ?? 0,
  createdAt: a.createdAt ?? a.timestamp    ?? new Date().toISOString(),
});

const scoreColor = (s: number) =>
  s >= 0.85 ? '#ef4444' : s >= 0.60 ? '#f59e0b' : '#22c55e';

const SOCKET_URL  = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3000';
const MAX_DISPLAYED = 200;

export default function AnomalyDashboard() {
  const [anomalies,    setAnomalies]    = useState<Anomaly[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [minScore,     setMinScore]     = useState(0.0);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [liveCount,    setLiveCount]    = useState(0);
  const [socketStatus, setSocketStatus] = useState<'connecting' | 'live' | 'degraded'>('connecting');
  const socketRef = useRef<Socket | null>(null);

  // ── Initial REST load
  const load = useCallback(() => {
    setLoading(true);
    anomaliesApi.list({ limit: 100, minScore })
      .then(r => setAnomalies((r.data?.anomalies ?? []).map(normalize)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [minScore]);

  useEffect(() => { load(); }, [load]);

  // ── WebSocket subscription — real-time push via pg LISTEN/NOTIFY → socket.io
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect',       ()              => setSocketStatus('live'));
    socket.on('disconnect',    ()              => setSocketStatus('connecting'));
    socket.on('connect_error', ()              => setSocketStatus('degraded'));

    socket.on('new_anomaly', (raw: Anomaly) => {
      const a = normalize(raw);
      setAnomalies(prev => [a, ...prev].slice(0, MAX_DISPLAYED));
      setLiveCount(n => n + 1);
    });

    return () => { socket.disconnect(); };
  }, []);

  // ── Derived: apply both score + source filters
  const filtered = useMemo(() =>
    anomalies.filter(a => {
      const score  = a.score ?? 0;
      const source = a.source ?? a.label?.split(' / ')[0]?.trim() ?? 'unknown';
      return score >= minScore && (!selectedSource || source === selectedSource);
    }),
    [anomalies, minScore, selectedSource]
  );

  // ── Single shared chart model — one O(n) pass, all charts consume this
  const chartModel = useMemo(() => buildChartModel(filtered, 5), [filtered]);

  const { totals } = chartModel;

  const socketBadgeStyle: React.CSSProperties = {
    marginLeft: '0.65rem', fontSize: '0.6rem', padding: '2px 8px',
    borderRadius: '9999px', fontWeight: 700, verticalAlign: 'middle',
    background: socketStatus === 'live' ? '#16a34a' : socketStatus === 'degraded' ? '#b45309' : '#475569',
    color: '#fff',
  };

  return (
    <div className="main-content">

      {/* ── Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 className="page-title" style={{ margin: 0 }}>
          Anomaly Dashboard
          <span style={socketBadgeStyle}>
            {socketStatus === 'live' ? '⬤ LIVE' : socketStatus === 'degraded' ? '⬤ DEGRADED' : '⬤ …'}
          </span>
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {liveCount > 0 && (
            <span style={{ fontSize: '0.75rem', color: '#22c55e' }}>+{liveCount} live</span>
          )}
          {selectedSource && (
            <span className="filter-chip">
              📡 {selectedSource}
              <button
                onClick={() => setSelectedSource(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1, padding: 0 }}
                aria-label="Clear source filter"
              >×</button>
            </span>
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#94a3b8' }}>
            Min score
            <input
              type="number" min={0} max={1} step={0.05}
              value={minScore}
              onChange={e => setMinScore(+e.target.value)}
              style={{ width: 70, padding: '0.3rem 0.5rem', fontSize: '0.82rem' }}
            />
          </label>
          <button className="btn btn-ghost" onClick={load} disabled={loading} style={{ fontSize: '0.82rem' }}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── KPI cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: '1.25rem' }}>
        <div className="stat-card">
          <div className="label">Visible</div>
          <div className="value">{totals.total}</div>
        </div>
        <div className="stat-card">
          <div className="label">Avg score</div>
          <div className="value">{totals.avgScore.toFixed(3)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Critical (0.85+)</div>
          <div className="value" style={{ color: totals.critical > 0 ? '#ef4444' : '#e2e8f0' }}>{totals.critical}</div>
        </div>
        <div className="stat-card">
          <div className="label">Time buckets</div>
          <div className="value">{totals.liveWindow}</div>
        </div>
      </div>

      {/* ── Chart grid */}
      <div className="charts-grid">
        <div className="panel">
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            Timeline (5-min buckets)
          </div>
          <div className="chart-shell">
            <AnomalyTimelineChart data={chartModel.timeline} />
          </div>
        </div>

        <div className="panel">
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            Score distribution
            <span style={{ color: '#6366f1', marginLeft: '0.4rem', fontWeight: 400 }}>— click bin to filter</span>
          </div>
          <div className="chart-shell">
            <ScoreDistributionChart
              data={chartModel.scoreBins}
              selectedMinScore={minScore}
              onSelectMinScore={setMinScore}
            />
          </div>
        </div>

        <div className="panel">
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            Top sources
            <span style={{ color: '#6366f1', marginLeft: '0.4rem', fontWeight: 400 }}>— click to isolate</span>
          </div>
          <div className="chart-shell">
            <SourceBreakdownChart
              data={chartModel.sources}
              selectedSource={selectedSource}
              onSelectSource={setSelectedSource}
            />
          </div>
        </div>
      </div>

      {/* ── Anomaly list + ingest form */}
      <div className="two-col" style={{ marginTop: '1.5rem' }}>
        <div className="panel">
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            Detected anomalies ({filtered.length})
          </div>
          {loading && <div className="spinner" />}
          {!loading && filtered.length === 0 && (
            <div className="empty-state">No anomalies above threshold</div>
          )}
          {!loading && filtered.map((a, i) => (
            <div key={`${a.id}-${i}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0', borderBottom: '1px solid #2d3148' }}>
              <div style={{ fontSize: '0.88rem', color: '#e2e8f0', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {a.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0, marginLeft: '1rem' }}>
                {a.flags && a.flags.length > 0 && (
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{a.flags.join(' · ')}</span>
                )}
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: scoreColor(a.score ?? 0), fontVariantNumeric: 'tabular-nums' }}>
                  {(a.score ?? 0).toFixed(3)}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {new Date(a.createdAt!).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="panel">
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Manual Ingest</div>
          <IngestForm onSuccess={load} />
        </div>
      </div>
    </div>
  );
}
