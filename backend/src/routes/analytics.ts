import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

/** GET /api/analytics/overview */
router.get('/overview', requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const [docResult, sentimentResult, alertResult] = await Promise.all([
    pool.query(
      `SELECT COUNT(*)::int AS total_documents
       FROM documents d
       JOIN sources s ON s.id = d.source_id
       WHERE s.user_id = $1`,
      [userId]
    ),
    pool.query(
      `SELECT ROUND(AVG(a.score)::numeric, 4) AS avg_sentiment
       FROM analyses a
       JOIN documents d ON d.id = a.document_id
       JOIN sources s ON s.id = d.source_id
       WHERE s.user_id = $1 AND a.analysis_type = 'sentiment'`,
      [userId]
    ),
    pool.query(
      `SELECT id, message, created_at
       FROM alerts al
       JOIN alert_rules ar ON ar.id = al.alert_rule_id
       WHERE ar.user_id = $1
       ORDER BY al.created_at DESC
       LIMIT 10`,
      [userId]
    ),
  ]);

  res.json({
    total_documents: docResult.rows[0]?.total_documents ?? 0,
    avg_sentiment:   sentimentResult.rows[0]?.avg_sentiment ?? null,
    recent_alerts:   alertResult.rows,
    generated_at:    new Date().toISOString(),
  });
});

export default router;
