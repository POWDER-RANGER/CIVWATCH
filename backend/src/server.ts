import app from './app';
import dotenv from 'dotenv';
import { connectPg } from './db';
import { connectRedis } from './db/redis';
import './routes/ingest';
import './routes/anomalies';

dotenv.config();

const PORT = Number(process.env.PORT ?? 3000);

async function start() {
  await connectPg();
  await connectRedis();
  app.listen(PORT, () => {
    console.log(`🚀 CIVWATCH Backend running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
  });
}

start().catch(err => {
  console.error('❌ Startup failed:', err);
  process.exit(1);
});
