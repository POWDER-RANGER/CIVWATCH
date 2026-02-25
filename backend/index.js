const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health endpoint (required by docker-compose healthcheck)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'civwatch-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Status endpoint (legacy)
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    version: '0.1.0-alpha',
    phase: 'planning'
  });
});

// Placeholder anomalies endpoint
app.get('/api/anomalies', (req, res) => {
  res.json({
    anomalies: [],
    total: 0,
    message: 'Anomaly detection not yet implemented'
  });
});

// Placeholder ingest endpoint
app.post('/api/ingest', (req, res) => {
  res.status(202).json({
    received: true,
    id: Date.now(),
    message: 'Data ingestion not yet implemented'
  });
});

app.listen(PORT, () => {
  console.log(`[CIVWATCH Backend] Running on http://localhost:${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/api/health`);
  console.log(`  Status: http://localhost:${PORT}/api/status`);
  console.log(`  Phase: Pre-alpha (scaffolding phase)`);
});

module.exports = app;
