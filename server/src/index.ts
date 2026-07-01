import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { connectDatabase } from './database/prisma';
import { registerRateLimit } from './api/middleware/rateLimit';
import { authRoutes } from './api/routes/auth';
import { profileRoutes } from './api/routes/profile';
import { runRoutes } from './api/routes/run';
import { opponentRoutes } from './api/routes/opponent';
import { chatRoutes } from './api/routes/chat';
import { leaderboardRoutes } from './api/routes/leaderboard';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function start() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  // Register plugins
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  await fastify.register(jwt, {
    secret: JWT_SECRET,
  });

  await registerRateLimit(fastify);

  // Connect to database
  await connectDatabase();

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register API routes
  fastify.register(authRoutes, { prefix: '/api/v1/auth' });
  fastify.register(profileRoutes, { prefix: '/api/v1/profile' });
  fastify.register(runRoutes, { prefix: '/api/v1/run' });
  fastify.register(opponentRoutes, { prefix: '/api/v1/opponent' });
  fastify.register(chatRoutes, { prefix: '/api/v1/chat' });
  fastify.register(leaderboardRoutes, { prefix: '/api/v1/leaderboard' });

  // Start server
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`Server listening on ${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
