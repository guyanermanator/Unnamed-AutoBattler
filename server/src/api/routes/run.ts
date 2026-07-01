import { FastifyInstance } from 'fastify';
import { Prisma } from '@prisma/client';
import { SaveRunRequest, LoadRunResponse, ApiResponse } from '@unnamed-auto-battler/shared';
import prisma from '../../database/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

/**
 * Run/save routes
 */
export async function runRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/v1/run/save
   * Save current run state
   */
  fastify.post<{ Body: SaveRunRequest }>(
    '/save',
    { preHandler: authenticate },
    async (request, reply) => {
      const { userId } = (request as AuthenticatedRequest).user;
      const { runId, state } = request.body;

      try {
        const run = await prisma.run.upsert({
          where: { id: runId },
          update: {
            state: state as Prisma.InputJsonValue,
            updatedAt: new Date(),
          },
          create: {
            id: runId,
            userId,
            state: state as Prisma.InputJsonValue,
            active: true,
          },
        });

        return reply.send({
          success: true,
          data: { runId: run.id },
        } as ApiResponse<{ runId: string }>);
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
   * GET /api/v1/run/load
   * Load saved run state
   */
  fastify.get<{ Querystring: { runId: string } }>(
    '/load',
    { preHandler: authenticate },
    async (request, reply) => {
      const { userId } = (request as AuthenticatedRequest).user;
      const { runId } = request.query;

      try {
        const run = await prisma.run.findFirst({
          where: {
            id: runId,
            userId,
            active: true,
          },
        });

        if (!run) {
          return reply.code(404).send({
            success: false,
            error: 'Run not found',
          } as ApiResponse);
        }

        const response: ApiResponse<LoadRunResponse> = {
          success: true,
          data: {
            runId: run.id,
            state: run.state as SaveRunRequest['state'],
            savedAt: run.updatedAt.toISOString(),
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
