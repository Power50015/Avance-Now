import Fastify, { FastifyInstance } from 'fastify';
import fastifyFormbody from '@fastify/formbody';
import fastifySensible from '@fastify/sensible';
import { registerSecurityPlugins } from './plugins/security.js';
import { registerViewEngine } from './plugins/views.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerApiIndexRoutes } from './routes/api-index.js';
import { registerRootRoutes } from './routes/root.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { AppConfig } from './types/index.js';
import { createLogger } from './utils/logger.js';
import { isDev } from './utils/env.js';

declare module 'fastify' {
  interface FastifyInstance {
    config: AppConfig;
  }
}

/**
 * Constructs and configures the Fastify application instance.
 *
 * Responsibilities:
 * - Decorates `app.config` with the validated {@link AppConfig}.
 * - Registers security plugins (Helmet, CORS, rate limiting).
 * - Registers the EJS view engine when `config.enableViews` is `true`.
 * - Mounts all route groups (health, API index, and optionally root).
 * - Exposes a `/__debug` endpoint in development when `config.enableDebug`
 *   is enabled.
 *
 * The returned instance is ready to call `.listen()` but is not yet listening.
 *
 * @param config - Validated application configuration.
 * @returns A fully configured Fastify instance.
 */
export async function buildApp(config: AppConfig): Promise<FastifyInstance> {
  const logger = createLogger(config.logLevel, config.nodeEnv);

  const app = Fastify({
    logger,
    genReqId: (req) => (req.headers['x-request-id'] as string | undefined) || crypto.randomUUID(),
    keepAliveTimeout: config.keepAliveTimeout,
    requestTimeout: 30000,
    bodyLimit: 1048576,
    pluginTimeout: 10000,
    trustProxy: config.trustProxy,
  });

  app.decorate('config', config);

  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(notFoundHandler);

  await registerSecurityPlugins(app, config.corsOrigin, config.rateLimitMax);

  await app.register(fastifySensible);
  await app.register(fastifyFormbody);

  if (config.enableViews) {
    await registerViewEngine(app);
    registerRootRoutes(app);
  }

  registerHealthRoutes(app);
  registerApiIndexRoutes(app);

  if (config.enableDebug && isDev(config.nodeEnv)) {
    app.get('/__debug', async () => ({
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      config: {
        nodeEnv: config.nodeEnv,
        port: config.port,
        host: config.host,
        enableViews: config.enableViews,
        enableDebug: config.enableDebug,
      },
    }));
  }

  return app;
}
