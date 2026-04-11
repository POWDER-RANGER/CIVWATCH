import React from 'react';

interface TrendPoint { date: string; count: number; sentiment: number | null; }
interface ClusterSummary { id: string; size: number; confidence: number; label: string; }
interface Props { trend: TrendPoint[]; clusters: ClusterSummary[]; anomalyScore: number | null; }

function ScoreGauge({ score }: { score: number | null }) {
  const pct = score ?? 0;
  const color = pct > 0.75 ? '#e03030' : pct > 0.45 ? '#f0a020' : '#28a870';
  const dash = 2 * Math.PI * 40;
  const fill = dash * (1 - pct);
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash}`} strokeDashoffset={`${fill}`} strokeLinecap="round"
          transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
        <text x="50" y="55" textAnchor="middle" fill={color} fontSize="14" fontWeight="700"
          fontFamily="monospace">{score !== null ? score.toFixed(2) : 'N/A'}</text>
      </svg>
      <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.25rem' }}>Anomaly Score</div>
    </div>
  );
}

function SparkLine({ points, color = '#4da3ff' }: { points: number[]; color?: string }) {
  if (!points.length) return <div style={{ color: 'var(--muted)', fontSize: '.8rem' }}>No data</div>;
  const max = Math.max(...points, 1);
  const w = 260; const h = 56;
  const pts = points.map((v, i) => {
    const x = (i / Math.max(points.length - 1, 1)) * w;
    const y = h - (v / max) * (h - 8) - 4;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={`${color}22`} stroke="none" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

const AdvancedAnalytics: React.FC<Props> = ({ trend, clusters, anomalyScore }) => {
  const counts = trend.map(t => t.count);
  const sentiments = trend.map(t => (t.sentiment ?? 0) + 1);
  const topCluster = [...clusters].sort((a, b) => b.confidence - a.confidence)[0];

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
        <ScoreGauge score={anomalyScore} />
        <div>
          <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>
            Ingestion Trend (90d)
          </div>
          <SparkLine points={counts} color="#4da3ff" />
        </div>
        <div>
          <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>
            Sentiment Trend (90d)
          </div>
          <SparkLine points={sentiments} color="#f0a020" />
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
          DBSCAN Cluster Summary
          {topCluster && (
            <span style={{ marginLeft: '1rem', fontSize: '.75rem', fontFamily: 'monospace',
              color: topCluster.confidence > 0.75 ? '#e03030' : '#f0a020' }}>
              ⚠ TOP: {topCluster.label} ({(topCluster.confidence * 100).toFixed(0)}%)
            </span>
          )}
        </h3>
        {clusters.length ? (
          <table>
            <thead><tr><th>Cluster</th><th>Size</th><th>Confidence</th><th>Label</th></tr></thead>
            <tbody>
              {clusters.map(c => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '.8rem' }}>{c.id}</td>
                  <td>{c.size}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      <div style={{ width: `${c.confidence * 80}px`, height: '4px', borderRadius: '2px',
                        background: c.confidence > 0.75 ? '#e03030' : c.confidence > 0.45 ? '#f0a020' : '#28a870' }} />
                      <span style={{ fontSize: '.8rem', fontFamily: 'monospace' }}>{(c.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '.8rem' }}>{c.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state"><p>No clusters yet. Ingest more data to trigger DBSCAN.</p></div>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
