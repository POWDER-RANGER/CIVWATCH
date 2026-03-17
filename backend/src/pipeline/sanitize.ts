import { Report, RawInput, ReportSchema, CategoryEnum } from './schema';

const WINDOW_SIZE = 300; // 5-minute buckets in seconds

/** Round timestamp down to nearest 5-minute window */
function roundToWindow(ts: number): number {
  return Math.floor(ts / WINDOW_SIZE) * WINDOW_SIZE;
}

/** Clamp confidence to [0, 1] */
function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/** Normalize category string to valid enum value */
function normalizeCategory(input: unknown): Report['category'] | null {
  const raw = String(input).toLowerCase().trim();
  const result = CategoryEnum.safeParse(raw);
  return result.success ? result.data : null;
}

/**
 * Sanitize — deterministic trust firewall.
 *
 * HARD REJECTIONS (returns null):
 * - Raw lat/lon fields present
 * - Timestamp not on 5-min window boundary
 * - geo_cell missing or malformed
 * - Unknown/invalid category
 * - Confidence out of range
 *
 * Returns typed Report or null. Never throws.
 */
export function sanitize(input: RawInput): Report | null {
  // HARD REJECT: raw coordinates
  if (input.lat !== undefined || input.lon !== undefined) {
    return null;
  }

  // Coerce and validate timestamp
  const rawTs = Number(input.timestamp);
  if (!Number.isFinite(rawTs) || rawTs <= 0) return null;
  const timestamp = roundToWindow(rawTs);

  // Validate geo_cell
  const geo_cell = String(input.geo_cell ?? '');
  if (!/^[a-f0-9]{8,16}$/.test(geo_cell)) return null;

  // Normalize category
  const category = normalizeCategory(input.category ?? input.type);
  if (!category) return null;

  // Clamp confidence
  const rawConf = Number(input.confidence);
  if (!Number.isFinite(rawConf)) return null;
  const confidence = clamp(rawConf, 0, 1);

  // Final schema validation
  const result = ReportSchema.safeParse({ timestamp, geo_cell, category, confidence });
  return result.success ? result.data : null;
}
