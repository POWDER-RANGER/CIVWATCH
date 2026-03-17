import { Request, Response, NextFunction } from 'express';

// Rolling window for P95 calculation — keep last 1000 samples per route key
const WINDOW_SIZE = 1000;
const samples = new Map<string, number[]>();

/**
 * Latency tracking middleware.
 *
 * Records response time per route key (method + path template).
 * Logs a warning when P95 exceeds the threshold (default 500ms).
 * Exposes getLatencyStats() for /metrics endpoint.
 */
export function latencyMiddleware(thresholdMs = 500) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
      const elapsedMs = Number(process.hrtime.bigint() - start) / 1_000_000;
      const key = `${req.method}:${req.route?.path ?? req.path}`;

      if (!samples.has(key)) samples.set(key, []);
      const bucket = samples.get(key)!;
      bucket.push(elapsedMs);
      if (bucket.length > WINDOW_SIZE) bucket.shift();

      const p95 = percentile(bucket, 95);

      // Structured log — parseable by log aggregators
      const logEntry = {
        ts: new Date().toISOString(),
        method: req.method,
        path: key,
        status: res.statusCode,
        ms: Math.round(elapsedMs),
        p95_ms: Math.round(p95),
        request_id: (req as any).id ?? null,
      };

      if (p95 > thresholdMs) {
        console.warn('[latency:P95_BREACH]', JSON.stringify(logEntry));
      } else {
        console.log('[latency]', JSON.stringify(logEntry));
      }
    });

    next();
  };
}

/**
 * Returns current latency stats for all tracked routes.
 * Used by GET /metrics.
 */
export function getLatencyStats(): Record<string, { p50: number; p95: number; p99: number; count: number }> {
  const stats: Record<string, { p50: number; p95: number; p99: number; count: number }> = {};

  for (const [key, bucket] of samples.entries()) {
    if (bucket.length === 0) continue;
    stats[key] = {
      p50: Math.round(percentile(bucket, 50)),
      p95: Math.round(percentile(bucket, 95)),
      p99: Math.round(percentile(bucket, 99)),
      count: bucket.length,
    };
  }

  return stats;
}

/** Nearest-rank percentile over a sample array */
function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}
