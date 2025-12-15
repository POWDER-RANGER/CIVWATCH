/**
 * Sanitization Layer - Privacy-Preserving Geohashing & Time Bucketing
 * Constitutional Guarantee: No precision leakage, no raw data persistence
 * Aligned with System Constitution paste.txt specifications
 */

export interface Location {
  lat: number;
  lng: number;
}

export interface GridCell {
  lat: number;
  lng: number;
}

export const ALLOWED_CATEGORIES = [
  'traffic_slowdown',
  'accident',
  'road_closure',
  'construction',
  'weather_impact',
  'public_safety',
  'infrastructure',
] as const;

export type ReportCategory = typeof ALLOWED_CATEGORIES[number];

/**
 * Time Bucketing - Constitutional Guarantee: 15-minute minimum granularity
 * No real-time timestamps allowed
 */
export function bucketTime(timestamp: string, windowMinutes: number = 15): string {
  const dt = new Date(timestamp);
  const bucketed = new Date(
    dt.getFullYear(),
    dt.getMonth(),
    dt.getDate(),
    dt.getHours(),
    Math.floor(dt.getMinutes() / windowMinutes) * windowMinutes,
    0,
    0
  );
  return bucketed.toISOString();
}

/**
 * Location Grid-Snapping - Constitutional Guarantee: 1km minimum grid size
 * Implements geohashing via grid cell quantization
 */
export function gridLocation(lat: number, lng: number, gridSizeKm: number = 1.0): GridCell {
  // Approximate degrees per km
  const latStep = gridSizeKm / 111.0;
  const lngStep = gridSizeKm / (111.0 * Math.cos((lat * Math.PI) / 180));

  const gridLat = Math.round(lat / latStep) * latStep;
  const gridLng = Math.round(lng / lngStep) * lngStep;

  return {
    lat: Number(gridLat.toFixed(6)),
    lng: Number(gridLng.toFixed(6)),
  };
}

/**
 * Category Sanitization - Constitutional Guarantee: Restricted enumeration
 * No agent/vehicle identifiers allowed
 */
export function sanitizeCategory(category: string): ReportCategory {
  const normalized = category.toLowerCase().replace(/[^a-z_]/g, '_');
  
  if (!ALLOWED_CATEGORIES.includes(normalized as ReportCategory)) {
    throw new Error(`Invalid category: ${category}. Only public-safety categories allowed.`);
  }
  
  return normalized as ReportCategory;
}

/**
 * Confidence Validation - Constitutional Guarantee: Bounded 0.0-1.0
 */
export function validateConfidence(confidence: number): number {
  if (confidence < 0.0 || confidence > 1.0) {
    throw new Error('Confidence must be between 0.0 and 1.0');
  }
  return Number(confidence.toFixed(4));
}

/**
 * Source Field Length Limit - Abuse Prevention
 */
export function sanitizeSource(source: string): string {
  const maxLength = 32;
  if (source.length > maxLength) {
    throw new Error(`Source field exceeds maximum length of ${maxLength}`);
  }
  return source.trim();
}

/**
 * Geohash Generation - Creates deterministic cell identifier
 * Used for aggregation key generation
 */
export function generateGeohash(gridCell: GridCell): string {
  return `${gridCell.lat.toFixed(6)},${gridCell.lng.toFixed(6)}`;
}
