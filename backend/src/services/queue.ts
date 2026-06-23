/**
 * CIVWATCH - Async Job Queue
 * Bull/Redis-based queue for ingestion, alerts, and ML processing
 */

import Queue from 'bull';
import Redis from 'ioredis';
import { pool } from '../db/pool';

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

// --- Queue instances ---

export const ingestQueue = new Queue('ingest', redisUrl, {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export const alertQueue = new Queue('alert', redisUrl, {
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 10000 },
    removeOnComplete: 200,
    removeOnFail: 100,
  },
});

export const mlQueue = new Queue('ml', redisUrl, {
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 30000 },
    removeOnComplete: 50,
    removeOnFail: 50,
    timeout: 120000, // 2 minute timeout for ML jobs
  },
});

// --- Job processors ---

// Ingestion processor
ingestQueue.process('batch-ingest', 5, async (job) => {
  const { records, source, category } = job.data;
  const client = await pool.connect();
  
  try {
    let imported = 0;
    let errors = 0;
    
    await client.query('BEGIN');
    
    for (const record of records) {
      try {
        await client.query(
          `INSERT INTO documents (source_id, title, url, source_category, published_date, amount, raw_text, metadata, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (url) DO UPDATE SET
             title = EXCLUDED.title,
             raw_text = EXCLUDED.raw_text,
             updated_at = NOW()
           RETURNING id`,
          [
            record.raw_id || record.id,
            record.title || 'Untitled',
            record.source_url || record.url || `civwatch://${source}/${category}/${Date.now()}`,
            category,
            record.published_date || new Date().toISOString(),
            record.amount || null,
            record.raw_text || JSON.stringify(record),
            JSON.stringify({ source, import_method: 'queue' }),
            null,
          ]
        );
        imported++;
      } catch (err) {
        errors++;
      }
    }
    
    await client.query('COMMIT');
    
    return { imported, errors, total: records.length };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// Alert processor
alertQueue.process('evaluate', 3, async (job) => {
  const { alertId } = job.data;
  
  // Fetch alert rule
  const alertResult = await pool.query('SELECT * FROM alert_rules WHERE id = $1', [alertId]);
  if (alertResult.rows.length === 0) {
    throw new Error(`Alert rule ${alertId} not found`);
  }
  
  const alert = alertResult.rows[0];
  
  // Evaluate based on metric
  const countResult = await pool.query(
    'SELECT COUNT(*) FROM documents WHERE source_category = $1 AND created_at > NOW() - INTERVAL \'1 hour\'',
    [alert.source_category]
  );
  
  const currentValue = parseInt(countResult.rows[0].count);
  const threshold = parseFloat(alert.threshold);
  
  let triggered = false;
  switch (alert.operator) {
    case 'gt': triggered = currentValue > threshold; break;
    case 'lt': triggered = currentValue < threshold; break;
    case 'eq': triggered = currentValue === threshold; break;
    default: triggered = false;
  }
  
  if (triggered) {
    // Log alert firing
    await pool.query(
      `INSERT INTO alert_events (alert_id, triggered_value, threshold, fired_at)
       VALUES ($1, $2, $3, NOW())`,
      [alertId, currentValue, threshold]
    );
    
    // TODO: Dispatch via configured channel (email, webhook, websocket)
  }
  
  return { triggered, currentValue, threshold };
});

// ML processor
mlQueue.process('detect-anomalies', 2, async (job) => {
  const { sourceIds } = job.data;
  
  // Call ML service
  const mlUrl = process.env.ML_SERVICE_URL || 'http://ml:5000';
  
  const response = await fetch(`${mlUrl}/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source_ids: sourceIds }),
  });
  
  if (!response.ok) {
    throw new Error(`ML service error: ${response.status}`);
  }
  
  const result = await response.json();
  
  // Store detected anomalies
  const anomalies = result.anomalies || [];
  for (const anomaly of anomalies) {
    await pool.query(
      `INSERT INTO anomalies (document_id, method, score, label, description, status)
       VALUES ($1, $2, $3, $4, $5, 'new')
       ON CONFLICT DO NOTHING`,
      [
        anomaly.document_id,
        anomaly.method,
        anomaly.score,
        anomaly.label,
        anomaly.description,
      ]
    );
  }
  
  return { anomaliesDetected: anomalies.length };
});

// --- Event handlers for monitoring ---

[ingestQueue, alertQueue, mlQueue].forEach((queue) => {
  queue.on('completed', (job, result) => {
    console.log(`[Queue:${queue.name}] Job ${job.id} completed`, result);
  });
  
  queue.on('failed', (job, err) => {
    console.error(`[Queue:${queue.name}] Job ${job.id} failed:`, err.message);
  });
  
  queue.on('stalled', (job) => {
    console.warn(`[Queue:${queue.name}] Job ${job.id} stalled`);
  });
});

// --- Graceful shutdown ---
export async function closeQueues(): Promise<void> {
  await Promise.all([
    ingestQueue.close(),
    alertQueue.close(),
    mlQueue.close(),
  ]);
}

// --- Queue health check ---
export async function getQueueStats(): Promise<Record<string, any>> {
  const [ingestCounts, alertCounts, mlCounts] = await Promise.all([
    ingestQueue.getJobCounts(),
    alertQueue.getJobCounts(),
    mlQueue.getJobCounts(),
  ]);
  
  return {
    ingest: ingestCounts,
    alert: alertCounts,
    ml: mlCounts,
  };
}
