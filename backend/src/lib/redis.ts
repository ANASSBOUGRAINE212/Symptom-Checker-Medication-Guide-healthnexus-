import { createClient } from 'redis';
import { logger } from './logger';

export const redisClient = createClient({
    url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`,
    socket: {
        connectTimeout: 5000,
    },
});

redisClient.on('error', (err) => {
    logger.error({ err, component: 'redis' }, 'Redis connection error');
});

redisClient.on('connect', () => {
    logger.info({ component: 'redis' }, 'Redis client connected');
});

redisClient.on('ready', () => {
    logger.info({ component: 'redis' }, 'Redis client ready');
});

redisClient.on('end', () => {
    logger.info({ component: 'redis' }, 'Redis client disconnected');
});

export const connectRedis = async () => {
    try {
      if (!redisClient.isOpen) {
        await redisClient.connect();
        logger.info({ component: 'redis' }, 'Redis connected successfully');
        return true;
      }
      return true;
    } catch (error) {
      logger.warn({ err: error, component: 'redis' }, 'Redis connection failed - continuing without Redis');
      return false;
    }
};

export const disconnectRedis = async () => {
    try {
        if (redisClient.isOpen) {
            await redisClient.quit();
            logger.info({ component: 'redis' }, 'Redis connection closed gracefully');
        }
    } catch (error) {
        logger.error({ err: error, component: 'redis' }, 'Error closing Redis connection');
    }
};
