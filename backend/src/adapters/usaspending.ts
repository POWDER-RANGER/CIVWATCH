/**
 * USASpending.gov Adapter
 *
 * Fetches federal award/spending records from the USASpending.gov public API.
 * No API key required. Free and open access.
 *
 * Docs: https://api.usaspending.gov/
 *
 * Endpoints used:
 *   POST /api/v2/search/spending_by_award/   — full-text award search
 *   POST /api/v2/spending/   — summary spending by agency
 */

import type { ParsedItem } from '../services/ingestionWorker';

const BASE_URL = 'https://api.usaspending.gov';
const TIMEOUT_MS = 20_000;
const MAX_RESULTS = 50;

export interface USASpendingConfig {
  keyword?: string;
  agency?: string;
  fiscal_year?: number;
  award_type_codes?: string[];
  limit?: number;
}

interface AwardResult {
  Award_ID: string;
  Recipient_Name: string;
  Award_Amount: number;
  Awarding_Agency: string;
  Awarding_Sub_Agency: string;
  Award_Type: string;
  Start_Date: string;
  Description: string;
  generated_internal_id: string;
}

interface USASpendingResponse {
  results: AwardResult[];
  page_metadata: { total: number; page: number; hasNext: boolean };
}

export class USASpendingAdapter {
  static async fetch(config: USASpendingConfig): Promise<ParsedItem[]> {
    const keyword = config.keyword ?? 'contract award';
    const limit = Math.min(config.limit ?? MAX_RESULTS, 100);
    const fiscal_year = config.fiscal_year ?? new Date().getFullYear();

    const payload = {
      filters: {
        keywords: [keyword],
        time_period: [
          {
            start_date: `${fiscal_year - 1}-10-01`,
            end_date: `${fiscal_year}-09-30`,
          },
        ],
        award_type_codes: config.award_type_codes ?? [
          'A', 'B', 'C', 'D',  // contracts
          '02', '03', '04', '05', // grants
        ],
        ...(config.agency ? { agencies: [{ type: 'awarding', tier: 'toptier', name: config.agency }] } : {}),
      },
      fields: [
        'Award_ID',
        'Recipient_Name',
        'Award_Amount',
        'Awarding_Agency',
        'Awarding_Sub_Agency',
        'Award_Type',
        'Start_Date',
        'Description',
        'generated_internal_id',
      ],
      page: 1,
      limit,
      sort: 'Award_Amount',
      order: 'desc',
    };

    const res = await fetch(`${BASE_URL}/api/v2/search/spending_by_award/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new Error(`[usaspending] HTTP ${res.status}: ${res.statusText}`);
    }

    const data = (await res.json()) as USASpendingResponse;

    return data.results.map((award): ParsedItem => {
      const amount = award.Award_Amount
        ? `$${award.Award_Amount.toLocaleString()}`
        : 'Amount undisclosed';
      const recipient = award.Recipient_Name ?? 'Unknown Recipient';
      const agency = award.Awarding_Agency ?? 'Unknown Agency';
      const subAgency = award.Awarding_Sub_Agency ?? '';
      const awardType = award.Award_Type ?? '';
      const description = award.Description ?? '';

      const title = `${awardType} Award: ${recipient} — ${amount} from ${agency}`;
      const body = [
        `Recipient: ${recipient}`,
        `Amount: ${amount}`,
        `Awarding Agency: ${agency}${subAgency ? ` / ${subAgency}` : ''}`,
        `Award Type: ${awardType}`,
        `Start Date: ${award.Start_Date ?? 'N/A'}`,
        description ? `Description: ${description}` : '',
        `Award ID: ${award.Award_ID ?? award.generated_internal_id}`,
      ]
        .filter(Boolean)
        .join('\n');

      const url = award.generated_internal_id
        ? `https://www.usaspending.gov/award/${award.generated_internal_id}/`
        : null;

      return {
        title,
        body,
        url,
        publishedAt: award.Start_Date ?? null,
        metadata: {
          source: 'usaspending',
          award_id: award.Award_ID,
          award_amount: award.Award_Amount,
          awarding_agency: agency,
          award_type: awardType,
          fiscal_year,
        },
      };
    });
  }
}
