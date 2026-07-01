import { FastifyInstance } from 'fastify';
import { ChatMessage as ChatMessageType, ApiResponse } from '@unnamed-auto-battler/shared';
import prisma from '../../database/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

/**
 * Chat routes
 */
export async function chatRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/v1/chat
   * Get recent chat messages
   */
  fastify.get<{ Querystring: { limit?: number } }>(
    '/',
    { preHandler: authenticate },
    async (request, reply) => {
      const limit = request.query.limit || 50;

      try {
        const messages = await prisma.chatMessage.findMany({
          take: limit,
          orderBy: { createdAt: 'desc' },
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

        const response: ApiResponse<ChatMessageType[]> = {
          success: true,
          data: messages.map((msg: any) => ({
            id: msg.id,
            userId: msg.userId,
            username: msg.user.profile?.username || 'Anonymous',
            message: msg.message,
            timestamp: msg.createdAt.toISOString(),
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

  /**
   * POST /api/v1/chat
   * Post a new chat message
   */
  fastify.post<{ Body: { message: string } }>(
    '/',
    { preHandler: authenticate },
    async (request, reply) => {
      const { userId } = (request as AuthenticatedRequest).user;
      const { message } = request.body;

      if (!message || message.trim().length === 0) {
        return reply.code(400).send({
          success: false,
          error: 'Message cannot be empty',
        } as ApiResponse);
      }

      if (message.length > 500) {
        return reply.code(400).send({
          success: false,
          error: 'Message too long',
        } as ApiResponse);
      }

      try {
        const chatMessage = await prisma.chatMessage.create({
          data: {
            userId,
            message: message.trim(),
          },
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

        const response: ApiResponse<ChatMessageType> = {
          success: true,
          data: {
            id: chatMessage.id,
            userId: chatMessage.userId,
            username: chatMessage.user.profile?.username || 'Anonymous',
            message: chatMessage.message,
            timestamp: chatMessage.createdAt.toISOString(),
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
