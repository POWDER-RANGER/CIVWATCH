// src/types.ts
export interface User {
  id: string;
  name: string;
}

export type Status = 'active' | 'inactive';

// ── Core data shape ────────────────────────────────────────────────────────────

/**
 * A single time-series data point.
 * timestamp is a Date object — use .getTime() for numeric comparisons.
 */
export interface DataPoint {
  timestamp: Date;           // was: number — caused .getTime() errors in aggregateByTimeWindow
  value: number;
  metadata?: Record<string, unknown>;
}

// ── Analysis output ────────────────────────────────────────────────────────────

/**
 * A single point in a computed trend window.
 * Matches the shape that calculateTrends() actually builds.
 */
export interface TrendData {
  timestamp: Date;           // was: { points: DataPoint[] } — mismatched calculateTrends() output
  value: number;
  direction: 'up' | 'down' | 'stable';
}

/**
 * Descriptive statistics for a dataset.
 * Matches the shape that computeStatistics() returns.
 */
export interface Statistics {
  mean:   number;
  median: number;
  min:    number;
  max:    number;
  count:  number;
}

/**
 * Full output of analyzeTimeSeries().
 * was: { trend: string; anomalies: number[]; summary: string }
 * — all three fields mismatched the actual return values.
 */
export interface AnalysisResult {
  trends:     TrendData[];   // calculated sliding-window trend array
  anomalies:  DataPoint[];   // data points > 2 std devs from mean
  statistics: Statistics;    // descriptive stats object
  timestamp:  Date;          // analysis run time
}
