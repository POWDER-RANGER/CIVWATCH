import { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../db';
import { cacheDel } from '../db/redis';

const ML_URL = process.env.ML_SERVICE_URL ?? 'http://ml:5000';
const router  = Router();

interface MLPredictResult {
  is_anomalous:  boolean;
  z_score:       number;
  flags:         string[];
  anomaly_score: number;
}

interface MLPredictResponse {
  results?: Array<{
    is_anomalous?: boolean;
    z_score?: number;
    flags?: string[];
    anomaly_score?: number;
    score?: number;
  }>;
}

// ── POST /api/ingest ──────────────────────────────────────────────────────────
// Full pipeline: validate → persist civic_records → forward to ML service
// → write confirmed anomalies to anomaly_scores → bust Redis cache
// NOTE: Router mounted at /api/ingest in app.ts, so '/' = '/api/ingest'
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { source, content, metadata } = req.body as {
      source: string;
      content: string;
      metadata?: Record<string, unknown>;
    };

    // 1. Validate required fields (matches civic_records schema: source, content)
    if (!source || !content) {
      return res.status(400).json({
        error: 'Missing required fields: source, content',
      });
    }

    // 2. Persist to civic_records (matches 002_civic_records.sql migration)
    const { rows: inserted } = await pool.query<{ id: string }>(
      `INSERT INTO civic_records (source, content, metadata, scored)
       VALUES ($1, $2, $3, false)
       RETURNING id`,
      [source, content, JSON.stringify(metadata ?? {})],
    );
    const recordId = inserted[0].id;

    // 3. Forward to ML microservice for anomaly scoring
    let mlResult: MLPredictResult | null = null;
    try {
      const mlRes = await fetch(`${ML_URL}/predict`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          records: [{
            source,
            category: metadata?.category ?? 'general',
            value:    metadata?.value ?? 0,
            text:     content,
            timestamp: new Date().toISOString(),
          }]
        }),
        signal:  AbortSignal.timeout(5_000),
      });
      if (mlRes.ok) {
        const mlData = await mlRes.json() as MLPredictResponse;
        const result = mlData.results?.[0];
        if (result) {
          mlResult = {
            is_anomalous:  result.is_anomalous ?? false,
            z_score:       result.z_score ?? result.score ?? 0,
            flags:         result.flags ?? [],
            anomaly_score: result.anomaly_score ?? result.score ?? 0,
          };
        }
      }
    } catch {
      // ML service unavailable — degrade gracefully, record still saved
    }

    // 4. If anomalous, write to anomaly_scores (matches actual schema)
    if (mlResult?.is_anomalous && mlResult.anomaly_score > 0.5) {
      await pool.query(
        `INSERT INTO anomaly_scores
           (record_id, score, label, method, data)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [
          recordId,
          Math.min(Math.max(mlResult.anomaly_score, 0), 1), // clamp 0-1
          'anomalous',
          'ml',
          JSON.stringify({
            z_score: mlResult.z_score,
            flags:   mlResult.flags,
          }),
        ],
      );
    }

    // 5. Mark record as scored
    await pool.query(
      `UPDATE civic_records SET scored = true WHERE id = $1`,
      [recordId],
    );

    // 6. Bust Redis caches for analytics + anomaly list endpoints
    await Promise.allSettled([
      cacheDel('analytics:summary'),
      cacheDel(`analytics:source:${source}`),
      cacheDel('anomalies:recent'),
    ]);

    return res.status(201).json({
      id:        recordId,
      source,
      content:   content.substring(0, 200), // truncate for response
      anomaly:   mlResult ?? null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
