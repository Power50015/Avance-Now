import Fastify from 'fastify';
import fastifyFormbody from '@fastify/formbody';
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

export async function buildApp(config: AppConfig): Promise<ReturnType<typeof Fastify>> {
  const logger = createLogger(config.logLevel);

  const app = Fastify({
    logger,
    genReqId: () => crypto.randomUUID(),
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

  await app.register(fastifyFormbody);

  if (config.enableViews) {
    await registerViewEngine(app);
  }

  registerHealthRoutes(app);
  registerApiIndexRoutes(app);
  registerRootRoutes(app);

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
