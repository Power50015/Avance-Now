import { loadConfig } from './config/index.js';
import { buildApp } from './app.js';

async function start(): Promise<void> {
  const config = loadConfig();
  const app = await buildApp(config);

  const address = await app.listen({ port: config.port, host: config.host });
  app.log.info({ address, env: config.nodeEnv }, 'Server started');

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info({ signal }, 'Shutdown signal received');

    const shutdownTimeout = setTimeout(() => {
      app.log.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000).unref();

    try {
      await app.close();
      clearTimeout(shutdownTimeout);
      app.log.info('Server closed gracefully');
      process.exit(0);
    } catch (err) {
      app.log.error({ err }, 'Error during shutdown');
      clearTimeout(shutdownTimeout);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGQUIT', () => shutdown('SIGQUIT'));

  process.on('uncaughtException', (err) => {
    app.log.error({ err }, 'Uncaught exception');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    app.log.error({ err: reason }, 'Unhandled rejection');
  });
}

start().catch((err: unknown) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
