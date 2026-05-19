import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { cacheDel } from '../db/redis';

const ML_URL = process.env.ML_SERVICE_URL ?? 'http://localhost:5000';
const router  = Router();

interface MLPredictResult {
  is_anomalous:  boolean;
  z_score:       number;
  flags:         string[];
  anomaly_score: number;
}

// ── POST /api/ingest ───────────────────────────────────────────────────────────
// Full pipeline: validate → persist raw_events → forward to ML /predict
// → write confirmed anomalies to anomaly_events → bust Redis cache
router.post('/api/ingest', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { source, category, value, metadata } = req.body;

    // 1. Validate required fields
    if (!source || !category || value === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: source, category, value',
      });
    }
    if (typeof value !== 'number') {
      return res.status(400).json({ error: 'value must be a number' });
    }

    const timestamp = new Date().toISOString();

    // 2. Persist raw event to PostgreSQL
    await db.query(
      `INSERT INTO raw_events (timestamp, source, category, value, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [timestamp, source, category, value, JSON.stringify(metadata ?? {})]
    );

    // 3. Forward to ML /predict for anomaly scoring (non-fatal if ML is down)
    let mlResult: MLPredictResult | null = null;
    try {
      const mlRes = await fetch(`${ML_URL}/predict`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ records: [{ timestamp, source, category, value }] }),
        signal:  AbortSignal.timeout(5000),
      });
      if (mlRes.ok) {
        const mlData = await mlRes.json() as { results: MLPredictResult[] };
        mlResult = mlData.results[0] ?? null;
      } else {
        console.warn('[ingest] ML /predict returned status', mlRes.status);
      }
    } catch (mlErr) {
      // Non-fatal — record is persisted regardless of ML availability
      console.warn('[ingest] ML service unavailable:', (mlErr as Error).message);
    }

    // 4. If anomalous → write to anomaly_events + bust cache
    if (mlResult?.is_anomalous) {
      await db.query(
        `INSERT INTO anomaly_events (timestamp, source, category, value, z_score, flags, is_anomalous)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          timestamp, source, category, value,
          mlResult.z_score,
          JSON.stringify(mlResult.flags),
          true,
        ]
      );
      await cacheDel('anomalies:latest');
    }

    // 5. Return full scoring result to caller
    res.json({
      timestamp,
      source,
      category,
      value,
      anomaly_score: mlResult?.anomaly_score ?? null,
      is_anomalous:  mlResult?.is_anomalous  ?? null,
      z_score:       mlResult?.z_score        ?? null,
      flags:         mlResult?.flags          ?? [],
    });
  } catch (err) {
    next(err);
  }
});

export default router;
