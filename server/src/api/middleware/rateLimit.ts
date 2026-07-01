import { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';

/**
 * Rate limiting configuration
 */
export async function registerRateLimit(fastify: FastifyInstance) {
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '15 minutes',
    redis: undefined,
  });
}

/**
 * Strict rate limiting for auth endpoints
 */
export const strictRateLimit = {
  config: {
    rateLimit: {
      max: 5,
      timeWindow: '15 minutes',
    },
  },
};
