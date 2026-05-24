// Import the FastifyInstance type from the fastify package to type-annotate the Fastify application instance
import { FastifyInstance } from 'fastify';

/**
 * Interface representing the structure of the health check API response.
 * Provides basic diagnostic metadata about the running application instance.
 */
export interface HealthResponse {
  // A string representing the health status of the application, e.g., 'ok'
  status: string;
  // An ISO 8601 formatted string indicating the exact server time when the check was performed
  timestamp: string;
  // A number representing the total uptime of the application process in seconds
  uptime: number;
}

/**
 * Registers the health check GET route on the provided Fastify application instance.
 * Useful for monitoring tools, container orchestrators like Kubernetes, and simple status checks.
 *
 * @param app - The Fastify application instance where the route should be registered.
 */
export function registerHealthCheck(app: FastifyInstance): void {
  // Define a GET HTTP route at the '/health' endpoint
  app.get('/health', async (_request, _reply) => {
    // Construct the response body object complying with the HealthResponse interface structure
    const body: HealthResponse = {
      // Set status to indicate the application server is up and operational
      status: 'ok',
      // Generate the current timestamp in ISO string format (UTC)
      timestamp: new Date().toISOString(),
      // Retrieve the current process uptime in seconds from the global Node.js process object
      uptime: process.uptime(),
    };
    // Return the response body which Fastify automatically serializes as a JSON response
    return body;
  });
}
