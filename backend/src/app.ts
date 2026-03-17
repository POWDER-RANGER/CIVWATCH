import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { latencyMiddleware, getLatencyStats } from './middleware/latency';
import { runMigrations } from './db/migrate';

import healthRouter    from './routes/health';
import authRouter      from './routes/auth';
import sourcesRouter   from './routes/sources';
import analyticsRouter from './routes/analytics';
import alertsRouter    from './routes/alerts';
import pipelineRouter  from './pipeline/routes';

const app = express();

// ── Security middleware
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
app.use(express.json({ limit: '2mb' }));

// Request ID
app.use((req, _res, next) => {
  (req as any).id = crypto.randomUUID();
  next();
});

// Global latency tracking
app.use(latencyMiddleware(500));

// Rate limiter on auth endpoints
const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Routes
app.use('/api', healthRouter);
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/sources', sourcesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/alerts', alertsRouter);

// Pipeline routes (ingestion, heatmap, trends, summary)
app.use('/', pipelineRouter);

// ── Metrics endpoint (latency stats + pipeline metrics)
app.get('/api/metrics', (_req, res) => {
  res.json({
    latency: getLatencyStats(),
    timestamp: new Date().toISOString(),
  });
});

// ── Error handler (must be last)
app.use(errorHandler);

// ── Boot
if (require.main === module) {
  runMigrations()
    .then(() => {
      app.listen(env.PORT, () => {
        console.log(`\u2705 CIVWATCH backend running on :${env.PORT} [${env.NODE_ENV}]`);
      });
    })
    .catch((e) => { console.error('Migration failed', e); process.exit(1); });
}

export default app;
