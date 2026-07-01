import { FastifyInstance } from 'fastify';
import { ProfileData, ApiResponse } from '@unnamed-auto-battler/shared';
import prisma from '../../database/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

/**
 * Profile routes
 */
export async function profileRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/v1/profile
   * Get current user's profile
   */
  fastify.get('/', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = (request as AuthenticatedRequest).user;

    try {
      const profile = await prisma.profile.findUnique({
        where: { userId },
      });

      if (!profile) {
        return reply.code(404).send({
          success: false,
          error: 'Profile not found',
        } as ApiResponse);
      }

      const response: ApiResponse<ProfileData> = {
        success: true,
        data: {
          userId: profile.userId,
          username: profile.username,
          avatar: profile.avatar || undefined,
          level: profile.level,
          experience: profile.experience,
          gold: profile.gold,
          highestFloor: profile.highestFloor,
          totalWins: profile.totalWins,
          totalLosses: profile.totalLosses,
          createdAt: profile.createdAt.toISOString(),
          updatedAt: profile.updatedAt.toISOString(),
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

  /**
   * PATCH /api/v1/profile
   * Update current user's profile
   */
  fastify.patch<{ Body: Partial<ProfileData> }>(
    '/',
    { preHandler: authenticate },
    async (request, reply) => {
      const { userId } = (request as AuthenticatedRequest).user;
      const updates = request.body;

      try {
        const profile = await prisma.profile.update({
          where: { userId },
          data: {
            username: updates.username,
            avatar: updates.avatar,
          },
        });

        const response: ApiResponse<ProfileData> = {
          success: true,
          data: {
            userId: profile.userId,
            username: profile.username,
            avatar: profile.avatar || undefined,
            level: profile.level,
            experience: profile.experience,
            gold: profile.gold,
            highestFloor: profile.highestFloor,
            totalWins: profile.totalWins,
            totalLosses: profile.totalLosses,
            createdAt: profile.createdAt.toISOString(),
            updatedAt: profile.updatedAt.toISOString(),
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
    }
  );
}
