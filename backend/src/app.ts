import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import client from './metrics/instrumentation';
import { env } from './config/env';

const app = express();

app.use(helmet({
  contentSecurityPolicy: false, // customize per-app
  hsts: { maxAge: 31536000, includeSubDomains: true }
}));
app.use(cors({ origin: env.CORS_ORIGINS ? env.CORS_ORIGINS.split(',').map(o => o.trim()) : '*', credentials: true }));

// metrics protection: requires METRICS_TOKEN env header
app.get('/metrics', (req, res) => {
  const token = req.headers['x-metrics-token'];
  if (!env.METRICS_TOKEN || token !== env.METRICS_TOKEN) return res.status(403).send('Forbidden');
  res.set('Content-Type', client.register.contentType);
  client.register.metrics().then(m => res.send(m)).catch(err => res.status(500).send(String(err)));
});

export default app;
