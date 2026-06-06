/**
 * anomalyListener.ts
 *
 * Maintains a single dedicated pg.Client subscribed to 'alerts_channel'.
 * When PostgreSQL fires the anomaly_events_notify trigger (migration 003),
 * this listener receives the row payload and broadcasts it to all connected
 * socket.io clients via io.emit('new_anomaly', payload).
 *
 * IMPORTANT: Uses a dedicated pg.Client — NOT the shared pool.
 * LISTEN/NOTIFY requires a persistent connection that must never be
 * returned to the pool between queries, which would silently drop the
 * subscription. Keep this client separate forever.
 */
import { Client }           from 'pg';
import { Server as IO }     from 'socket.io';

let listenerClient: Client | null = null;
let _io: IO | null = null;

export async function startAnomalyListener(io: IO): Promise<void> {
  _io = io;

  listenerClient = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await listenerClient.connect();

  listenerClient.on('notification', (msg) => {
    if (msg.channel !== 'alerts_channel' || !msg.payload) return;
    try {
      const anomaly = JSON.parse(msg.payload);
      io.emit('new_anomaly', anomaly);
      console.log(`[anomalyListener] broadcast new_anomaly id=${anomaly.id ?? '?'}`);
    } catch (err) {
      console.error('[anomalyListener] payload parse error:', err);
    }
  });

  listenerClient.on('error', async (err) => {
    console.error('[anomalyListener] pg connection error — reconnecting in 5s:', err.message);
    listenerClient = null;
    setTimeout(() => {
      if (_io) startAnomalyListener(_io).catch(console.error);
    }, 5000);
  });

  await listenerClient.query('LISTEN alerts_channel');
  console.log('[anomalyListener] ✅ Listening on alerts_channel');
}

export async function stopAnomalyListener(): Promise<void> {
  if (listenerClient) {
    try {
      await listenerClient.query('UNLISTEN alerts_channel');
      await listenerClient.end();
    } catch {
      // ignore errors on shutdown
    }
    listenerClient = null;
  }
}
