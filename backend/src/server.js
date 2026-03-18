import http from 'http';
import app from './app.js';
import prisma from './config/prisma.js';
import { connectRedis } from './config/redis.js';
import { attachWebSocket } from './websocket/socket.server.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  try {
    // Attempt DB connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Attempt Redis connection
    try {
      await connectRedis();
      logger.info('Redis connected successfully');
    } catch (err) {
      logger.warn('Failed to connect to Redis. Proceeding without WebSocket pub/sub features.');
    }

    // Create HTTP Server
    const server = http.createServer(app);

    // Attach WebSocket
    attachWebSocket(server);

    // Start listening
    server.listen(env.PORT, () => {
      logger.info(`Server running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down...');
  await prisma.$disconnect();
  // We don't strictly need to disconnect Redis if exiting, but we could add it here
  process.exit(0);
});

startServer();
