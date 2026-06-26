import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { alertsApi, analyticsApi, anomaliesApi, mlApi } from '../api/client';

type Mode = 'all' | 'awareness' | 'transparency';

type TrendPoint = {
  day: string;
  total?: number;
  anomalies?: number;
};

type SourceRow = {
  source: string;
  total_records?: number;
  anomaly_count?: number;
  freshness_minutes?: number | null;
  jurisdiction?: string;
};

type AlertRow = {
  id: string;
  rule_name: string;
  value: number;
  triggered_at: string;
};

type ActivityRow = {
  id: string;
  source: string;
  content: string;
  created_at: string;
  score: number | null;
  label: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function scoreColor(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'var(--muted, #94a3b8)';
  if (value >= 0.75) return '#ef4444';
  if (value >= 0.5) return '#f59e0b';
  return '#22c55e';
}

function formatNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return '0';
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat().format(n);
}

function formatPct(value?: number | string | null) {
  if (value === null || value === undefined || value === '') return 'N/A';
  const n = Number(value);
  if (Number.isNaN(n)) return 'N/A';
  return `${(n * 100).toFixed(1)}%`;
}

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function Panel({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="card" style={{ height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', letterSpacing: '-0.02em' }}>{title}</h3>
          {subtitle ? <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: 'var(--muted, #94a3b8)' }}>{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function MetricCard({ label, value, detail, tone = 'neutral' }: { label: string; value: React.ReactNode; detail?: React.ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' }) {
  const borderColor = tone === 'good' ? 'rgba(34,197,94,0.35)' : tone === 'warn' ? 'rgba(245,158,11,0.35)' : tone === 'bad' ? 'rgba(239,68,68,0.35)' : 'rgba(148,163,184,0.18)';
  return (
    <div className="card" style={{ borderColor, minHeight: '100%' }}>
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted, #94a3b8)' }}>{label}</div>
      <div style={{ marginTop: '0.55rem', fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
      {detail ? <div style={{ marginTop: '0.45rem', fontSize: '0.8rem', color: 'var(--muted, #94a3b8)' }}>{detail}</div> : null}
    </div>
  );
}

export function MasterDashboardPage() {
  const [mode, setMode] = useState<Mode>('all');
  const [overview, setOverview] = useState<any>(null);
  const [anomalyStats, setAnomalyStats] = useState<any>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<AlertRow[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityRow[]>([]);
  const [mlStatus, setMlStatus] = useState<{ health?: string; ready?: boolean; insights?: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    Promise.allSettled([
      analyticsApi.overview(),
      anomaliesApi.stats(),
      analyticsApi.trends(30),
      analyticsApi.sources(),
      alertsApi.recent(),
      mlApi.health(),
      mlApi.ready(),
      mlApi.insights(),
    ])
      .then((results) => {
        if (!alive) return;

        const [overviewR, statsR, trendR, sourcesR, alertsR, healthR, readyR, insightsR] = results;

        if (overviewR.status === 'fulfilled') {
          setOverview(overviewR.value.data);
          setRecentActivity(overviewR.value.data?.recent_activity ?? []);
        }
        if (statsR.status === 'fulfilled') setAnomalyStats(statsR.value.data);
        if (trendR.status === 'fulfilled') setTrend(trendR.value.data?.trends ?? []);
        if (sourcesR.status === 'fulfilled') setSources(sourcesR.value.data?.sources ?? []);
        if (alertsR.status === 'fulfilled') setRecentAlerts(alertsR.value.data?.alerts ?? []);

        setMlStatus({
          health: healthR.status === 'fulfilled' ? String(healthR.value.data?.status ?? 'unknown') : 'down',
          ready: readyR.status === 'fulfilled' ? Boolean(readyR.value.data?.ready ?? true) : false,
          insights: insightsR.status === 'fulfilled' ? (Array.isArray(insightsR.value.data?.insights) ? insightsR.value.data.insights : []) : [],
        });
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const maxTrend = useMemo(() => {
    return Math.max(1, ...trend.map((p) => toNumber(p.total, 0)));
  }, [trend]);

  const totalRecords = toNumber(overview?.total_records, 0);
  const anomalyTotal = toNumber(anomalyStats?.total_anomalies, 0);
  const anomalyRate = totalRecords > 0 ? anomalyTotal / totalRecords : 0;
  const avgScore = anomalyStats?.avg_score === undefined || anomalyStats?.avg_score === null ? null : Number(anomalyStats.avg_score);
  const maxScore = anomalyStats?.max_score === undefined || anomalyStats?.max_score === null ? null : Number(anomalyStats.max_score);
  const topSource = sources[0];
  const trustIndex = clamp(1 - anomalyRate * 2 + (avgScore !== null ? (1 - avgScore) * 0.25 : 0), 0, 1);

  const filteredSources = useMemo(() => {
    if (mode === 'all') return sources;
    if (mode === 'awareness') {
      return sources.filter((s) => /alert|weather|hazard|incident|sensor|emergency/i.test(s.source) || (s.jurisdiction ?? '').length > 0);
    }
    return sources.filter((s) => /fec|lobby|vote|bill|contract|finance|legis|polit/i.test(s.source));
  }, [mode, sources]);

  const filteredAlerts = useMemo(() => {
    if (mode === 'all') return recentAlerts;
    if (mode === 'awareness') return recentAlerts.filter((a) => /alert|anomal|hazard|geo|weather|safety/i.test(a.rule_name));
    return recentAlerts.filter((a) => /finance|vote|lobby|contract|policy|ethic|disclosure/i.test(a.rule_name));
  }, [mode, recentAlerts]);

  const filteredActivity = useMemo(() => {
    if (mode === 'all') return recentActivity;
    if (mode === 'awareness') return recentActivity.filter((r) => /alert|weather|hazard|incident|sensor|public safety/i.test(`${r.source} ${r.content} ${r.label}`));
    return recentActivity.filter((r) => /finance|lobby|vote|bill|contract|policy|transparency/i.test(`${r.source} ${r.content} ${r.label}`));
  }, [mode, recentActivity]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(13,17,23,1) 0%, rgba(14,31,30,1) 45%, rgba(8,20,40,1) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted, #94a3b8)' }}>Civwatch master dashboard</div>
            <h1 style={{ margin: '0.35rem 0 0', fontSize: '2rem', lineHeight: 1.05 }}>Shared core. Two operating modes. One audit trail.</h1>
            <p style={{ margin: '0.7rem 0 0', maxWidth: '72ch', color: 'var(--muted, #94a3b8)', lineHeight: 1.6 }}>
              Unified command surface for awareness telemetry, political transparency, provenance, moderation status, and jurisdiction-aware drilldown.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div style={{ display: 'inline-flex', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 999, overflow: 'hidden' }}>
              {(['all', 'awareness', 'transparency'] as Mode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  style={{
                    padding: '0.55rem 0.9rem',
                    border: 'none',
                    cursor: 'pointer',
                    background: mode === item ? 'rgba(34,197,94,0.18)' : 'transparent',
                    color: 'inherit',
                    fontSize: '0.85rem',
                    textTransform: 'capitalize',
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted, #94a3b8)' }}>
              Trust index: <strong style={{ color: scoreColor(1 - trustIndex) }}>{formatPct(trustIndex)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem' }}>
        <MetricCard label="Records ingested" value={formatNumber(totalRecords)} detail="Canonical event count across all feeds" tone="neutral" />
        <MetricCard label="Anomalies" value={formatNumber(anomalyTotal)} detail={`Last 24h: ${formatNumber(anomalyStats?.last_24h ?? 0)}`} tone={anomalyTotal > 0 ? 'warn' : 'good'} />
        <MetricCard label="Average score" value={avgScore !== null ? avgScore.toFixed(4) : 'N/A'} detail={maxScore !== null ? `Max score: ${maxScore.toFixed(4)}` : 'No score data'} tone={avgScore !== null && avgScore > 0.75 ? 'bad' : avgScore !== null && avgScore > 0.45 ? 'warn' : 'good'} />
        <MetricCard label="Data sources" value={formatNumber(filteredSources.length)} detail={topSource ? `Top source: ${topSource.source}` : 'No source ranking available'} tone="neutral" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        <Panel
          title="Live signal shape"
          subtitle="30-day ingestion and anomaly contour"
          action={<Link to="/analytics" style={{ fontSize: '0.85rem' }}>Full analytics →</Link>}
        >
          {trend.length > 0 ? (
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="rgba(148,163,184,0.35)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="rgba(148,163,184,0.35)" />
                  <Tooltip />
                  <Area type="monotone" dataKey="total" stroke="#22c55e" fill="rgba(34,197,94,0.18)" strokeWidth={2} />
                  <Area type="monotone" dataKey="anomalies" stroke="#ef4444" fill="rgba(239,68,68,0.14)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">No trend data available.</div>
          )}
        </Panel>

        <Panel
          title="Control-plane status"
          subtitle="ML readiness and operational posture"
          action={<Link to="/admin" style={{ fontSize: '0.85rem' }}>Admin →</Link>}
        >
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.8rem 0.9rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)' }}>
              <span>ML health</span>
              <strong style={{ color: mlStatus?.health === 'healthy' ? '#22c55e' : '#f59e0b' }}>{mlStatus?.health ?? 'unknown'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.8rem 0.9rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)' }}>
              <span>Inference ready</span>
              <strong style={{ color: mlStatus?.ready ? '#22c55e' : '#ef4444' }}>{mlStatus?.ready ? 'yes' : 'no'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.8rem 0.9rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)' }}>
              <span>Jurisdiction filter</span>
              <strong>{mode === 'all' ? 'global' : mode}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.8rem 0.9rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)' }}>
              <span>Recent alerts</span>
              <strong>{formatNumber(filteredAlerts.length)}</strong>
            </div>
          </div>
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
        <Panel title="Awareness lane" subtitle="Situational awareness, incident flow, and live alerting" action={<Link to="/alerts" style={{ fontSize: '0.85rem' }}>Alerts →</Link>}>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.85rem', borderRadius: '0.8rem', background: 'rgba(34,197,94,0.08)' }}>
              <span>Signal coverage</span>
              <strong>{mode === 'awareness' ? 'focused' : 'shared'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.85rem', borderRadius: '0.8rem', background: 'rgba(34,197,94,0.08)' }}>
              <span>Detected sources</span>
              <strong>{formatNumber(filteredSources.filter((s) => /alert|weather|hazard|incident|sensor|emergency/i.test(s.source)).length)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.85rem', borderRadius: '0.8rem', background: 'rgba(34,197,94,0.08)' }}>
              <span>Recent alert rules</span>
              <strong>{formatNumber(filteredAlerts.length)}</strong>
            </div>
            <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.25rem' }}>
              {filteredAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.75rem 0.85rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.rule_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted, #94a3b8)' }}>{new Date(alert.triggered_at).toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: scoreColor(alert.value) }}>
                    {alert.value.toFixed(3)}
                  </div>
                </div>
              ))}
              {filteredAlerts.length === 0 ? <div className="empty-state">No alert records matched the current mode.</div> : null}
            </div>
          </div>
        </Panel>

        <Panel title="Transparency lane" subtitle="Political finance, disclosure, and influence signals" action={<Link to="/campaign-finance" style={{ fontSize: '0.85rem' }}>Finance →</Link>}>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.85rem', borderRadius: '0.8rem', background: 'rgba(59,130,246,0.08)' }}>
              <span>Coverage state</span>
              <strong>{mode === 'transparency' ? 'focused' : 'shared'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.85rem', borderRadius: '0.8rem', background: 'rgba(59,130,246,0.08)' }}>
              <span>Influence surface</span>
              <strong>{formatNumber(sources.filter((s) => /fec|lobby|vote|bill|contract|finance|legis|polit/i.test(s.source)).length)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.85rem', borderRadius: '0.8rem', background: 'rgba(59,130,246,0.08)' }}>
              <span>Audit readiness</span>
              <strong>{formatPct(trustIndex)}</strong>
            </div>
            <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.25rem' }}>
              {filteredActivity.slice(0, 5).map((row) => (
                <div key={row.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.75rem 0.85rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.content?.slice(0, 72) || 'Untitled record'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted, #94a3b8)' }}>{row.source}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {row.score !== null ? (
                      <div style={{ fontVariantNumeric: 'tabular-nums', color: scoreColor(row.score) }}>{row.score.toFixed(3)}</div>
                    ) : null}
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted, #94a3b8)' }}>{new Date(row.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
              {filteredActivity.length === 0 ? <div className="empty-state">No records matched the current mode.</div> : null}
            </div>
          </div>
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
        <Panel title="Source trust and freshness" subtitle="Operational priority ordering for ingestion and review" action={<Link to="/sources" style={{ fontSize: '0.85rem' }}>Sources →</Link>}>
          <div style={{ display: 'grid', gap: '0.6rem' }}>
            {filteredSources.slice(0, 8).map((source) => {
              const anomalyCount = toNumber(source.anomaly_count, 0);
              const records = toNumber(source.total_records, 0);
              const trust = records > 0 ? clamp(1 - anomalyCount / Math.max(1, records), 0, 1) : 0;
              return (
                <div key={source.source} style={{ display: 'grid', gap: '0.35rem', padding: '0.8rem 0.9rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{source.source}</strong>
                    <span style={{ color: scoreColor(trust) }}>{formatPct(trust)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted, #94a3b8)' }}>
                    <span>{formatNumber(records)} records</span>
                    <span>{formatNumber(anomalyCount)} anomalies</span>
                    <span>{source.freshness_minutes !== null && source.freshness_minutes !== undefined ? `${formatNumber(source.freshness_minutes)}m fresh` : 'freshness unknown'}</span>
                  </div>
                </div>
              );
            })}
            {filteredSources.length === 0 ? <div className="empty-state">No sources available in the current mode.</div> : null}
          </div>
        </Panel>

        <Panel title="System commands" subtitle="Fast navigation into the subordinate views">
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <Link className="card" to="/dashboard" style={{ textDecoration: 'none' }}>Awareness overview</Link>
            <Link className="card" to="/campaign-finance" style={{ textDecoration: 'none' }}>Campaign finance intelligence</Link>
            <Link className="card" to="/legislation" style={{ textDecoration: 'none' }}>Bill and vote tracking</Link>
            <Link className="card" to="/anomalies" style={{ textDecoration: 'none' }}>Anomaly review queue</Link>
            <Link className="card" to="/analytics" style={{ textDecoration: 'none' }}>Operational analytics</Link>
            <Link className="card" to="/admin" style={{ textDecoration: 'none' }}>Governance controls</Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
