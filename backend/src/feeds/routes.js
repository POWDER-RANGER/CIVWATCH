/**
 * CIVWATCH Feed Routes
 * Exposes feed data to the frontend via REST.
 * Mount this in backend/src/index.js: app.use('/api/feeds', require('./feeds/routes'));
 */

const express = require('express');
const router = express.Router();
const { getAllFeedEvents, getFeedEventsByTag, feedCache } = require('./ingestor');

// GET /api/feeds — all normalized feed events
router.get('/', (req, res) => {
  res.json(getAllFeedEvents());
});

// GET /api/feeds/tag/:tag — filter by tag
router.get('/tag/:tag', (req, res) => {
  res.json(getFeedEventsByTag(req.params.tag));
});

// GET /api/feeds/source/:id — single source latest events
router.get('/source/:id', (req, res) => {
  const events = feedCache[req.params.id];
  if (!events) return res.status(404).json({ error: 'source not found or not yet polled' });
  res.json(events);
});

// GET /api/feeds/geo — all events that have a geo coordinate (for map layer)
router.get('/geo', (req, res) => {
  const events = getAllFeedEvents().filter(e => e.geo && e.geo.lat && e.geo.lng);
  res.json(events);
});

module.exports = router;
