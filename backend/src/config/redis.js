import { createClient } from 'redis';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const createRedisClient = (name) => {
  const client = createClient({ 
    url: env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries >= 3) {
          logger.warn(`Redis [${name}] max retries reached. Giving up.`);
          return new Error('Redis connection failed');
        }
        return Math.min(retries * 100, 3000);
      }
    }
  });

  client.on('error', (err) => logger.error(`Redis [${name}] error`, { err }));
  client.on('connect', () => logger.info(`Redis [${name}] connected`));
  client.on('reconnecting', () => logger.warn(`Redis [${name}] reconnecting`));

  return client;
};

export const publisher = createRedisClient('publisher');
export const subscriber = createRedisClient('subscriber');

export const connectRedis = async () => {
  await publisher.connect();
  await subscriber.connect();
};
