import { z }   from 'zod';
import { pool } from '../db';

// ── Schemas aligned to civic_records + anomaly_scores ──────────────────────

/** Shape of a row returned from civic_records */
export const CivicRecordSchema = z.object({
  id:          z.string().uuid(),
  source_id:   z.string().uuid(),
  title:       z.string(),
  category:    z.string(),
  geocell:     z.string().nullable(),
  occurred_at: z.coerce.date(),
  ingested_at: z.coerce.date(),
  flags:       z.record(z.unknown()).optional(),
});
export type CivicRecord = z.infer<typeof CivicRecordSchema>;

/** Numeric feature vector extracted from a CivicRecord for z-score / ML */
export interface FeatureVector {
  civic_record_id: string;
  source_id:       string;
  category:        string;
  geocell:         string | null;
  occurred_at:     Date;
  /** Numeric value used for statistical baseline (e.g. hourly event count) */
  value:           number;
}

/** Z-score result written to anomaly_scores */
export interface ZScoreResult {
  civic_record_id: string;
  z_score:         number;
  mean:            number;
  stddev:          number;
  is_anomalous:    boolean;
  flags:           Record<string, unknown>;
}

// ── Baseline helpers ────────────────────────────────────────────────────────

/**
 * Fetch hourly event counts from civic_records for the last `windowHours`
 * hours, grouped by geocell+category, to build a statistical baseline.
 */
export async function fetchBaseline(
  windowHours = 168 // 7 days
): Promise<FeatureVector[]> {
  const { rows } = await pool.query<any>(
    `SELECT
       cr.id              AS civic_record_id,
       cr.source_id,
       cr.category,
       cr.geocell,
       cr.occurred_at,
       -- Count of records in the same geocell+category+hour as this row
       COUNT(*) OVER (
         PARTITION BY cr.geocell, cr.category,
                      DATE_TRUNC('hour', cr.occurred_at)
       )::float           AS value
     FROM civic_records cr
     WHERE cr.occurred_at >= NOW() - ($1 || ' hours')::interval
     ORDER BY cr.occurred_at ASC`,
    [windowHours]
  );

  return rows.map((r: any) => ({
    civic_record_id: r.civic_record_id,
    source_id:       r.source_id,
    category:        r.category,
    geocell:         r.geocell,
    occurred_at:     new Date(r.occurred_at),
    value:           parseFloat(r.value),
  }));
}

// ── Statistical analysis ────────────────────────────────────────────────────

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function stddev(values: number[], mu?: number): number {
  if (values.length < 2) return 0;
  const m = mu ?? mean(values);
  const variance = values.reduce((acc, v) => acc + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function zScore(value: number, mu: number, sigma: number): number {
  if (sigma === 0) return 0;
  return (value - mu) / sigma;
}

// ── Core analysis function ──────────────────────────────────────────────────

/**
 * Compute z-scores for all FeatureVectors using a per-category+geocell
 * baseline. Returns ZScoreResult[] ready to upsert into anomaly_scores.
 */
export function analyzeFeatures(
  features:       FeatureVector[],
  anomalyThreshold = 2.5
): ZScoreResult[] {
  // Build per-group (category+geocell) statistics
  const groups = new Map<string, number[]>();
  for (const f of features) {
    const key = `${f.category}::${f.geocell ?? '__null__'}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(f.value);
  }

  const stats = new Map<string, { mu: number; sigma: number }>();
  for (const [key, vals] of groups) {
    const mu    = mean(vals);
    const sigma = stddev(vals, mu);
    stats.set(key, { mu, sigma });
  }

  return features.map(f => {
    const key    = `${f.category}::${f.geocell ?? '__null__'}`;
    const { mu, sigma } = stats.get(key)!;
    const z      = zScore(f.value, mu, sigma);
    const isAnom = Math.abs(z) > anomalyThreshold;

    return {
      civic_record_id: f.civic_record_id,
      z_score:         z,
      mean:            mu,
      stddev:          sigma,
      is_anomalous:    isAnom,
      flags: {
        category: f.category,
        geocell:  f.geocell,
        value:    f.value,
      },
    };
  });
}

// ── Persistence ─────────────────────────────────────────────────────────────

/**
 * Upsert ZScoreResult[] into anomaly_scores.
 * Uses ON CONFLICT (civic_record_id) DO UPDATE to be idempotent.
 */
export async function persistAnomalyScores(
  results: ZScoreResult[]
): Promise<void> {
  if (results.length === 0) return;

  const values = results
    .map(
      (r, i) =>
        `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`
    )
    .join(', ');

  const params = results.flatMap(r => [
    r.civic_record_id,
    r.z_score,
    r.mean,
    r.stddev,
    r.is_anomalous,
    JSON.stringify(r.flags),
  ]);

  await pool.query(
    `INSERT INTO anomaly_scores
       (civic_record_id, z_score, mean, stddev, is_anomalous, flags)
     VALUES ${values}
     ON CONFLICT (civic_record_id) DO UPDATE SET
       z_score      = EXCLUDED.z_score,
       mean         = EXCLUDED.mean,
       stddev       = EXCLUDED.stddev,
       is_anomalous = EXCLUDED.is_anomalous,
       flags        = EXCLUDED.flags,
       scored_at    = NOW()`,
    params
  );
}

// ── Convenience: run full analysis pipeline ─────────────────────────────────

export async function runAnalysisPipeline(
  windowHours = 168,
  anomalyThreshold = 2.5
): Promise<{ analyzed: number; anomalies: number }> {
  const features = await fetchBaseline(windowHours);
  const results  = analyzeFeatures(features, anomalyThreshold);
  await persistAnomalyScores(results);

  const anomalies = results.filter(r => r.is_anomalous).length;
  return { analyzed: results.length, anomalies };
}
