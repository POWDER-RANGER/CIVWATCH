import { z } from 'zod';
import { db } from '../db';

const RawRecord = z.object({
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

export type DataPoint = z.infer<typeof RawRecord>;
export type ZScore = z.infer<typeof ZScoreSchema>;

export function computeZScore(points: number[], current: number): ZScore {
  const mean = points.reduce((a, b) => a + b, 0) / points.length;
  const variance = points.reduce((a, b) => a + (b - mean) ** 2, 0) / points.length;
  const stddev = Math.sqrt(variance) || 1;
  return { z: (current - mean) / stddev, mean, stddev };
}

export function isAnomaly(zScore: number, threshold = 2.5): boolean {
  return Math.abs(zScore) > threshold;
}

export async function getBaselineValues(source: string, days = 7): Promise<number[]> {
  const res = await db.query<{ value: number }>(
    `SELECT value FROM raw_events
     WHERE source = $1
       AND timestamp > NOW() - INTERVAL '${days} days'
     ORDER BY timestamp`,
    [source]
  );
  return res.rows.map(r => r.value);
}

export async function analyzeRecord(record: RawRecord): Promise<{ anomaly: boolean; zScore: ZScore }> {
  const points = await getBaselineValues(record.source);
  const zScore = computeZScore(points, record.value);
  return { anomaly: isAnomaly(zScore.z), zScore };
}
