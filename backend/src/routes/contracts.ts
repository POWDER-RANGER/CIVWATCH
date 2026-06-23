/**
 * CIVWATCH - Contracts Routes
 * USASpending.gov contract search and import
 * Fully open API - no key required
 */

import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';

const router = Router();

// Validation schemas
const searchSchema = z.object({
  keyword: z.string().optional(),
  awarding_agency: z.string().optional(),
  date_range: z.string().optional(), // "2024-01-01,2024-12-31"
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
    recipient_name: z.string().optional(),
    awarding_agency: z.string().optional(),
    contract_type: z.string().optional(),
    published_date: z.string().nullable().optional(),
    raw_text: z.string(),
  })),
});

// Search USASpending contracts
router.get('/search', authenticate, validateQuery(searchSchema), async (req, res, next) => {
  try {
    const { keyword, awarding_agency, date_range, min_amount, max_amount, limit } = req.query;
    
    // Call scraper service for live data
    const scraperUrl = process.env.SCRAPER_URL || 'http://scraper:5001';
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword as string);
    if (awarding_agency) params.append('awarding_agency', awarding_agency as string);
    if (date_range) params.append('date_range', date_range as string);
    if (min_amount) params.append('min_amount', min_amount as string);
    if (max_amount) params.append('max_amount', max_amount as string);
    params.append('limit', (limit as string) || '100');
    params.append('forward', 'false'); // Don't auto-forward, we handle import
    
    const response = await fetch(`${scraperUrl}/scrape/usaspending/awards?${params}`);
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

// Import contracts into CIVWATCH
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
            amount, recipient_name, awarding_agency, raw_text, metadata, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
            'contracts',
            record.published_date,
            record.amount,
            record.recipient_name,
            record.awarding_agency,
            record.raw_text,
            JSON.stringify({
              contract_type: record.contract_type,
              import_source: 'usaspending',
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

// Get contract by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM documents WHERE id = $1 AND source_category = $2',
      [req.params.id, 'contracts']
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// List imported contracts with pagination
router.get('/', authenticate, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = (page - 1) * limit;
    
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM documents WHERE source_category = 'contracts'"
    );
    const total = parseInt(countResult.rows[0].count);
    
    const result = await pool.query(
      `SELECT id, title, url, amount, recipient_name, awarding_agency, 
              published_date, created_at, metadata
       FROM documents 
       WHERE source_category = 'contracts'
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
