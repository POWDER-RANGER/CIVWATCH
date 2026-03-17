import { z } from 'zod';

// Valid report categories
export const CategoryEnum = z.enum(['presence', 'checkpoint', 'activity']);

// Canonical Report schema — enforced at ingestion boundary
// Raw lat/lon NEVER accepted. Timestamps must align to 5-min windows.
export const ReportSchema = z.object({
  timestamp: z.number().int().refine(
    (t) => t % 300 === 0,
    { message: 'Timestamp must be rounded to 5-minute window (multiples of 300)' }
  ),
  geo_cell: z.string().min(1).max(64).regex(
    /^[a-f0-9]{8,16}$/,
    { message: 'geo_cell must be a hex grid hash — raw coordinates not accepted' }
  ),
  category: CategoryEnum,
  confidence: z.number().min(0).max(1),
});

export type Report = z.infer<typeof ReportSchema>;

// Raw input shape (untrusted — never passes this type downstream)
export interface RawInput {
  timestamp?: unknown;
  geo_cell?: unknown;
  location?: unknown;
  lat?: unknown;
  lon?: unknown;
  type?: unknown;
  category?: unknown;
  confidence?: unknown;
  [key: string]: unknown;
}
