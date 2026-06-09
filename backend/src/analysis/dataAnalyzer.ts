import { z } from 'zod';
import { db } from '../db';

// ── Schemas ────────────────────────────────────────────────────────────────────

const RawRecordSchema = z.object({
  timestamp: z.string(),
  source: z.string(),
  category: z.string(),
  value: z.number(),
  metadata: z.record(z.unknown()).optional(),
});

const ZScoreSchema = z.object({
  z: z.number(),
  mean: z.number(),
  stddev: z.number(),
});

export type DataPoint = z.infer<typeof RawRecordSchema>;
export type ZScore    = z.infer<typeof ZScoreSchema>;

export interface FeatureVector {
  source:    string;
  category:  string;
  value:     number;
  zscore:    number;
  timestamp: number; // unix ms
}

// ── Pure math helpers ─────────────────────────────────────────────────────────

export function computeZScore(points: number[], current: number): ZScore {
  if (points.length === 0) return { z: 0, mean: current, stddev: 1 };
  const mean     = points.reduce((a, b) => a + b, 0) / points.length;
  const variance = points.reduce((a, b) => a + (b - mean) ** 2, 0) / points.length;
  const stddev   = Math.sqrt(variance) || 1;
  return { z: (current - mean) / stddev, mean, stddev };
}

export function isAnomaly(zscore: number, threshold = 2.5): boolean {
  return Math.abs(zscore) > threshold;
}

// ── DB helpers ────────────────────────────────────────────────────────────────

/**
 * Fetch recent baseline values from civic_records for the same
 * source + category pair (last 500 rows, ~8 h of minutely data).
 */
async function getBaselineValues(
  source: string,
  category: string,
): Promise<number[]> {
  const { rows } = await db.query<{ value: number }>(
    `SELECT value FROM civic_records
     WHERE source = $1 AND category = $2
     ORDER BY recorded_at DESC
     LIMIT 500`,
    [source, category],
  );
  return rows.map((r) => r.value);
}

// ── Core analysis ─────────────────────────────────────────────────────────────

export async function analyzeRecord(record: DataPoint): Promise<{
  zscore: ZScore;
  anomaly: boolean;
}> {
  const validated = RawRecordSchema.parse(record);
  const baseline  = await getBaselineValues(validated.source, validated.category);
  const zscore    = computeZScore(baseline, validated.value);
  const anomaly   = isAnomaly(zscore.z);
  return { zscore, anomaly };
}

// ── Batch feature extraction ──────────────────────────────────────────────────

/**
 * Pull all civic_records written in the last `windowHours` hours and
 * compute a z-score for each row against its own source+category baseline.
 */
export async function extractFeatureVectors(
  windowHours = 24,
): Promise<FeatureVector[]> {
  const { rows } = await db.query<{
    source:      string;
    category:    string;
    value:       number;
    recorded_at: Date;
  }>(
    `SELECT source, category, value, recorded_at
     FROM civic_records
     WHERE recorded_at >= NOW() - INTERVAL '${windowHours} hours'
     ORDER BY recorded_at ASC`,
  );

  // Group by source+category for bulk z-score calculation
  const groups = new Map<string, number[]>();
  for (const row of rows) {
    const key = `${row.source}||${row.category}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row.value);
  }

  return rows.map((row) => {
    const key      = `${row.source}||${row.category}`;
    const allVals  = groups.get(key)!;
    const { z }    = computeZScore(allVals.slice(0, -1), row.value); // exclude self
    return {
      source:    row.source,
      category:  row.category,
      value:     row.value,
      zscore:    z,
      timestamp: new Date(row.recorded_at).getTime(),
    };
  });
}
