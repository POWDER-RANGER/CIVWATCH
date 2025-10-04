/**
 * Core type definitions for CIVWATCH analytics module
 * @module types
 */

/**
 * Represents a single data point in a time series
 */
export interface DataPoint {
  /** The timestamp when this data point was recorded */
  timestamp: Date;
  /** The numeric value of this data point */
  value: number;
  /** Optional metadata associated with this data point */
  metadata?: Record<string, any>;
}

/**
 * Represents the result of a data analysis operation
 */
export interface AnalysisResult {
  /** Identified trends in the data */
  trends: TrendData[];
  /** Detected anomalies in the data */
  anomalies: DataPoint[];
  /** Statistical summary of the data */
  statistics: {
    mean: number;
    median: number;
    min: number;
    max: number;
    count: number;
  };
  /** Timestamp when the analysis was performed */
  timestamp: Date;
}

/**
 * Represents trend information for a time window
 */
export interface TrendData {
  /** The timestamp for this trend data point */
  timestamp: Date;
  /** The computed trend value */
  value: number;
  /** The direction of the trend */
  direction: 'up' | 'down' | 'stable';
}
