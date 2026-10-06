import { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../db';
import { cacheGet, cacheSet } from '../db/redis';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { z } from 'zod';

const ANOMALY_TTL = 60; // seconds
const router      = Router();

const listAnomaliesSchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
  source: z.string().trim().min(1).max(200).optional(),
  since: z.string().refine(isValidISODate, 'since must be an ISO-8601 date').optional(),
});
const anomalyIdSchema = z.object({ id: z.string().uuid() });
const scoreSchema = z.object({
  civic_record_id: z.string().uuid(),
  score: z.number().min(0).max(1),
  label: z.string().trim().min(1).max(128).optional().default('anomalous'),
  method: z.string().trim().min(1).max(64).optional().default('manual'),
  flags: z.record(z.unknown()).optional(),
});

function isValidISODate(val: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/.test(val);
}

// ─── GET /api/anomalies ──────────────────────────────────────────────────────
// Returns paginated anomaly_scores joined with civic_records for full context.
// Uses the actual schema: anomaly_scores(record_id, score, label, method, data)
// joined with civic_records(id, source, content, metadata, created_at)
router.get('/', validateQuery(listAnomaliesSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, offset, source, since } = req.validatedQuery as z.infer<typeof listAnomaliesSchema>;

    const cacheKey = `anomalies:${limit}:${offset}:${source ?? ''}:${since ?? ''}`;
    const cached   = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    // Build query matching actual schema
    let query = `
      SELECT
        a.id::text          AS id,
        a.record_id::text   AS civic_record_id,
        a.score             AS anomaly_score,
        a.label,
        a.method,
        a.data              AS flags,
        a.created_at        AS detected_at,
        c.created_at        AS recorded_at,
        c.source,
        c.content           AS raw_text,
        c.metadata
      FROM anomaly_scores a
      JOIN civic_records c ON c.id = a.record_id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (source) {
      params.push(source);
      query += ` AND c.source = $${params.length}`;
    }
    if (since) {
      params.push(since);
      query += ` AND a.created_at >= $${params.length}::timestamptz`;
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);

    // Count query
    let countQuery = `
      SELECT COUNT(*) AS total
      FROM anomaly_scores a
      JOIN civic_records c ON c.id = a.record_id
      WHERE 1=1
    `;
    const countParams: (string | number)[] = [];
    if (source) {
      countParams.push(source);
      countQuery += ` AND c.source = $${countParams.length}`;
    }
    if (since) {
      countParams.push(since);
      countQuery += ` AND a.created_at >= $${countParams.length}::timestamptz`;
    }
    const { rows: countRows } = await pool.query(countQuery, countParams);

    const payload = {
      total:     parseInt(countRows[0].total),
      limit,
      offset,
      anomalies: rows,
    };

    await cacheSet(cacheKey, payload, ANOMALY_TTL);
    return res.json(payload);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/anomalies/stats ─────────────────────────────────────────────────
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'anomalies:stats';
    const cached   = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const { rows } = await pool.query(`
      SELECT
        COUNT(*)                              AS total_anomalies,
        COUNT(DISTINCT c.source)              AS affected_sources,
        AVG(a.score)                          AS avg_score,
        MAX(a.score)                          AS max_score,
        MIN(a.created_at)                     AS earliest,
        MAX(a.created_at)                     AS latest,
        COUNT(*) FILTER (WHERE a.created_at >= NOW() - INTERVAL '24 hours') AS last_24h
      FROM anomaly_scores a
      JOIN civic_records c ON c.id = a.record_id
    `);

    const stats = rows[0];
    await cacheSet(cacheKey, stats, ANOMALY_TTL);
    return res.json(stats);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/anomalies/:id ───────────────────────────────────────────────────
router.get('/:id', validateParams(anomalyIdSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.validatedParams as z.infer<typeof anomalyIdSchema>;

    const { rows } = await pool.query(`
      SELECT
        a.id::text          AS id,
        a.record_id::text   AS civic_record_id,
        a.score             AS anomaly_score,
        a.label,
        a.method,
        a.data              AS flags,
        a.created_at        AS detected_at,
        c.created_at        AS recorded_at,
        c.source,
        c.content           AS raw_text,
        c.metadata
      FROM anomaly_scores a
      JOIN civic_records c ON c.id = a.record_id
      WHERE a.id = $1::uuid
    `, [id]);

    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    return res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/anomalies/score ────────────────────────────────────────────────
// Protected: only authenticated users can write anomaly scores
// REF: NIST 800-53 AC-3 (Access Enforcement), AC-6 (Least Privilege)
router.post('/score', requireAuth, requireRole('admin', 'analyst'), validateBody(scoreSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { civic_record_id, score, label, method, flags } = req.validatedBody as z.infer<typeof scoreSchema>;

    const { rows } = await pool.query(`
      INSERT INTO anomaly_scores (record_id, score, label, method, data)
      VALUES ($1::uuid, $2, $3, $4, $5)
      ON CONFLICT (id) DO NOTHING
      RETURNING *
    `, [civic_record_id, score, label, method, JSON.stringify(flags ?? {})]);

    return res.status(201).json(rows[0] ?? { message: 'Score recorded' });
  } catch (err) {
    next(err);
  }
});

export default router;

