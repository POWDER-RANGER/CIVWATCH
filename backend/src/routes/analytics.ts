import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/analytics/overview
router.get('/overview', requireAuth, async (req: Request, res: Response, next) => {
  try {
    const userId = req.user!.userId;

    const [docCount, avgSentiment, recentAlerts] = await Promise.all([
      pool.query<any>(
        `SELECT COUNT(d.id)::int AS total
         FROM documents d
         JOIN sources s ON s.id = d.source_id
         WHERE s.user_id = $1`, [userId]
      ),
      pool.query<any>(
        `SELECT ROUND(AVG(a.score)::numeric, 4) AS avg_score
         FROM analyses a
         JOIN documents d ON d.id = a.document_id
         JOIN sources s ON s.id = d.source_id
         WHERE s.user_id = $1 AND a.type = 'sentiment'`, [userId]
      ),
      pool.query<any>(
        `SELECT al.id, al.triggered_at, al.value, ar.name AS rule_name
         FROM alerts al
         JOIN alert_rules ar ON ar.id = al.rule_id
         WHERE ar.user_id = $1
         ORDER BY al.triggered_at DESC LIMIT 10`, [userId]
      ),
    ]);

    res.json({
      documentsTotal: docCount.rows[0]?.total ?? 0,
      avgSentimentScore: avgSentiment.rows[0]?.avg_score ?? null,
      recentAlerts: recentAlerts.rows,
    });
  } catch (e) { next(e); }
});

export default router;
