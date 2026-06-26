import { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../db';
import { cacheGet, cacheSet } from '../db/redis';
import { requireAuth, requireRole } from '../middleware/auth';

const ANOMALY_TTL = 60; // seconds
const router      = Router();

// ── Input validation helpers ─────────────────────────────────────────────────
function sanitizeLimit(val: unknown): number {
  const n = parseInt(val as string, 10);
  if (isNaN(n) || n < 1) return 1;
  if (n > 200) return 200;
  return n;
}

function sanitizeOffset(val: unknown): number {
  const n = parseInt(val as string, 10);
  if (isNaN(n) || n < 0) return 0;
  return n;
}

function isValidISODate(val: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/.test(val);
}

// ─── GET /api/anomalies ──────────────────────────────────────────────────────
// Returns paginated anomaly_scores joined with civic_records for full context.
// Uses the actual schema: anomaly_scores(record_id, score, label, method, data)
// joined with civic_records(id, source, content, metadata, created_at)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit  = sanitizeLimit(req.query.limit);
    const offset = sanitizeOffset(req.query.offset);
    const source = req.query.source as string | undefined;
    const since  = req.query.since  as string | undefined;

    // Validate since parameter format to prevent SQL injection via type casting
    if (since && !isValidISODate(since)) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'since must be an ISO-8601 date' } });
    }

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
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validate UUID format to prevent SQL injection via type casting
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid UUID format' } });
    }

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
router.post('/score', requireAuth, requireRole('admin', 'analyst'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { civic_record_id, score, label = 'anomalous', method = 'manual', flags } = req.body;

    if (!civic_record_id || score === undefined) {
      return res.status(400).json({ error: 'civic_record_id and score are required' });
    }
    if (typeof score !== 'number' || score < 0 || score > 1) {
      return res.status(400).json({ error: 'score must be a number between 0 and 1' });
    }
    // Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(civic_record_id)) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid civic_record_id UUID format' } });
    }

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
