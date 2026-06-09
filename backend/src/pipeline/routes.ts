import { Router, Request, Response } from 'express';
import { sanitize }                   from './sanitize';
import { aggregate, getHeatmap, getTrends, getSummary } from './aggregate';
import { RawInput }                    from './schema';
import { db }                          from '../db';

const ML_URL = process.env.ML_SERVICE_URL ?? 'http://localhost:8000';
const router  = Router();

// ─── In-process metrics (reset on restart) ───────────────────────────────────
let metrics = {
  ingested:  0,
  rejected:  0,
  ml_errors: 0,
  rejection_reasons: {
    raw_coordinates:   0,
    invalid_timestamp: 0,
    invalid_geocell:   0,
    invalid_category:  0,
    schema_fail:       0,
  },
};

// ─── Helper: call ML service and write anomaly_score ─────────────────────────
async function scoreRecord(civicRecordId: number, record: RawInput): Promise<void> {
  try {
    const mlRes = await fetch(`${ML_URL}/predict`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        source:   record.source,
        category: record.category,
        value:    record.value,
        geocell:  record.geocell,
      }),
    });

    if (!mlRes.ok) {
      metrics.ml_errors++;
      return;
    }

    const { z_score, flags } = (await mlRes.json()) as { z_score: number; flags?: string[] };
    const is_anomalous = Math.abs(z_score) > 2.5;

    await db.query(`
      INSERT INTO anomaly_scores (civic_record_id, z_score, is_anomalous, flags)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (civic_record_id)
        DO UPDATE SET z_score = $2, is_anomalous = $3, flags = $4, created_at = NOW()
    `, [civicRecordId, z_score, is_anomalous, JSON.stringify(flags ?? [])]);
  } catch {
    metrics.ml_errors++;
  }
}

/**
 * POST /pipeline/reports
 * Ingestion endpoint – sanitizes, writes to civic_records, triggers ML scoring.
 */
router.post('/reports', async (req: Request, res: Response) => {
  const raw = req.body as RawInput;

  const result = sanitize(raw);
  if (!result.valid) {
    metrics.rejected++;
    const reason = result.reason as keyof typeof metrics.rejection_reasons;
    if (reason in metrics.rejection_reasons) metrics.rejection_reasons[reason]++;
    return res.status(422).json({ error: 'Rejected', reason: result.reason });
  }

  const clean = result.data!;

  // Persist to civic_records
  const { rows } = await db.query(`
    INSERT INTO civic_records (source, category, value, geocell, recorded_at, raw_text, metadata)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `, [
    clean.source,
    clean.category,
    clean.value,
    clean.geocell ?? null,
    clean.timestamp ? new Date(clean.timestamp) : new Date(),
    JSON.stringify(raw),
    JSON.stringify(clean.metadata ?? {}),
  ]);

  metrics.ingested++;
  const civicRecordId: number = rows[0].id;

  // Fire-and-forget ML scoring (non-blocking)
  scoreRecord(civicRecordId, clean).catch(() => {});

  return res.status(201).json({ id: civicRecordId, status: 'accepted' });
});

// ─── GET /pipeline/aggregate ──────────────────────────────────────────────────
router.get('/aggregate', async (req: Request, res: Response) => {
  const source   = req.query.source   as string | undefined;
  const category = req.query.category as string | undefined;
  const since    = req.query.since    as string | undefined;
  const result   = await aggregate({ source, category, since });
  return res.json(result);
});

// ─── GET /pipeline/heatmap ────────────────────────────────────────────────────
router.get('/heatmap', async (req: Request, res: Response) => {
  const source   = req.query.source   as string | undefined;
  const category = req.query.category as string | undefined;
  const result   = await getHeatmap({ source, category });
  return res.json(result);
});

// ─── GET /pipeline/trends ─────────────────────────────────────────────────────
router.get('/trends', async (req: Request, res: Response) => {
  const source   = req.query.source   as string | undefined;
  const category = req.query.category as string | undefined;
  const result   = await getTrends({ source, category });
  return res.json(result);
});

// ─── GET /pipeline/summary ────────────────────────────────────────────────────
router.get('/summary', async (_req: Request, res: Response) => {
  const result = await getSummary();
  return res.json(result);
});

// ─── GET /pipeline/metrics ────────────────────────────────────────────────────
router.get('/metrics', (_req: Request, res: Response) => {
  return res.json(metrics);
});

export default router;
