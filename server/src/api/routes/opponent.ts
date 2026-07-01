import { FastifyInstance } from 'fastify';
import { randomInt } from 'crypto';
import { OpponentData, ApiResponse } from '@unnamed-auto-battler/shared';
import prisma from '../../database/prisma';
import { authenticate } from '../middleware/auth';

/**
 * Opponent routes
 */
export async function opponentRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/v1/opponent
   * Get a random opponent for matchmaking
   */
  fastify.get('/', { preHandler: authenticate }, async (request, reply) => {
    try {
      const profiles = await prisma.profile.findMany({
        take: 10,
        orderBy: { updatedAt: 'desc' },
      });

      if (profiles.length === 0) {
        return reply.code(404).send({
          success: false,
          error: 'No opponents available',
        } as ApiResponse);
      }

      const randomProfile = profiles[randomInt(profiles.length)];

      const response: ApiResponse<OpponentData> = {
        success: true,
        data: {
          userId: randomProfile.userId,
          username: randomProfile.username,
          team: [], // In real implementation, load saved team
          rating: 1000, // Mock rating
        },
      };

      return reply.send(response);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  });
}
