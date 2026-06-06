/**
 * InsightsPanel
 *
 * Displays engine insights returned by GET /ml/insights.
 * Polls every 30 s automatically; also accepts a manual refresh trigger
 * so the dashboard can force a refresh after new anomalies arrive via socket.
 *
 * Severity colour coding:
 *   critical  → red border + icon
 *   high      → orange
 *   medium    → yellow
 *   low       → slate
 *
 * Insight types surfaced by CivWatchEngine:
 *   anomaly_spike   → 🚨
 *   trend_shift     → 📈
 *   sentiment_surge → 💬
 *   cluster_outlier → 🔍
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { mlApi } from '../api/client';

export type Insight = {
  insight_type:     string;
  severity:         'low' | 'medium' | 'high' | 'critical';
  affected_sources: string[];
  description:      string;
  score_delta:      number;
  detected_at:      string;
};

const SEVERITY_STYLES: Record<string, React.CSSProperties> = {
  critical: { borderLeft: '3px solid #ef4444', background: 'rgba(239,68,68,0.07)' },
  high:     { borderLeft: '3px solid #f59e0b', background: 'rgba(245,158,11,0.07)' },
  medium:   { borderLeft: '3px solid #eab308', background: 'rgba(234,179,8,0.06)'  },
  low:      { borderLeft: '3px solid #475569', background: 'rgba(71,85,105,0.06)'  },
};

const SEVERITY_LABEL: Record<string, React.CSSProperties> = {
  critical: { color: '#ef4444' },
  high:     { color: '#f59e0b' },
  medium:   { color: '#eab308' },
  low:      { color: '#94a3b8' },
};

const TYPE_ICON: Record<string, string> = {
  anomaly_spike:   '🚨',
  trend_shift:     '📈',
  sentiment_surge: '💬',
  cluster_outlier: '🔍',
};

const POLL_MS = 30_000;

interface Props {
  /** Increment to force an immediate re-fetch (e.g. after a live socket push). */
  refreshToken?: number;
}

export function InsightsPanel({ refreshToken = 0 }: Props) {
  const [insights,    setInsights]    = useState<Insight[]>([]);
  const [backend,     setBackend]     = useState<string>('');
  const [historySize, setHistorySize] = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = useCallback(() => {
    mlApi.insights()
      .then(r => {
        setInsights(r.data?.insights ?? []);
        setBackend(r.data?.backend ?? '');
        setHistorySize(r.data?.history_size ?? 0);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // Trigger on mount, poll interval, and external refreshToken changes
  useEffect(() => {
    fetch();
    timerRef.current = setInterval(fetch, POLL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetch]);

  useEffect(() => {
    if (refreshToken > 0) fetch();
  }, [refreshToken, fetch]);

  const panelLabel: React.CSSProperties = {
    fontSize: '0.75rem', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    marginBottom: '0.75rem',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  };

  return (
    <div className="panel" style={{ marginTop: '1rem' }}>
      <div style={panelLabel}>
        <span>
          Engine Insights
          {backend && (
            <span style={{ marginLeft: '0.5rem', color: '#6366f1', fontSize: '0.7rem', fontWeight: 400 }}>
              [{backend}]
            </span>
          )}
        </span>
        <span style={{ color: '#475569', fontSize: '0.7rem', fontWeight: 400 }}>
          {historySize > 0 ? `${historySize}-record window · ` : ''}
          auto-refresh 30s
        </span>
      </div>

      {loading && <div className="spinner" />}

      {!loading && error && (
        <div className="empty-state" style={{ padding: '1.5rem 0' }}>
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <p>ML service unreachable — insights unavailable</p>
        </div>
      )}

      {!loading && !error && insights.length === 0 && (
        <div className="empty-state" style={{ padding: '1.5rem 0' }}>
          <span style={{ fontSize: '1.25rem' }}>📄</span>
          <p>No insights yet — waiting for history window to fill (20+ records)</p>
        </div>
      )}

      {!loading && !error && insights.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {insights.map((ins, i) => (
            <div
              key={i}
              style={{
                ...SEVERITY_STYLES[ins.severity] ?? SEVERITY_STYLES.low,
                borderRadius: '6px',
                padding: '0.65rem 0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '0.82rem', marginRight: '0.4rem' }}>
                    {TYPE_ICON[ins.insight_type] ?? '🔔'}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}>
                    {ins.description}
                  </span>
                </div>
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
                  <span style={{ ...SEVERITY_LABEL[ins.severity], fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    {ins.severity}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#475569', fontVariantNumeric: 'tabular-nums' }}>
                    Δ{ins.score_delta >= 0 ? '+' : ''}{ins.score_delta.toFixed(3)}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {ins.affected_sources.slice(0, 4).map(src => (
                  <span
                    key={src}
                    style={{
                      fontSize: '0.68rem', padding: '1px 7px',
                      borderRadius: '9999px', background: '#1e1b4b',
                      border: '1px solid #3730a3', color: '#a5b4fc',
                    }}
                  >
                    {src.length > 18 ? `${src.slice(0, 17)}…` : src}
                  </span>
                ))}
                {ins.affected_sources.length > 4 && (
                  <span style={{ fontSize: '0.68rem', color: '#475569' }}>
                    +{ins.affected_sources.length - 4} more
                  </span>
                )}
                <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: '#475569' }}>
                  {new Date(ins.detected_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
