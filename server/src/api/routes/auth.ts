import { FastifyInstance } from 'fastify';
import { randomInt } from 'crypto';
import { AuthRequest, AuthResponse, ApiResponse } from '@unnamed-auto-battler/shared';
import prisma from '../../database/prisma';
import { strictRateLimit } from '../middleware/rateLimit';

/**
 * Authentication routes
 */
export async function authRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/v1/auth/google
   * Exchange Google OAuth token for JWT
   */
  fastify.post<{ Body: AuthRequest }>(
    '/google',
    strictRateLimit,
    async (request, reply) => {
      const { googleToken } = request.body;

      if (!googleToken) {
        return reply.code(400).send({
          success: false,
          error: 'Missing Google token',
        } as ApiResponse);
      }

      try {
        // In production, verify the Google token with Google's API
        // For now, we'll mock this
        const mockEmail = `user_${Date.now()}@example.com`;
        const mockGoogleId = `google_${Date.now()}`;

        let user = await prisma.user.findUnique({
          where: { googleId: mockGoogleId },
          include: { profile: true },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: mockEmail,
              googleId: mockGoogleId,
              profile: {
                create: {
                  username: `Player${randomInt(100000)}`,
                },
              },
            },
            include: { profile: true },
          });
        }

        const token = fastify.jwt.sign({
          userId: user.id,
          email: user.email,
        });

        const response: ApiResponse<AuthResponse> = {
          success: true,
          data: {
            token,
            userId: user.id,
            profile: {
              userId: user.id,
              username: user.profile!.username,
              avatar: user.profile!.avatar || undefined,
              level: user.profile!.level,
              experience: user.profile!.experience,
              gold: user.profile!.gold,
              highestFloor: user.profile!.highestFloor,
              totalWins: user.profile!.totalWins,
              totalLosses: user.profile!.totalLosses,
              createdAt: user.profile!.createdAt.toISOString(),
              updatedAt: user.profile!.updatedAt.toISOString(),
            },
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
