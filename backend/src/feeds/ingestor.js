/**
 * CIVWATCH Feed Ingestor
 * Polls all enabled sources in source_registry.json and emits normalized FeedEvents.
 * Runs as a standalone service or imported into the main backend.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { normalizeEvent } = require('./normalizer');

const REGISTRY_PATH = path.join(__dirname, 'source_registry.json');
const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));

const activeTimers = {};
const feedCache = {}; // in-memory: sourceId -> latest FeedEvent[]

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'CIVWATCH/1.0 (civic transparency)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Parse error for ${url}: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

async function pollSource(source) {
  if (!source.enabled) return;
  if (source.type === 'yt_live' || source.type === 'webcam_embed') {
    // Static embed sources — just normalize directly, no HTTP fetch needed
    const event = normalizeEvent(source, null);
    feedCache[source.id] = [event];
    return;
  }
  try {
    const raw = await fetchJSON(source.url);
    const events = Array.isArray(raw)
      ? raw.map(item => normalizeEvent(source, item))
      : [normalizeEvent(source, raw)];
    feedCache[source.id] = events;
    console.log(`[CIVWATCH FIL] ${source.id}: ${events.length} events cached`);
  } catch (err) {
    console.error(`[CIVWATCH FIL] ${source.id} error: ${err.message}`);
  }
}

function startIngestor() {
  console.log(`[CIVWATCH FIL] Starting with ${registry.length} sources`);
  for (const source of registry) {
    if (!source.enabled) continue;
    // Initial poll immediately
    pollSource(source);
    // Then poll on interval (skip for 0 rate_limit static embeds)
    if (source.rate_limit_ms > 0) {
      activeTimers[source.id] = setInterval(() => pollSource(source), source.rate_limit_ms);
    }
  }
}

function stopIngestor() {
  for (const id of Object.keys(activeTimers)) {
    clearInterval(activeTimers[id]);
    delete activeTimers[id];
  }
}

function getAllFeedEvents() {
  return Object.values(feedCache).flat();
}

function getFeedEventsByTag(tag) {
  return getAllFeedEvents().filter(e => e.tags && e.tags.includes(tag));
}

module.exports = { startIngestor, stopIngestor, getAllFeedEvents, getFeedEventsByTag, feedCache };

// Run standalone if called directly
if (require.main === module) {
  startIngestor();
  console.log('[CIVWATCH FIL] Ingestor running. Ctrl+C to stop.');
}
