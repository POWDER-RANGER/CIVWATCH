/**
 * CIVWATCH - Environment Configuration
 * Zod-validated environment variables with sensible defaults
 */

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  FRONTEND_PORT: z.string().default('5173'),
  ML_PORT: z.string().default('5000'),
  SCRAPER_PORT: z.string().default('5001'),

  // Database
  DATABASE_URL: z.string().default('postgresql://civwatch:civwatch_dev@postgres:5432/civwatch'),
  POSTGRES_USER: z.string().default('civwatch'),
  POSTGRES_PASSWORD: z.string().default('civwatch_dev'),
  POSTGRES_DB: z.string().default('civwatch'),

  // Redis
  REDIS_URL: z.string().default('redis://redis:6379'),

  // JWT
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  REFRESH_TOKEN_SECRET: z.string().optional(),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),

  // API Keys (optional)
  CIVWATCH_API_KEY: z.string().optional(),
  OPENFEC_API_KEY: z.string().optional(),
  CONGRESS_API_KEY: z.string().optional(),
  OPENSTATES_API_KEY: z.string().optional(),

  // Scraper
  SCRAPER_URL: z.string().default('http://scraper:5001'),
  CIVWATCH_BACKEND_URL: z.string().default('http://backend:3000/api'),

  // ML
  ML_MODEL_PATH: z.string().default('/app/models'),
  ANOMALY_THRESHOLD: z.string().default('0.7'),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  ALERT_FROM_EMAIL: z.string().optional(),

  // Webhook
  WEBHOOK_URL: z.string().optional(),
});

let parsedEnv: z.infer<typeof envSchema>;

try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Environment validation failed:');
    error.errors.forEach((e) => {
      console.error(`  ${e.path.join('.')}: ${e.message}`);
    });
  }
  // In development, use defaults; in production, exit
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
  // Fallback for development
  parsedEnv = envSchema.parse({});
}

export const env = parsedEnv;
export default env;
