import { publisher } from '../config/redis.js';
import { logger } from '../utils/logger.js';

/**
 * Publishes an order event to the Redis 'orders' channel.
 * @param {string} type
 * @param {Object} data
 */
export const publishOrderEvent = async (type, data) => {
  try {
    await publisher.publish('orders', JSON.stringify({ type, data }));
  } catch (err) {
    logger.error('Failed to publish order event to Redis', { err, type, data });
  }
};
