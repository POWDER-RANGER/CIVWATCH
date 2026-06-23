/**
 * CIVWATCH - Campaign Finance Routes
 * FEC OpenFEC API integration for contribution search and import
 * No API key required for basic access
 */

import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';

const router = Router();

// Validation schemas
const searchSchema = z.object({
  committee_id: z.string().optional(),
  candidate_id: z.string().optional(),
  contributor_name: z.string().optional(),
  min_date: z.string().optional(), // YYYY-MM-DD
  max_date: z.string().optional(),
  min_amount: z.number().optional(),
  max_amount: z.number().optional(),
  limit: z.number().min(1).max(500).default(100),
});

const importSchema = z.object({
  records: z.array(z.object({
    raw_id: z.string(),
    title: z.string(),
    source_url: z.string(),
    amount: z.number().optional(),
    contributor_name: z.string().optional(),
    contributor_occupation: z.string().optional(),
    contributor_employer: z.string().optional(),
    committee_name: z.string().optional(),
    published_date: z.string().nullable().optional(),
    raw_text: z.string(),
  })),
});

// Search FEC contributions
router.get('/search', authenticate, validateQuery(searchSchema), async (req, res, next) => {
  try {
    const { committee_id, candidate_id, contributor_name, min_date, max_date, limit } = req.query;
    
    const scraperUrl = process.env.SCRAPER_URL || 'http://scraper:5001';
    const params = new URLSearchParams();
    if (committee_id) params.append('committee_id', committee_id as string);
    if (candidate_id) params.append('candidate_id', candidate_id as string);
    if (min_date) params.append('min_date', min_date as string);
    if (max_date) params.append('max_date', max_date as string);
    params.append('per_page', (limit as string) || '100');
    params.append('forward', 'false');
    
    const response = await fetch(`${scraperUrl}/scrape/fec/contributions?${params}`);
    if (!response.ok) {
      throw new Error(`Scraper error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json({
      success: true,
      count: data.count,
      records: data.records,
    });
  } catch (err) {
    next(err);
  }
});

// Search FEC committees
router.get('/committees', authenticate, async (req, res, next) => {
  try {
    const { q, limit } = req.query;
    
    const scraperUrl = process.env.SCRAPER_URL || 'http://scraper:5001';
    const params = new URLSearchParams();
    if (q) params.append('query', q as string);
    params.append('per_page', (limit as string) || '100');
    
    const response = await fetch(`${scraperUrl}/scrape/fec/committees?${params}`);
    if (!response.ok) {
      throw new Error(`Scraper error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json({
      success: true,
      count: data.count,
      committees: data.records,
    });
  } catch (err) {
    next(err);
  }
});

// Import contributions into CIVWATCH
router.post('/import', authenticate, requireRole('analyst'), validateBody(importSchema), async (req, res, next) => {
  try {
    const { records } = req.body;
    const imported = [];
    const errors = [];
    
    for (const record of records) {
      try {
        const result = await pool.query(
          `INSERT INTO documents 
           (source_id, title, url, source_category, published_date,
            amount, contributor_name, raw_text, metadata, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (url) DO UPDATE SET
             title = EXCLUDED.title,
             amount = EXCLUDED.amount,
             raw_text = EXCLUDED.raw_text,
             updated_at = NOW()
           RETURNING *`,
          [
            record.raw_id,
            record.title,
            record.source_url,
            'campaign_finance',
            record.published_date,
            record.amount,
            record.contributor_name,
            record.raw_text,
            JSON.stringify({
              contributor_occupation: record.contributor_occupation,
              contributor_employer: record.contributor_employer,
              committee_name: record.committee_name,
              import_source: 'fec',
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

// Get contribution by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM documents WHERE id = $1 AND source_category = $2',
      [req.params.id, 'campaign_finance']
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contribution record not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// List imported campaign finance records
router.get('/', authenticate, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = (page - 1) * limit;
    
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM documents WHERE source_category = 'campaign_finance'"
    );
    const total = parseInt(countResult.rows[0].count);
    
    const result = await pool.query(
      `SELECT id, title, url, amount, contributor_name, published_date,
              created_at, metadata
       FROM documents 
       WHERE source_category = 'campaign_finance'
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
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
