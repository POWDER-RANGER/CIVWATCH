import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { cacheGet, cacheSet } from '../db/redis';

const ANOMALY_TTL = 60; // seconds
const router      = Router();

// ─── GET /api/anomalies ───────────────────────────────────────────────────────
// Returns paginated anomaly_scores joined with civic_records for full context.
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit  as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;
    const source = req.query.source as string | undefined;
    const since  = req.query.since  as string | undefined;

    const cacheKey = `anomalies:${limit}:${offset}:${source ?? ''}:${since ?? ''}`;
    const cached   = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    let query = `
      SELECT
        a.id,
        a.civic_record_id,
        a.z_score,
        a.is_anomalous,
        a.flags,
        a.created_at        AS detected_at,
        c.recorded_at,
        c.source,
        c.category,
        c.value,
        c.raw_text
      FROM anomaly_scores a
      JOIN civic_records  c ON c.id = a.civic_record_id
      WHERE a.is_anomalous = true
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

    const { rows } = await db.query(query, params);

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM anomaly_scores a
      JOIN civic_records  c ON c.id = a.civic_record_id
      WHERE a.is_anomalous = true
      ${source ? `AND c.source = '${source}'` : ''}
      ${since  ? `AND a.created_at >= '${since}'::timestamptz` : ''}
    `;
    const { rows: countRows } = await db.query(countQuery);

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
// Aggregate statistics across anomaly_scores + civic_records.
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'anomalies:stats';
    const cached   = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const { rows } = await db.query(`
      SELECT
        COUNT(*)                                           AS total_anomalies,
        COUNT(DISTINCT c.source)                           AS affected_sources,
        AVG(a.z_score)                                     AS avg_z_score,
        MAX(a.z_score)                                     AS max_z_score,
        MIN(a.created_at)                                  AS earliest,
        MAX(a.created_at)                                  AS latest,
        COUNT(*) FILTER (WHERE a.created_at >= NOW() - INTERVAL '24 hours') AS last_24h
      FROM anomaly_scores a
      JOIN civic_records  c ON c.id = a.civic_record_id
      WHERE a.is_anomalous = true
    `);

    const stats = rows[0];
    await cacheSet(cacheKey, stats, ANOMALY_TTL);
    return res.json(stats);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/anomalies/:id ───────────────────────────────────────────────────
// Single anomaly detail with full civic_record context.
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

    const { rows } = await db.query(`
      SELECT
        a.*,
        c.recorded_at,
        c.source,
        c.category,
        c.value,
        c.raw_text,
        c.metadata
      FROM anomaly_scores a
      JOIN civic_records  c ON c.id = a.civic_record_id
      WHERE a.id = $1
    `, [id]);

    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    return res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/anomalies/score ────────────────────────────────────────────────
// Accepts a civic_record_id + pre-computed z_score from the ML pipeline
// and writes it into anomaly_scores.
router.post('/score', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { civic_record_id, z_score, flags } = req.body as {
      civic_record_id: number;
      z_score:         number;
      flags?:          string[];
    };

    if (!civic_record_id || z_score === undefined) {
      return res.status(400).json({ error: 'civic_record_id and z_score are required' });
    }

    const is_anomalous = Math.abs(z_score) > 2.5;
    const flagsArr     = flags ?? [];

    const { rows } = await db.query(`
      INSERT INTO anomaly_scores (civic_record_id, z_score, is_anomalous, flags)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (civic_record_id)
        DO UPDATE SET z_score = $2, is_anomalous = $3, flags = $4, created_at = NOW()
      RETURNING *
    `, [civic_record_id, z_score, is_anomalous, JSON.stringify(flagsArr)]);

    return res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
