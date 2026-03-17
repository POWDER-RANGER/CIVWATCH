import { Router, Request, Response } from 'express';
import { sanitize } from './sanitize';
import { aggregate, getHeatmap, getTrends, getSummary } from './aggregate';
import { RawInput } from './schema';

const router = Router();

// Metrics counters
let metrics = {
  ingested: 0,
  rejected: 0,
  rejection_reasons: {
    raw_coordinates: 0,
    invalid_timestamp: 0,
    invalid_geocell: 0,
    invalid_category: 0,
    schema_fail: 0,
  },
};

/**
 * POST /reports
 * Ingestion endpoint — only accepts sanitized, schema-valid reports.
 * Rejects raw coordinates, malformed timestamps, invalid categories.
 */
router.post('/reports', (req: Request, res: Response) => {
  const raw = req.body as RawInput;

  // Track raw coord rejection separately for metrics
  if (raw.lat !== undefined || raw.lon !== undefined) {
    metrics.rejected++;
    metrics.rejection_reasons.raw_coordinates++;
    return res.status(400).json({
      error: {
        code: 'RAW_COORDINATES_REJECTED',
        message: 'Raw lat/lon not accepted. Submit geo_cell hash only.',
      },
    });
  }

  const report = sanitize(raw);

  if (!report) {
    metrics.rejected++;
    return res.status(400).json({
      error: {
        code: 'SANITIZATION_FAILED',
        message: 'Report failed validation. Check timestamp window, geo_cell format, and category.',
      },
    });
  }

  aggregate(report);
  metrics.ingested++;

  return res.status(202).json({ status: 'accepted' });
});

/**
 * GET /heatmap
 * Returns aggregated counts by geo_cell + time window.
 * NEVER returns individual submissions.
 */
router.get('/heatmap', (_req: Request, res: Response) => {
  return res.json(getHeatmap());
});

/**
 * GET /trends
 * Returns time-series totals. Statistical only.
 */
router.get('/trends', (_req: Request, res: Response) => {
  return res.json(getTrends());
});

/**
 * GET /summary
 * Top-level aggregate stats.
 */
router.get('/summary', (_req: Request, res: Response) => {
  return res.json(getSummary());
});

/**
 * GET /metrics
 * Operational metrics — ingestion rate, rejection rate, bucket density.
 */
router.get('/metrics', (_req: Request, res: Response) => {
  const total = metrics.ingested + metrics.rejected;
  return res.json({
    ...metrics,
    rejection_rate: total > 0 ? metrics.rejected / total : 0,
    acceptance_rate: total > 0 ? metrics.ingested / total : 0,
  });
});

export default router;
