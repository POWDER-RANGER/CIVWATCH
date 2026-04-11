import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { analyzeRecord } from '../analysis/dataAnalyzer';

const router = Router();

interface AnomalyEvent {
  id: number;
  timestamp: string;
  source: string;
  category: string;
  value: number;
  zScore: number;
}

router.get('/api/anomalies', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { source, limit = '50' } = req.query;
    const q = `
      SELECT id, timestamp, source, category, value, z_score as "zScore"
      FROM anomaly_events
      ${source ? 'WHERE source = $1' : ''}
      ORDER BY timestamp DESC
      LIMIT ${Number(limit)}
    `;
    const result = source
      ? await db.query<AnomalyEvent>(q, [source])
      : await db.query<AnomalyEvent>(q);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post('/api/anomalies', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { timestamp, source, category, value } = req.body;
    const { anomaly, zScore } = await analyzeRecord({ timestamp, source, category, value });
    if (anomaly) {
      const inserted = await db.query<AnomalyEvent>(
        `INSERT INTO anomaly_events (timestamp, source, category, value, z_score)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, timestamp, source, category, value, z_score as "zScore"`,
        [timestamp, source, category, value, zScore.z]
      );
      res.status(201).json(inserted.rows[0]);
    } else {
      res.status(204).send();
    }
  } catch (err) {
    next(err);
  }
});

export default router;
