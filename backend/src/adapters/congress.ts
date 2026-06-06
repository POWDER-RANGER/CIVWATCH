/**
 * Congress.gov Adapter
 *
 * Fetches legislation, bills, amendments, and congressional records
 * from the Congress.gov API v3.
 *
 * Free API key available at: https://api.congress.gov/sign-up/
 * Set CONGRESS_API_KEY in .env — falls back to demo key (rate-limited).
 *
 * Docs: https://api.congress.gov/
 */

import type { ParsedItem } from '../services/ingestionWorker';
import { env } from '../config/env';

const BASE_URL = 'https://api.congress.gov/v3';
const TIMEOUT_MS = 20_000;
const DEFAULT_LIMIT = 50;

// Action types that indicate high-concern civic activity
const HIGH_CONCERN_ACTIONS = new Set([
  'Became Public Law',
  'Signed by President',
  'Passed Senate',
  'Passed House',
  'Failed of passage',
  'Vetoed by President',
]);

export interface CongressConfig {
  type?: 'bills' | 'amendments' | 'summaries' | 'nominations';
  congress?: number;          // e.g. 119 for 119th Congress
  chamber?: 'house' | 'senate';
  limit?: number;
  fromDateTime?: string;      // ISO 8601
  toDateTime?: string;
}

interface BillItem {
  number: string;
  title: string;
  type: string;
  congress: number;
  originChamber: string;
  introducedDate: string;
  latestAction: { actionDate: string; text: string };
  url: string;
  sponsors?: Array<{ fullName: string; party: string; state: string }>;
}

interface CongressResponse {
  bills?: BillItem[];
  amendments?: BillItem[];
  pagination: { count: number; next?: string };
}

export class CongressAdapter {
  static async fetch(config: CongressConfig): Promise<ParsedItem[]> {
    const apiKey = (env as any).CONGRESS_API_KEY ?? 'DEMO_KEY';
    const type = config.type ?? 'bills';
    const limit = Math.min(config.limit ?? DEFAULT_LIMIT, 250);
    const congress = config.congress ?? 119;

    const params = new URLSearchParams({
      api_key: apiKey,
      limit: String(limit),
      format: 'json',
      sort: 'updateDate+desc',
    });

    if (config.fromDateTime) params.set('fromDateTime', config.fromDateTime);
    if (config.toDateTime) params.set('toDateTime', config.toDateTime);

    let endpoint: string;
    if (config.chamber) {
      endpoint = `/${type}/${congress}/${config.chamber.toUpperCase()}`;
    } else {
      endpoint = `/${type}/${congress}`;
    }

    const url = `${BASE_URL}${endpoint}?${params.toString()}`;

    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new Error(`[congress] HTTP ${res.status}: ${res.statusText}`);
    }

    const data = (await res.json()) as CongressResponse;
    const items: BillItem[] = data.bills ?? data.amendments ?? [];

    return items.map((bill): ParsedItem => {
      const latestAction = bill.latestAction?.text ?? '';
      const actionDate = bill.latestAction?.actionDate ?? '';
      const sponsor = bill.sponsors?.[0];
      const sponsorStr = sponsor
        ? `${sponsor.fullName} (${sponsor.party}-${sponsor.state})`
        : 'Unknown Sponsor';

      const isHighConcern = [...HIGH_CONCERN_ACTIONS].some(action =>
        latestAction.toLowerCase().includes(action.toLowerCase())
      );

      const title = `${bill.type ?? 'Bill'} ${bill.number}: ${bill.title ?? 'Untitled'}`;
      const body = [
        `Bill: ${bill.type} ${bill.number} (${bill.congress}th Congress)`,
        `Chamber: ${bill.originChamber ?? 'Unknown'}`,
        `Introduced: ${bill.introducedDate ?? 'N/A'}`,
        `Sponsor: ${sponsorStr}`,
        `Latest Action (${actionDate}): ${latestAction}`,
        isHighConcern ? '[HIGH CONCERN: Major legislative action detected]' : '',
      ]
        .filter(Boolean)
        .join('\n');

      return {
        title,
        body,
        url: bill.url ?? null,
        publishedAt: bill.introducedDate
          ? new Date(bill.introducedDate).toISOString()
          : null,
        metadata: {
          source: 'congress',
          bill_number: bill.number,
          bill_type: bill.type,
          congress: bill.congress,
          chamber: bill.originChamber,
          introduced_date: bill.introducedDate,
          latest_action: latestAction,
          latest_action_date: actionDate,
          is_high_concern: isHighConcern,
        },
      };
    });
  }
}
