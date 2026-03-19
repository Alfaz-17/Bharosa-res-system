import { WebSocketServer } from 'ws';
import { verifyAccessToken } from '../utils/jwt.js';
import { subscriber } from '../config/redis.js';
import { logger } from '../utils/logger.js';

export const attachWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    // Read token from query string (e.g., ?token=...)
    const url = new URL(req.url, `ws://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (token) {
      try {
        const user = verifyAccessToken(token);
        ws.user = user; // Staff authentication
      } catch {
        logger.warn('WS: Invalid token provided, connecting as guest');
      }
    } else {
      logger.info('WS: No token provided, connecting as guest');
    }
  });

  // Subscribe to Redis 'orders' channel and broadcast to all authenticated and guest clients
  subscriber.subscribe('orders', (message) => {
    wss.clients.forEach((client) => {
      // Broadcast to all active connections
      if (client.readyState === 1) {
        client.send(message); 
      }
    });
  }).catch(err => logger.error('Redis subscription failed', { err }));

  logger.info('WebSocket Server attached');
  return wss;
};
