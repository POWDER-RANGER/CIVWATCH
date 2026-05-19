import React, { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket }       from 'socket.io-client';
import { anomaliesApi }     from '../api/client';
import IngestForm           from '../components/IngestForm';

interface Anomaly {
  id:           string | number;
  label?:       string;
  source?:      string;
  category?:    string;
  score?:       number;
  anomaly_score?: number;
  is_anomalous?:  boolean;
  z_score?:     number;
  flags?:       string[];
  createdAt?:   string;
  timestamp?:   string;
  data?:        unknown;
}

// Normalize field names from both legacy API shape and new ML pipeline shape
const normalize = (a: Anomaly): Anomaly => ({
  ...a,
  label:     a.label     ?? `${a.source ?? 'unknown'} / ${a.category ?? 'event'}`,
  score:     a.score     ?? a.anomaly_score ?? 0,
  createdAt: a.createdAt ?? a.timestamp    ?? new Date().toISOString(),
});

const scoreColor = (s: number) =>
  s >= 0.85 ? '#e03030' : s >= 0.60 ? '#f0a020' : '#28a870';

const SOCKET_URL = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3000';
const MAX_DISPLAYED = 200;

export default function AnomalyDashboard() {
  const [anomalies,    setAnomalies]    = useState<Anomaly[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [minScore,     setMinScore]     = useState(0.0);
  const [liveCount,    setLiveCount]    = useState(0);
  const [socketStatus, setSocketStatus] = useState<'connecting' | 'live' | 'degraded'>('connecting');
  const socketRef = useRef<Socket | null>(null);

  // ── Initial load from REST API
  const load = useCallback(() => {
    setLoading(true);
    anomaliesApi.list({ limit: 100, minScore })
      .then(r => setAnomalies((r.data?.anomalies ?? []).map(normalize)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [minScore]);

  useEffect(() => { load(); }, [load]);

  // ── WebSocket subscription — real-time push from pg LISTEN/NOTIFY
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketStatus('live');
      console.log('[AnomalyDashboard] socket connected:', socket.id);
    });

    socket.on('new_anomaly', (raw: Anomaly) => {
      const anomaly = normalize(raw);
      setAnomalies(prev => [anomaly, ...prev].slice(0, MAX_DISPLAYED));
      setLiveCount(n => n + 1);
    });

    socket.on('connect_error', (err) => {
      setSocketStatus('degraded');
      console.warn('[AnomalyDashboard] socket error — polling fallback active:', err.message);
    });

    socket.on('disconnect', () => {
      setSocketStatus('connecting');
    });

    return () => {
      socket.disconnect();
    };
  }, []); // mount once — socket lifecycle tied to page

  const filtered = anomalies.filter(a => (a.score ?? 0) >= minScore);

  return (
    <div className="page-layout">
      <div className="page-header">
        <h2 className="page-title">
          Anomaly Dashboard
          <span
            className="socket-badge"
            title={socketStatus === 'live' ? 'Real-time active' : socketStatus === 'degraded' ? 'WebSocket degraded — polling fallback' : 'Connecting…'}
            style={{
              marginLeft: '0.75rem',
              fontSize: '0.65rem',
              padding: '2px 8px',
              borderRadius: '9999px',
              background: socketStatus === 'live' ? '#0d3' : socketStatus === 'degraded' ? '#f0a020' : '#888',
              color: '#000',
              fontWeight: 700,
              verticalAlign: 'middle',
            }}
          >
            {socketStatus === 'live' ? '⬤ LIVE' : socketStatus === 'degraded' ? '⬤ DEGRADED' : '⬤ …'}
          </span>
        </h2>
        <div className="header-controls">
          {liveCount > 0 && (
            <span style={{ fontSize: '0.75rem', color: '#0d3', marginRight: '1rem' }}>
              +{liveCount} live
            </span>
          )}
          <label className="field-label inline">
            Min Score
            <input
              type="number" min={0} max={1} step={0.05}
              value={minScore}
              onChange={e => setMinScore(+e.target.value)}
              className="field-input compact"
            />
          </label>
          <button className="btn-secondary" onClick={load} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-label">Detected Anomalies ({filtered.length})</div>
          {loading && <div className="spinner" />}
          {!loading && filtered.length === 0 && (
            <div className="empty-state">No anomalies above threshold</div>
          )}
          {!loading && filtered.map((a, i) => (
            <div key={`${a.id}-${i}`} className="anomaly-row">
              <div className="anomaly-label">{a.label}</div>
              <div className="anomaly-meta">
                {a.flags && a.flags.length > 0 && (
                  <span className="anomaly-flags" style={{ fontSize: '0.65rem', color: '#aaa', marginRight: '0.5rem' }}>
                    {a.flags.join(' · ')}
                  </span>
                )}
                <span
                  className="anomaly-score"
                  style={{ color: scoreColor(a.score ?? 0) }}
                >
                  {(a.score ?? 0).toFixed(3)}
                </span>
                <span className="anomaly-ts">
                  {new Date(a.createdAt!).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="panel-label">Manual Ingest</div>
          <IngestForm onSuccess={load} />
        </div>
      </div>
    </div>
  );
}
