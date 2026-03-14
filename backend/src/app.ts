import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { healthCheck, statusCheck } from './routes/health';
import authRouter    from './routes/auth';
import sourcesRouter from './routes/sources';
import analyticsRouter from './routes/analytics';
import alertsRouter  from './routes/alerts';

const app = express();

// ── Security middleware ───────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(','),
  credentials: true,
}));

// ── Rate limiting (auth endpoints) ───────────────────────────
const authLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } },
});

// ── Body parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// ── Routes ───────────────────────────────────────────────────
app.get('/api/health', healthCheck);
app.get('/api/status', statusCheck);
app.use('/api/auth',      authLimiter, authRouter);
app.use('/api/sources',   sourcesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/alerts',    alertsRouter);

// ── 404 ──────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

// ── Global error handler ─────────────────────────────────────
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
});

export default app;
