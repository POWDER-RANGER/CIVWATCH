/**
 * CIVWATCH - Legislation Routes
 * Congress.gov + OpenStates legislation search and import
 * Congress.gov: no key required (5000/day limit)
 * OpenStates: optional key for higher limits
 */

import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';

const router = Router();

// Validation schemas
const federalSearchSchema = z.object({
  congress: z.number().optional(),
  query: z.string().optional(),
  subject: z.string().optional(),
  limit: z.number().min(1).max(250).default(50),
});

const stateSearchSchema = z.object({
  state: z.string().length(2).optional(),
  session: z.string().optional(),
  query: z.string().optional(),
  subject: z.string().optional(),
  limit: z.number().min(1).max(250).default(50),
});

const importSchema = z.object({
  records: z.array(z.object({
    raw_id: z.string(),
    title: z.string(),
    source_url: z.string(),
    published_date: z.string().nullable().optional(),
    congress: z.number().optional(),
    bill_number: z.string().optional(),
    bill_type: z.string().optional(),
    state: z.string().optional(),
    session: z.string().optional(),
    latest_action: z.any().optional(),
    raw_text: z.string(),
  })),
});

// --- Federal: Congress.gov ---

// Search federal bills
router.get('/federal/search', authenticate, validateQuery(federalSearchSchema), async (req, res, next) => {
  try {
    const { congress, query, subject, limit } = req.query;
    
    const scraperUrl = process.env.SCRAPER_URL || 'http://scraper:5001';
    const params = new URLSearchParams();
    if (congress) params.append('congress', congress as string);
    if (query) params.append('query', query as string);
    if (subject) params.append('subject', subject as string);
    params.append('limit', (limit as string) || '50');
    params.append('forward', 'false');
    
    const response = await fetch(`${scraperUrl}/scrape/congress/bills?${params}`);
    if (!response.ok) {
      throw new Error(`Scraper error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json({
      success: true,
      source: 'congress.gov',
      count: data.count,
      records: data.records,
    });
  } catch (err) {
    next(err);
  }
});

// Get federal bill detail
router.get('/federal/bill/:congress/:billType/:billNumber', authenticate, async (req, res, next) => {
  try {
    const { congress, billType, billNumber } = req.params;
    
    const scraperUrl = process.env.SCRAPER_URL || 'http://scraper:5001';
    const response = await fetch(
      `${scraperUrl}/scrape/congress/bill/${congress}/${billType}/${billNumber}`
    );
    if (!response.ok) {
      throw new Error(`Scraper error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json({
      success: true,
      source: 'congress.gov',
      ...data,
    });
  } catch (err) {
    next(err);
  }
});

// --- State: OpenStates ---

// Search state bills
router.get('/state/search', authenticate, validateQuery(stateSearchSchema), async (req, res, next) => {
  try {
    const { state, session, query, subject, limit } = req.query;
    
    const scraperUrl = process.env.SCRAPER_URL || 'http://scraper:5001';
    const params = new URLSearchParams();
    if (state) params.append('state', (state as string).toLowerCase());
    if (session) params.append('session', session as string);
    if (query) params.append('query', query as string);
    if (subject) params.append('subject', subject as string);
    params.append('limit', (limit as string) || '50');
    params.append('forward', 'false');
    
    const response = await fetch(`${scraperUrl}/scrape/openstates/bills?${params}`);
    if (!response.ok) {
      throw new Error(`Scraper error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json({
      success: true,
      source: 'openstates',
      count: data.count,
      records: data.records,
    });
  } catch (err) {
    next(err);
  }
});

// Get state legislators
router.get('/state/legislators', authenticate, async (req, res, next) => {
  try {
    const { state, chamber, limit } = req.query;
    
    const scraperUrl = process.env.SCRAPER_URL || 'http://scraper:5001';
    const params = new URLSearchParams();
    if (state) params.append('state', (state as string).toLowerCase());
    if (chamber) params.append('chamber', chamber as string);
    params.append('limit', (limit as string) || '100');
    
    const response = await fetch(`${scraperUrl}/scrape/openstates/people?${params}`);
    if (!response.ok) {
      throw new Error(`Scraper error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json({
      success: true,
      source: 'openstates',
      count: data.count,
      legislators: data.records,
    });
  } catch (err) {
    next(err);
  }
});

// Import legislation into CIVWATCH
router.post('/import', authenticate, requireRole('analyst'), validateBody(importSchema), async (req, res, next) => {
  try {
    const { records } = req.body;
    const imported = [];
    const errors = [];
    
    for (const record of records) {
      try {
        const isFederal = !!record.congress;
        const category = isFederal ? 'federal_legislation' : 'state_legislation';
        
        const result = await pool.query(
          `INSERT INTO documents 
           (source_id, title, url, source_category, published_date,
            congress, bill_number, bill_type, state, session,
            raw_text, metadata, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (url) DO UPDATE SET
             title = EXCLUDED.title,
             raw_text = EXCLUDED.raw_text,
             latest_action = EXCLUDED.latest_action,
             updated_at = NOW()
           RETURNING *`,
          [
            record.raw_id,
            record.title,
            record.source_url,
            category,
            record.published_date,
            record.congress || null,
            record.bill_number || null,
            record.bill_type || null,
            record.state || null,
            record.session || null,
            record.raw_text,
            JSON.stringify({
              latest_action: record.latest_action,
              import_source: isFederal ? 'congress.gov' : 'openstates',
              imported_by: req.user?.id,
            }),
            req.user?.id,
          ]
        );
        imported.push(result.rows[0]);
      } catch (err) {
        errors.push({ record: record.raw_id, error: (err as Error).message });
      }
    }
    
    res.json({
      success: true,
      imported: imported.length,
      errors: errors.length,
      records: imported,
      error_details: errors,
    });
  } catch (err) {
    next(err);
  }
});

// List imported legislation
router.get('/', authenticate, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = (page - 1) * limit;
    const jurisdiction = req.query.jurisdiction as string; // 'federal' | 'state'
    
    let whereClause = "source_category IN ('federal_legislation', 'state_legislation')";
    const params: any[] = [limit, offset];
    
    if (jurisdiction === 'federal') {
      whereClause = "source_category = 'federal_legislation'";
    } else if (jurisdiction === 'state') {
      whereClause = "source_category = 'state_legislation'";
    }
    
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM documents WHERE ${whereClause}`
    );
    const total = parseInt(countResult.rows[0].count);
    
    const result = await pool.query(
      `SELECT id, title, url, congress, bill_number, bill_type, state, session,
              published_date, created_at, metadata
       FROM documents 
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    );
    
    res.json({
      records: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
