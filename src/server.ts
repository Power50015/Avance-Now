import Fastify from 'fastify';
import fastifyFormbody from '@fastify/formbody';
import fastifyView from '@fastify/view';
import { loadConfig } from './config/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { registerHealthCheck } from './api/health.js';
import { registerApiIndex } from './api/index.js';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function start(): Promise<void> {
  const config = loadConfig();

  const app = Fastify({
    logger: {
      level: config.nodeEnv === 'development' ? 'info' : 'warn',
    },
  });

  app.setErrorHandler(errorHandler);

  await app.register(fastifyFormbody);
  await app.register(fastifyView, {
    engine: { ejs },
    root: path.join(__dirname, 'views'),
  });

  registerHealthCheck(app);
  registerApiIndex(app);

  app.get('/', async (_request, reply) => {
    return reply.view('index.ejs', { config });
  });

  const address = await app.listen({ port: config.port, host: config.host });
  console.log(`Server listening at ${address}`);

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err: unknown) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
