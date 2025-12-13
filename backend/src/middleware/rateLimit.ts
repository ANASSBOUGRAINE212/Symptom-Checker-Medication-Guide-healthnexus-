import rateLimit from 'express-rate-limit';
import { redisClient } from '../lib/redis';
import { logger } from '../lib/logger';

const createStore = () => {
    try {
        if (redisClient.isOpen) {
            logger.info('Redis available but using memory store for rate limiting');
        }
    } catch (error) {
        logger.warn({ err: error }, 'Redis store unavailable, using memory store for rate limiting');
    }
    return undefined;
};

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 100 : 1000,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore(),
    skip: (req) => {
        return req.url.includes('/public/') || req.url.includes('/assets/');
    },
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 5 : 100,
    message: {
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore(),
    skipSuccessfulRequests: false,
});

export const medicalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 20 : 200,
    message: {
        error: 'Too many requests to medical endpoints, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore(),
});

export const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        error: 'Too many admin requests, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore(),
});
