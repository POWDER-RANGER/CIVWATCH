/**
 * CIVWATCH - WebSocket Service
 * Socket.io with authentication, rooms, and targeted emits
 */

import { Server } from 'socket.io';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

interface AuthenticatedSocket {
  userId: string;
  email: string;
  role: string;
}

let io: Server | null = null;

/**
 * Initialize Socket.io on the HTTP server
 */
export function initializeWebSocket(httpServer: ReturnType<typeof createServer>): Server {
  io = new Server(httpServer, {
    path: '/socket.io',
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL || 'http://localhost:80']
        : ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
    },
    // Support WebSocket and HTTP long-polling fallbacks
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        // Allow connection as anonymous for public dashboards
        (socket as any).user = null;
        return next();
      }
      
      const decoded = jwt.verify(token as string, JWT_SECRET) as AuthenticatedSocket;
      (socket as any).user = decoded;
      
      next();
    } catch (err) {
      // Allow anonymous connections but don't authenticate
      (socket as any).user = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user;
    
    console.log(`[WS] Client connected: ${socket.id}`, user ? `User: ${user.email}` : 'Anonymous');

    // Join rooms based on role
    socket.join('public');
    
    if (user) {
      socket.join(`user:${user.userId}`);
      
      if (user.role === 'analyst' || user.role === 'admin') {
        socket.join('analysts');
      }
      if (user.role === 'admin') {
        socket.join('admins');
      }
    }

    // Handle client subscribing to specific data feeds
    socket.on('subscribe', (feed: string) => {
      const allowedFeeds = ['anomalies', 'alerts', 'ingest', 'analytics'];
      if (allowedFeeds.includes(feed)) {
        socket.join(`feed:${feed}`);
        socket.emit('subscribed', { feed });
      }
    });

    socket.on('unsubscribe', (feed: string) => {
      socket.leave(`feed:${feed}`);
      socket.emit('unsubscribed', { feed });
    });

    // Ping-pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    socket.on('disconnect', (reason) => {
      console.log(`[WS] Client disconnected: ${socket.id}, reason: ${reason}`);
    });
  });

  return io;
}

/**
 * Get the io instance
 */
export function getIO(): Server {
  if (!io) {
    throw new Error('WebSocket not initialized. Call initializeWebSocket first.');
  }
  return io;
}

/**
 * Emit anomaly to relevant users
 */
export function emitAnomaly(anomaly: any): void {
  if (!io) return;
  
  io.to('feed:anomalies').to('analysts').emit('anomaly:detected', {
    ...anomaly,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Emit alert event
 */
export function emitAlert(alert: any): void {
  if (!io) return;
  
  io.to('feed:alerts').to('analysts').emit('alert:triggered', {
    ...alert,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Emit ingestion progress
 */
export function emitIngestProgress(progress: { source: string; processed: number; total: number }): void {
  if (!io) return;
  
  io.to('feed:ingest').emit('ingest:progress', {
    ...progress,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Emit to a specific user
 */
export function emitToUser(userId: string, event: string, data: any): void {
  if (!io) return;
  
  io.to(`user:${userId}`).emit(event, {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Broadcast to all connected clients
 */
export function broadcast(event: string, data: any): void {
  if (!io) return;
  
  io.emit(event, {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get connection statistics
 */
export function getConnectionStats(): { total: number; byRoom: Record<string, number> } {
  if (!io) return { total: 0, byRoom: {} };
  
  const rooms = io.sockets.adapter.rooms;
  const byRoom: Record<string, number> = {};
  
  rooms.forEach((sockets, room) => {
    // Skip individual socket rooms (they have the same name as the socket id)
    if (!room.startsWith('/') && room !== sockets.keys().next().value) {
      byRoom[room] = sockets.size;
    }
  });
  
  return {
    total: io.engine.clientsCount,
    byRoom,
  };
}
