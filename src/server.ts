// Import the core Fastify framework creator function
import Fastify from 'fastify';
// Import the form-body parsing plugin to support URL-encoded forms (e.g. from HTML form submissions)
import fastifyFormbody from '@fastify/formbody';
// Import the template rendering plugin to support server-side rendering of HTML pages
import fastifyView from '@fastify/view';
// Import the configuration loading utility function to fetch validated environment variables
import { loadConfig } from './config/index.js';
// Import the central error handler middleware to intercept and format application errors
import { errorHandler } from './middleware/error-handler.js';
// Import the registration helper for the health endpoint (/health)
import { registerHealthCheck } from './api/health.js';
// Import the registration helper for the API metadata index endpoint (/api)
import { registerApiIndex } from './api/index.js';
// Import EJS template engine to render dynamic index.ejs views
import ejs from 'ejs';
// Import Node.js path module for safe, platform-independent directory path calculations
import path from 'path';
// Import URL module helper to convert file URL metadata into standard local filesystem paths
import { fileURLToPath } from 'url';

// Convert the import.meta.url string to a standard local file path string
const __filename = fileURLToPath(import.meta.url);
// Extract the parent directory path from the resolved filename
const __dirname = path.dirname(__filename);

/**
 * Boots the Fastify HTTP application server, registers plugins, routes, global error handlers,
 * initiates port binding listeners, and configures graceful process shutdown handling.
 *
 * @returns A Promise resolving when the server has successfully booted and started listening.
 */
async function start(): Promise<void> {
  // Load and validate environment configuration parameters
  const config = loadConfig();

  // Create the root Fastify application instance with customized logger configuration
  const app = Fastify({
    // Configure process logging details
    logger: {
      // Use detailed 'info' logs in development, revert to 'warn' logs in production/test contexts
      level: config.nodeEnv === 'development' ? 'info' : 'warn',
    },
  });

  // Assign the centralized global error handler middleware to catch all route-level exceptions
  app.setErrorHandler(errorHandler);

  // Register the formbody plugin asynchronously to support application/x-www-form-urlencoded parsing
  await app.register(fastifyFormbody);
  // Register the view engine plugin asynchronously to enable EJS rendering support
  await app.register(fastifyView, {
    // Specify EJS as the rendering engine target
    engine: { ejs },
    // Compute the absolute path to the templates directory ('views')
    root: path.join(__dirname, 'views'),
  });

  // Register the health-check routes onto the Fastify application instance
  registerHealthCheck(app);
  // Register the root API index discovery routes onto the Fastify application instance
  registerApiIndex(app);

  // Define a GET route at the root website endpoint '/' to render the main landing page
  app.get('/', async (_request, reply) => {
    // Render the index.ejs view layout and supply the config metadata payload to the page context
    return reply.view('index.ejs', { config });
  });

  // Bind the Fastify instance to listen on the configured network port and host interface
  const address = await app.listen({ port: config.port, host: config.host });
  // Log server listening success and the address to the system console
  console.log(`Server listening at ${address}`);

  /**
   * Performs a clean shutdown sequence by closing the fastify listener and terminating the node process.
   *
   * @param signal - The POSIX system interrupt signal that triggered this shutdown handler.
   */
  const shutdown = async (signal: string): Promise<void> => {
    // Log the interrupt signal received
    console.log(`Received ${signal}. Shutting down gracefully...`);
    // Close the Fastify HTTP server asynchronously to stop accepting new requests
    await app.close();
    // Exit the process successfully
    process.exit(0);
  };

  // Bind the shutdown sequence listener to the system SIGTERM signal (e.g., from docker stop)
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  // Bind the shutdown sequence listener to the user SIGINT signal (e.g., from Ctrl+C)
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Invoke the boot sequence and intercept any initialization-level errors
start().catch((err: unknown) => {
  // Log the startup failure details to standard error output
  console.error('Failed to start server:', err);
  // Exit the process with an error code status
  process.exit(1);
});
