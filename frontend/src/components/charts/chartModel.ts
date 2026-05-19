/**
 * chartModel.ts
 *
 * Single source of truth for all anomaly chart data.
 * Import buildChartModel and call it once with useMemo in the dashboard;
 * pass the resulting ChartModel to every chart component.
 * Nothing in the chart components computes aggregates.
 */

export type Anomaly = {
  id:            string | number;
  label?:        string;
  source?:       string;
  category?:     string;
  score?:        number;
  anomaly_score?: number;
  is_anomalous?:  boolean;
  z_score?:      number;
  flags?:        string[];
  createdAt?:    string;
  timestamp?:    string;
  data?:         unknown;
};

export type TimelineBucket = {
  ts:       string;
  count:    number;
  avgScore: number;
  critical: number;
};

export type ScoreBin = {
  bucket: string;
  min:    number;
  max:    number;
  count:  number;
};

export type SourceRow = {
  source:   string;
  count:    number;
  avgScore: number;
};

export type ChartTotals = {
  total:      number;
  avgScore:   number;
  critical:   number;
  liveWindow: number;
};

export type ChartModel = {
  timeline:  TimelineBucket[];
  scoreBins: ScoreBin[];
  sources:   SourceRow[];
  totals:    ChartTotals;
};

/** Floor an ISO timestamp to the nearest N-minute boundary. */
function floorBucket(dateIso: string, minutes = 5): string {
  const d = new Date(dateIso);
  d.setSeconds(0, 0);
  d.setMinutes(Math.floor(d.getMinutes() / minutes) * minutes);
  return d.toISOString();
}

/**
 * Build chart-ready aggregates from a filtered anomaly array.
 * O(n) — one pass over the data. All charts share this output.
 *
 * @param anomalies  Filtered anomaly records from the dashboard
 * @param bucketMinutes  Timeline bucket size (default 5 minutes)
 */
export function buildChartModel(anomalies: Anomaly[], bucketMinutes = 5): ChartModel {
  const timeMap   = new Map<string, { ts: string; count: number; totalScore: number; critical: number }>();
  const sourceMap = new Map<string, { source: string; count: number; totalScore: number }>();

  const scoreBins: ScoreBin[] = Array.from({ length: 10 }, (_, i) => ({
    bucket: `${(i / 10).toFixed(1)}–${((i + 1) / 10).toFixed(1)}`,
    min:    i / 10,
    max:    (i + 1) / 10,
    count:  0,
  }));

  let totalScore = 0;
  let critical   = 0;

  for (const a of anomalies) {
    const score     = a.score ?? a.anomaly_score ?? 0;
    const createdAt = a.createdAt ?? a.timestamp;
    const source    = a.source ?? a.label?.split(' / ')[0]?.trim() ?? 'unknown';

    totalScore += score;
    if (score >= 0.85) critical++;

    // Score histogram
    const binIdx = Math.min(Math.floor(score * 10), 9);
    scoreBins[binIdx].count++;

    // Timeline bucketing
    if (createdAt) {
      const key = floorBucket(createdAt, bucketMinutes);
      const row = timeMap.get(key) ?? { ts: key, count: 0, totalScore: 0, critical: 0 };
      row.count       += 1;
      row.totalScore  += score;
      if (score >= 0.85) row.critical += 1;
      timeMap.set(key, row);
    }

    // Source breakdown
    const src = sourceMap.get(source) ?? { source, count: 0, totalScore: 0 };
    src.count      += 1;
    src.totalScore += score;
    sourceMap.set(source, src);
  }

  const timeline = [...timeMap.values()]
    .sort((a, b) => a.ts.localeCompare(b.ts))
    .map(r => ({
      ts:       r.ts,
      count:    r.count,
      avgScore: +(r.totalScore / r.count).toFixed(3),
      critical: r.critical,
    }));

  const sources = [...sourceMap.values()]
    .map(r => ({
      source:   r.source,
      count:    r.count,
      avgScore: +(r.totalScore / r.count).toFixed(3),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    timeline,
    scoreBins,
    sources,
    totals: {
      total:      anomalies.length,
      avgScore:   anomalies.length ? +(totalScore / anomalies.length).toFixed(3) : 0,
      critical,
      liveWindow: timeline.length,
    },
  };
}
