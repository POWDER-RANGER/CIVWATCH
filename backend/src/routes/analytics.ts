import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/analytics/overview — civic_records summary for authenticated user
router.get('/overview', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const [totalRecords, anomalySummary, categoryBreakdown, recentActivity] = await Promise.all([
      // Total civic_records ingested by this user's sources
      pool.query<any>(
        `SELECT COUNT(cr.id)::int AS total
         FROM civic_records cr
         JOIN sources s ON s.id = cr.source_id
         WHERE s.user_id = $1`,
        [userId]
      ),

      // Average z-score and flagged anomaly count from anomaly_scores
      pool.query<any>(
        `SELECT
           ROUND(AVG(ans.z_score)::numeric, 4) AS avg_z_score,
           COUNT(CASE WHEN ans.is_anomalous THEN 1 END)::int AS anomaly_count,
           COUNT(ans.id)::int AS scored_count
         FROM anomaly_scores ans
         JOIN civic_records cr ON cr.id = ans.civic_record_id
         JOIN sources s ON s.id = cr.source_id
         WHERE s.user_id = $1`,
        [userId]
      ),

      // Breakdown by category from civic_records
      pool.query<any>(
        `SELECT cr.category, COUNT(cr.id)::int AS count
         FROM civic_records cr
         JOIN sources s ON s.id = cr.source_id
         WHERE s.user_id = $1
         GROUP BY cr.category
         ORDER BY count DESC
         LIMIT 20`,
        [userId]
      ),

      // Recent 10 civic_records with anomaly status
      pool.query<any>(
        `SELECT
           cr.id,
           cr.title,
           cr.category,
           cr.geocell,
           cr.occurred_at,
           cr.ingested_at,
           COALESCE(ans.z_score, NULL)      AS z_score,
           COALESCE(ans.is_anomalous, false) AS is_anomalous
         FROM civic_records cr
         JOIN sources s ON s.id = cr.source_id
         LEFT JOIN anomaly_scores ans ON ans.civic_record_id = cr.id
         WHERE s.user_id = $1
         ORDER BY cr.ingested_at DESC
         LIMIT 10`,
        [userId]
      ),
    ]);

    res.json({
      total_records:    totalRecords.rows[0].total,
      avg_z_score:      anomalySummary.rows[0].avg_z_score,
      anomaly_count:    anomalySummary.rows[0].anomaly_count,
      scored_count:     anomalySummary.rows[0].scored_count,
      category_breakdown: categoryBreakdown.rows,
      recent_activity:    recentActivity.rows,
    });
  } catch (err) {
    console.error('[analytics/overview]', err);
    res.status(500).json({ error: 'Failed to load analytics overview' });
  }
});

// GET /api/analytics/trends — civic_records grouped by day for last N days
router.get('/trends', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId  = req.user!.userId;
    const days    = Math.min(parseInt(req.query.days as string) || 30, 365);

    const { rows } = await pool.query<any>(
      `SELECT
         DATE_TRUNC('day', cr.occurred_at)::date AS day,
         COUNT(cr.id)::int                        AS total,
         COUNT(CASE WHEN ans.is_anomalous THEN 1 END)::int AS anomalies
       FROM civic_records cr
       JOIN sources s ON s.id = cr.source_id
       LEFT JOIN anomaly_scores ans ON ans.civic_record_id = cr.id
       WHERE s.user_id = $1
         AND cr.occurred_at >= NOW() - ($2 || ' days')::interval
       GROUP BY day
       ORDER BY day ASC`,
      [userId, days]
    );

    res.json({ days, trends: rows });
  } catch (err) {
    console.error('[analytics/trends]', err);
    res.status(500).json({ error: 'Failed to load trends' });
  }
});

// GET /api/analytics/heatmap — geocell hotspots from civic_records
router.get('/heatmap', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const { rows } = await pool.query<any>(
      `SELECT
         cr.geocell,
         COUNT(cr.id)::int                        AS total,
         COUNT(CASE WHEN ans.is_anomalous THEN 1 END)::int AS anomalies,
         ROUND(AVG(ans.z_score)::numeric, 4)      AS avg_z_score
       FROM civic_records cr
       JOIN sources s ON s.id = cr.source_id
       LEFT JOIN anomaly_scores ans ON ans.civic_record_id = cr.id
       WHERE s.user_id = $1
         AND cr.geocell IS NOT NULL
       GROUP BY cr.geocell
       ORDER BY anomalies DESC, total DESC
       LIMIT 500`,
      [userId]
    );

    res.json({ heatmap: rows });
  } catch (err) {
    console.error('[analytics/heatmap]', err);
    res.status(500).json({ error: 'Failed to load heatmap' });
  }
});

// GET /api/analytics/sources — per-source ingestion stats
router.get('/sources', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const { rows } = await pool.query<any>(
      `SELECT
         s.id,
         s.name,
         s.url,
         COUNT(cr.id)::int                        AS total_records,
         COUNT(CASE WHEN ans.is_anomalous THEN 1 END)::int AS anomaly_count,
         MAX(cr.ingested_at)                      AS last_ingested
       FROM sources s
       LEFT JOIN civic_records cr  ON cr.source_id  = s.id
       LEFT JOIN anomaly_scores ans ON ans.civic_record_id = cr.id
       WHERE s.user_id = $1
       GROUP BY s.id, s.name, s.url
       ORDER BY total_records DESC`,
      [userId]
    );

    res.json({ sources: rows });
  } catch (err) {
    console.error('[analytics/sources]', err);
    res.status(500).json({ error: 'Failed to load source stats' });
  }
});

export default router;
