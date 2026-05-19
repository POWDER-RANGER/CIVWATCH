import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';

const ML_URL = process.env.ML_SERVICE_URL ?? 'http://localhost:5000';
const router  = Router();

interface AnomalyEvent {
  id:           number;
  timestamp:    string;
  source:       string;
  category:     string;
  value:        number;
  zScore:       number;
  flags:        string[];
  is_anomalous: boolean;
}

interface MLPredictResult {
  timestamp:     string;
  source:        string;
  category:      string;
  value:         number;
  anomaly_score: number;
  is_anomalous:  boolean;
  z_score:       number;
  flags:         string[];
}

// ── GET /api/anomalies ─────────────────────────────────────────────────────────
// Reads from anomaly_events (populated by /api/ingest → ML pipeline).
// Falls back to a live ML /predict call on raw_events if the table is cold.
router.get('/api/anomalies', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { source, limit = '50' } = req.query;
    const q = `
      SELECT id, timestamp, source, category, value,
             z_score AS "zScore", flags, is_anomalous
      FROM anomaly_events
      ${source ? 'WHERE source = $1' : ''}
      ORDER BY timestamp DESC
      LIMIT ${Number(limit)}
    `;
    const result = source
      ? await db.query<AnomalyEvent>(q, [source])
      : await db.query<AnomalyEvent>(q);

    // Cold-start fallback — table empty, score recent raw_events via ML /predict
    if (result.rows.length === 0) {
      const raw = await db.query(
        `SELECT timestamp, source, category, value
         FROM raw_events ORDER BY timestamp DESC LIMIT 200`
      );
      if (raw.rows.length > 0) {
        const mlRes = await fetch(`${ML_URL}/predict`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ records: raw.rows }),
          signal:  AbortSignal.timeout(8000),
        });
        if (mlRes.ok) {
          const mlData = await mlRes.json() as { results: MLPredictResult[] };
          const anomalous = mlData.results.filter(r => r.is_anomalous);
          return res.json(anomalous);
        }
      }
      return res.json([]);
    }

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/anomalies ────────────────────────────────────────────────────────
// Direct insert — called by ingest pipeline after ML scoring confirms anomaly.
router.post('/api/anomalies', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { timestamp, source, category, value, z_score, flags, is_anomalous } = req.body;
    if (!timestamp || !source || !category || value === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: timestamp, source, category, value',
      });
    }
    const inserted = await db.query<AnomalyEvent>(
      `INSERT INTO anomaly_events (timestamp, source, category, value, z_score, flags, is_anomalous)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, timestamp, source, category, value,
                 z_score AS "zScore", flags, is_anomalous`,
      [
        timestamp, source, category, value,
        z_score       ?? 0,
        JSON.stringify(flags ?? []),
        is_anomalous  ?? false,
      ]
    );
    res.status(201).json(inserted.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
