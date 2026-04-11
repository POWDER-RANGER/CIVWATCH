import React, { useEffect, useState, useCallback } from 'react';
import { anomaliesApi } from '../api/client';
import IngestForm from '../components/IngestForm';

interface Anomaly {
  id: string;
  label: string;
  score: number;
  createdAt: string;
  data?: unknown;
}

const scoreColor = (s: number) =>
  s >= 0.85 ? '#e03030' : s >= 0.60 ? '#f0a020' : '#28a870';

export default function AnomalyDashboard() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [minScore,  setMinScore]  = useState(0.0);

  const load = useCallback(() => {
    setLoading(true);
    anomaliesApi.list({ limit: 100, minScore })
      .then(r => setAnomalies(r.data?.anomalies ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [minScore]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="page-layout">
      <div className="page-header">
        <h2 className="page-title">Anomaly Dashboard</h2>
        <div className="header-controls">
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
          <div className="panel-label">Detected Anomalies ({anomalies.length})</div>
          {loading && <div className="spinner" />}
          {!loading && anomalies.length === 0 && (
            <div className="empty-state">No anomalies above threshold</div>
          )}
          {!loading && anomalies.map(a => (
            <div key={a.id} className="anomaly-row">
              <div className="anomaly-label">{a.label}</div>
              <div className="anomaly-meta">
                <span
                  className="anomaly-score"
                  style={{ color: scoreColor(a.score) }}
                >
                  {a.score.toFixed(3)}
                </span>
                <span className="anomaly-ts">
                  {new Date(a.createdAt).toLocaleString()}
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
