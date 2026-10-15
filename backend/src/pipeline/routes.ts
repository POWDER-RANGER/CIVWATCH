import { Router, Request, Response } from 'express';
import { sanitize }                   from './sanitize';
import { aggregate, getHeatmap, getTrends, getSummary } from './aggregate';
import { RawInput }                    from './schema';

const router = Router();

// ─── In-process metrics (reset on restart) ───────────────────────────────────
const metrics = {
  ingested: 0,
  rejected: 0,
  rejection_reasons: {
    raw_coordinates: 0,
    schema_fail:     0,
  },
};

/**
 * POST /reports
 * Privacy-preserving ingestion: sanitize (hard-rejects raw coordinates and
 * malformed input) then aggregate into time/geo-cell buckets. Individual
 * reports are never stored.
 */
router.post('/reports', (req: Request, res: Response) => {
  const raw = (req.body ?? {}) as RawInput;

  const clean = sanitize(raw);
  if (!clean) {
    metrics.rejected++;
    const reason = raw.lat !== undefined || raw.lon !== undefined
      ? 'raw_coordinates'
      : 'schema_fail';
    metrics.rejection_reasons[reason]++;
    return res.status(422).json({ error: 'Rejected', reason });
  }

  aggregate(clean);
  metrics.ingested++;
  return res.status(201).json({ status: 'accepted' });
});

// ─── GET /heatmap ─────────────────────────────────────────────────────────────
router.get('/heatmap', (_req: Request, res: Response) => res.json(getHeatmap()));

// ─── GET /trends ──────────────────────────────────────────────────────────────
router.get('/trends', (_req: Request, res: Response) => res.json(getTrends()));

// ─── GET /summary ─────────────────────────────────────────────────────────────
router.get('/summary', (_req: Request, res: Response) => res.json(getSummary()));

// ─── GET /pipeline/metrics ────────────────────────────────────────────────────
router.get('/metrics', (_req: Request, res: Response) => res.json(metrics));

export default router;
