import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { cacheDel } from '../db/redis';

const ML_URL = process.env.ML_SERVICE_URL ?? 'http://localhost:8000';
const router  = Router();

interface MLPredictResult {
  is_anomalous:  boolean;
  z_score:       number;
  flags:         string[];
  anomaly_score: number;
}

// ── POST /api/ingest ──────────────────────────────────────────────────────────
// Full pipeline: validate → persist civic_records → forward to ML service
// → write confirmed anomalies to anomaly_scores → bust Redis cache
// NOTE: This router is mounted at /api/ingest in app.ts, so '/' here = '/api/ingest'
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { source, category, value, metadata } = req.body;

    // 1. Validate required fields
    if (!source || !category || value === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: source, category, value',
      });
    }
    if (typeof value !== 'number' || !isFinite(value)) {
      return res.status(400).json({ error: 'value must be a finite number' });
    }

    const timestamp = new Date().toISOString();

    // 2. Persist to civic_records (matches 002_civic_records.sql migration)
    const { rows: inserted } = await db.query<{ id: number }>(
      `INSERT INTO civic_records (source, category, value, metadata, recorded_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id`,
      [source, category, value, JSON.stringify(metadata ?? {})],
    );
    const recordId = inserted[0].id;

    // 3. Forward to ML microservice for anomaly scoring
    let mlResult: MLPredictResult | null = null;
    try {
      const mlRes = await fetch(`${ML_URL}/predict`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ records: [{ source, category, value, text: metadata?.text ?? '' }] }),
        signal:  AbortSignal.timeout(5_000),
      });
      if (mlRes.ok) {
        const mlData = await mlRes.json() as { results?: MLPredictResult[] };
        mlResult = mlData.results?.[0] ?? null;
      }
    } catch {
      // ML service unavailable — degrade gracefully, record still saved
    }

    // 4. If anomalous, write to anomaly_scores
    if (mlResult?.is_anomalous) {
      await db.query(
        `INSERT INTO anomaly_scores
           (civic_record_id, z_score, anomaly_score, flags, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT DO NOTHING`,
        [
          recordId,
          mlResult.z_score,
          mlResult.anomaly_score,
          JSON.stringify(mlResult.flags),
        ],
      );
    }

    // 5. Bust Redis caches for analytics + anomaly list endpoints
    await Promise.allSettled([
      cacheDel('analytics:summary'),
      cacheDel(`analytics:source:${source}`),
      cacheDel('anomalies:recent'),
    ]);

    return res.status(201).json({
      id:        recordId,
      timestamp,
      source,
      category,
      value,
      anomaly:   mlResult ?? null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
