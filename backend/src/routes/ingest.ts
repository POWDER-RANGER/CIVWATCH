import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { cacheSet, cacheDel } from '../db/redis';
import { analyzeRecord } from '../analysis/dataAnalyzer';

const router = Router();

router.post('/api/ingest', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { source, category, value, metadata } = req.body;
    const timestamp = new Date().toISOString();
    
    await db.query(
      `INSERT INTO raw_events (timestamp, source, category, value, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [timestamp, source, category, value, JSON.stringify(metadata ?? {})]
    );
    
    const { anomaly, zScore } = await analyzeRecord({ timestamp, source, category, value });
    
    if (anomaly) {
      await db.query(
        `INSERT INTO anomaly_events (timestamp, source, category, value, z_score)
         VALUES ($1, $2, $3, $4, $5)`,
        [timestamp, source, category, value, zScore.z]
      );
      await cacheDel('anomalies:latest');
    }
    
    res.json({ timestamp, source, category, value, anomaly, zScore: zScore.z });
  } catch (err) {
    next(err);
  }
});

export default router;
