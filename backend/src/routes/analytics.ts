import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/analytics/overview — summary stats from civic_records + anomaly_scores
router.get('/overview', async (_req: Request, res: Response) => {
  try {
    const [totalRecords, anomalySummary, sourceBreakdown, recentRecords] = await Promise.all([
      // Total civic_records
      pool.query(`SELECT COUNT(id)::int AS total FROM civic_records`),

      // Anomaly summary from anomaly_scores
      pool.query(`
        SELECT
          ROUND(AVG(score)::numeric, 4)     AS avg_score,
          COUNT(*)::int                       AS anomaly_count,
          COUNT(DISTINCT record_id)::int      AS scored_count
        FROM anomaly_scores
      `),

      // Breakdown by source from civic_records
      pool.query(`
        SELECT source, COUNT(id)::int AS count
        FROM civic_records
        GROUP BY source
        ORDER BY count DESC
        LIMIT 20
      `),

      // Recent 10 civic_records with anomaly status
      pool.query(`
        SELECT
          cr.id::text,
          cr.source,
          cr.content,
          cr.created_at,
          COALESCE(ans.score, NULL)      AS score,
          COALESCE(ans.label, 'normal')   AS label
        FROM civic_records cr
        LEFT JOIN anomaly_scores ans ON ans.record_id = cr.id
        ORDER BY cr.created_at DESC
        LIMIT 10
      `),
    ]);

    res.json({
      total_records:      totalRecords.rows[0].total,
      avg_score:          anomalySummary.rows[0].avg_score,
      anomaly_count:      anomalySummary.rows[0].anomaly_count,
      scored_count:       anomalySummary.rows[0].scored_count,
      source_breakdown:   sourceBreakdown.rows,
      recent_activity:    recentRecords.rows,
    });
  } catch (err) {
    console.error('[analytics/overview]', err);
    res.status(500).json({ error: 'Failed to load analytics overview' });
  }
});

// GET /api/analytics/trends — civic_records grouped by day for last N days
router.get('/trends', async (req: Request, res: Response) => {
  try {
    const days = Math.min(parseInt(req.query.days as string) || 30, 365);

    const { rows } = await pool.query(`
      SELECT
        DATE_TRUNC('day', cr.created_at)::date AS day,
        COUNT(cr.id)::int                       AS total,
        COUNT(CASE WHEN ans.label = 'anomalous' THEN 1 END)::int AS anomalies
      FROM civic_records cr
      LEFT JOIN anomaly_scores ans ON ans.record_id = cr.id
      WHERE cr.created_at >= NOW() - ($1 || ' days')::interval
      GROUP BY day
      ORDER BY day ASC
    `, [days]);

    res.json({ days, trends: rows });
  } catch (err) {
    console.error('[analytics/trends]', err);
    res.status(500).json({ error: 'Failed to load trends' });
  }
});

// GET /api/analytics/heatmap — source hotspots with anomaly stats
router.get('/heatmap', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        cr.source,
        COUNT(cr.id)::int                        AS total,
        COUNT(CASE WHEN ans.label = 'anomalous' THEN 1 END)::int AS anomalies,
        ROUND(AVG(ans.score)::numeric, 4)        AS avg_score
      FROM civic_records cr
      LEFT JOIN anomaly_scores ans ON ans.record_id = cr.id
      GROUP BY cr.source
      ORDER BY anomalies DESC, total DESC
      LIMIT 500
    `);

    res.json({ heatmap: rows });
  } catch (err) {
    console.error('[analytics/heatmap]', err);
    res.status(500).json({ error: 'Failed to load heatmap' });
  }
});

// GET /api/analytics/sources — per-source ingestion stats
router.get('/sources', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        cr.source,
        COUNT(cr.id)::int                        AS total_records,
        COUNT(CASE WHEN ans.label = 'anomalous' THEN 1 END)::int AS anomaly_count,
        MAX(cr.created_at)                       AS last_ingested
      FROM civic_records cr
      LEFT JOIN anomaly_scores ans ON ans.record_id = cr.id
      GROUP BY cr.source
      ORDER BY total_records DESC
    `);

    res.json({ sources: rows });
  } catch (err) {
    console.error('[analytics/sources]', err);
    res.status(500).json({ error: 'Failed to load source stats' });
  }
});

export default router;
