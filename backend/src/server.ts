import http                        from 'http';
import { Server as SocketServer }  from 'socket.io';
import app                         from './app';
import dotenv                      from 'dotenv';
import { connectPg }               from './db';
import { connectRedis }            from './db/redis';
import { startAnomalyListener, stopAnomalyListener } from './listeners/anomalyListener';
import './routes/ingest';
import './routes/anomalies';

dotenv.config();

const PORT       = Number(process.env.PORT ?? 3000);
const CLIENT_URL = process.env.CORS_ORIGINS ?? 'http://localhost:4000';

async function start() {
  await connectPg();
  await connectRedis();

  // ── HTTP server (required so socket.io shares the same port as Express)
  const httpServer = http.createServer(app);

  // ── Socket.io — real-time anomaly push to dashboard
  const io = new SocketServer(httpServer, {
    cors: {
      origin:      CLIENT_URL.split(','),
      methods:     ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`[socket.io] client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`[socket.io] client disconnected: ${socket.id}`);
    });
  });

  // ── pg LISTEN/NOTIFY → socket.io broadcast
  await startAnomalyListener(io);

  httpServer.listen(PORT, () => {
    console.log(`🚀 CIVWATCH Backend    → http://localhost:${PORT}`);
    console.log(`   Health              → http://localhost:${PORT}/api/health`);
    console.log(`   WebSocket           → ws://localhost:${PORT}`);
  });

  // ── Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n[${signal}] Shutting down gracefully…`);
    await stopAnomalyListener();
    httpServer.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}

start().catch(err => {
  console.error('❌ Startup failed:', err);
  process.exit(1);
});
