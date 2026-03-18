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

    if (!token) {
      ws.close(1008, 'Token required');
      return;
    }

    try {
      const user = verifyAccessToken(token);
      ws.user = user; // Attach user payload for potential targeted broadcasting later
    } catch {
      ws.close(1008, 'Invalid token');
      return;
    }
  });

  // Subscribe to Redis 'orders' channel and broadcast to all authenticated clients
  subscriber.subscribe('orders', (message) => {
    wss.clients.forEach((client) => {
      if (client.readyState === 1 && client.user) {
        client.send(message); // message is already JSON
      }
    });
  }).catch(err => logger.error('Redis subscription failed', { err }));

  logger.info('WebSocket Server attached');
  return wss;
};
