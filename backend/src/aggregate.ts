/**
 * Aggregation Engine - Privacy-Preserving Crowdsourced Reporting
 * Constitutional Guarantee: Deterministic bucketing, no raw data persistence
 * Implements crowdsourced input with geohashing aggregation
 */

import {
  bucketTime,
  gridLocation,
  sanitizeCategory,
  validateConfidence,
  sanitizeSource,
  generateGeohash,
  GridCell,
  ReportCategory,
} from './sanitize';
import crypto from 'crypto';

export interface RawReport {
  timestamp: string;
  location: {
    lat: number;
    lng: number;
  };
  category: string;
  confidence: number;
  source: string;
  additionalInfo?: string;
}

export interface SanitizedReport {
  id: string;
  timestampBucket: string;
  locationGrid: GridCell;
  geohash: string;
  category: ReportCategory;
  confidence: number;
  source: string;
  additionalInfo?: string;
  expiresAt: string;
  createdAt: string;
}

export interface AggregateKey {
  timeBucket: string;
  geohash: string;
  category: ReportCategory;
}

export interface AggregatedData {
  count: number;
  avgConfidence: number;
  reports: Array<{
    id: string;
    confidence: number;
    additionalInfo?: string;
  }>;
}

/**
 * Generate anonymous report ID without linking to user
 * Constitutional Guarantee: No user tracking
 */
function generateReportId(report: Partial<SanitizedReport>): string {
  const data = {
    timestamp: report.timestampBucket,
    location: report.locationGrid,
    category: report.category,
    confidence: report.confidence,
    nonce: crypto.randomBytes(16).toString('hex'),
  };
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex').slice(0, 32);
}

/**
 * Sanitize and prepare report for aggregation
 * Constitutional Guarantee: All precision stripped before processing
 */
export function sanitizeReport(raw: RawReport, ttlHours: number = 4): SanitizedReport {
  const timestampBucket = bucketTime(raw.timestamp);
  const locationGrid = gridLocation(raw.location.lat, raw.location.lng);
  const geohash = generateGeohash(locationGrid);
  const category = sanitizeCategory(raw.category);
  const confidence = validateConfidence(raw.confidence);
  const source = sanitizeSource(raw.source);

  const expiresAt = new Date(new Date(timestampBucket).getTime() + ttlHours * 60 * 60 * 1000).toISOString();

  const sanitized: Partial<SanitizedReport> = {
    timestampBucket,
    locationGrid,
    geohash,
    category,
    confidence,
    source,
    additionalInfo: raw.additionalInfo,
    expiresAt,
    createdAt: new Date().toISOString(),
  };

  return {
    ...sanitized,
    id: generateReportId(sanitized),
  } as SanitizedReport;
}

/**
 * Create aggregation key for bucketing
 * Constitutional Guarantee: Deterministic, no user linkage
 */
export function makeAggregateKey(report: SanitizedReport): string {
  return `${report.timestampBucket}|${report.geohash}|${report.category}`;
}

/**
 * Aggregate reports by time bucket, location grid, and category
 * Constitutional Guarantee: Only aggregates published, no raw data
 */
export function aggregateReports(reports: SanitizedReport[]): Map<string, AggregatedData> {
  const buckets = new Map<string, AggregatedData>();

  for (const report of reports) {
    const key = makeAggregateKey(report);

    if (!buckets.has(key)) {
      buckets.set(key, {
        count: 0,
        avgConfidence: 0,
        reports: [],
      });
    }

    const bucket = buckets.get(key)!;
    bucket.count += 1;
    bucket.reports.push({
      id: report.id,
      confidence: report.confidence,
      additionalInfo: report.additionalInfo,
    });
  }

  // Calculate average confidence
  for (const bucket of buckets.values()) {
    const totalConfidence = bucket.reports.reduce((sum, r) => sum + r.confidence, 0);
    bucket.avgConfidence = Number((totalConfidence / bucket.count).toFixed(4));
  }

  return buckets;
}

/**
 * Clean up expired reports
 * Constitutional Guarantee: No persistent raw data
 */
export function cleanupExpiredReports(reports: SanitizedReport[]): SanitizedReport[] {
  const now = new Date();
  return reports.filter(report => new Date(report.expiresAt) > now);
}

/**
 * Calculate distance between two grid cells (approximate)
 * Used for radius queries
 */
export function calculateGridDistance(cell1: GridCell, cell2: GridCell): number {
  const latDiff = Math.abs(cell1.lat - cell2.lat) * 111.0; // km per degree
  const lngDiff = Math.abs(cell1.lng - cell2.lng) * 111.0 * Math.cos(((cell1.lat + cell2.lat) / 2) * (Math.PI / 180));
  return Math.sqrt(latDiff ** 2 + lngDiff ** 2);
}
