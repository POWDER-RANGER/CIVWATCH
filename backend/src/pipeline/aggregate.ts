import { Report } from './schema';

interface Bucket {
  count: number;
  confidence_sum: number;
  first_seen: number;
  last_seen: number;
}

interface AggregateOutput {
  geo_cell: string;
  timestamp: number;
  category: Report['category'];
  count: number;
  avg_confidence: number;
  first_seen: number;
  last_seen: number;
}

// In-memory bucket store (replace with Redis in production)
const buckets = new Map<string, Bucket>();

/** Composite key — never exposes individual report identity */
function bucketKey(report: Report): string {
  return `${report.geo_cell}:${report.timestamp}:${report.category}`;
}

/**
 * Aggregate a sanitized report into the bucket store.
 * Increments count and confidence sum for the composite key.
 */
export function aggregate(report: Report): void {
  const key = bucketKey(report);
  const now = Date.now();

  if (!buckets.has(key)) {
    buckets.set(key, {
      count: 0,
      confidence_sum: 0,
      first_seen: now,
      last_seen: now,
    });
  }

  const bucket = buckets.get(key)!;
  bucket.count++;
  bucket.confidence_sum += report.confidence;
  bucket.last_seen = now;
}

/**
 * Get heatmap output — aggregated counts by geo_cell + time window.
 * NEVER returns individual reports.
 */
export function getHeatmap(): AggregateOutput[] {
  const results: AggregateOutput[] = [];

  for (const [key, bucket] of buckets.entries()) {
    const [geo_cell, tsStr, category] = key.split(':');
    results.push({
      geo_cell,
      timestamp: Number(tsStr),
      category: category as Report['category'],
      count: bucket.count,
      avg_confidence: bucket.confidence_sum / bucket.count,
      first_seen: bucket.first_seen,
      last_seen: bucket.last_seen,
    });
  }

  // Sort by count descending
  return results.sort((a, b) => b.count - a.count);
}

/**
 * Get trends — time-series aggregation across all cells.
 * Groups by timestamp window only.
 */
export function getTrends(): { timestamp: number; total_count: number; avg_confidence: number }[] {
  const timeMap = new Map<number, { total: number; conf_sum: number }>();

  for (const [key, bucket] of buckets.entries()) {
    const ts = Number(key.split(':')[1]);
    if (!timeMap.has(ts)) timeMap.set(ts, { total: 0, conf_sum: 0 });
    const slot = timeMap.get(ts)!;
    slot.total += bucket.count;
    slot.conf_sum += bucket.confidence_sum;
  }

  return Array.from(timeMap.entries())
    .map(([timestamp, data]) => ({
      timestamp,
      total_count: data.total,
      avg_confidence: data.conf_sum / data.total,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Summary stats — top-level metrics only.
 */
export function getSummary(): {
  total_buckets: number;
  total_reports: number;
  categories: Record<string, number>;
} {
  let total_reports = 0;
  const categories: Record<string, number> = {};

  for (const [key, bucket] of buckets.entries()) {
    const category = key.split(':')[2];
    total_reports += bucket.count;
    categories[category] = (categories[category] ?? 0) + bucket.count;
  }

  return {
    total_buckets: buckets.size,
    total_reports,
    categories,
  };
}

/** Flush all buckets — for testing only */
export function _flushBuckets(): void {
  buckets.clear();
}
