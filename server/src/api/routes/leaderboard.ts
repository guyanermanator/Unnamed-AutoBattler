import { FastifyInstance } from 'fastify';
import { LeaderboardEntry, ApiResponse } from '@unnamed-auto-battler/shared';
import prisma from '../../database/prisma';

/**
 * Leaderboard routes
 */
export async function leaderboardRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/v1/leaderboard
   * Get leaderboard rankings
   */
  fastify.get<{ Querystring: { limit?: number; offset?: number } }>(
    '/',
    async (request, reply) => {
      const limit = Math.min(request.query.limit || 100, 100);
      const offset = request.query.offset || 0;

      try {
        const entries = await prisma.leaderboardEntry.findMany({
          take: limit,
          skip: offset,
          orderBy: { rating: 'desc' },
          include: {
            user: {
              select: {
                profile: {
                  select: {
                    username: true,
                  },
                },
              },
            },
          },
        });

        const response: ApiResponse<LeaderboardEntry[]> = {
          success: true,
          data: entries.map((entry: any, index: number) => ({
            rank: offset + index + 1,
            userId: entry.userId,
            username: entry.user.profile?.username || 'Anonymous',
            highestFloor: entry.highestFloor,
            totalWins: entry.totalWins,
            rating: entry.rating,
          })),
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
