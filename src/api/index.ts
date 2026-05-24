// Import the FastifyInstance type from the fastify package to type-annotate the Fastify application instance
import { FastifyInstance } from 'fastify';

/**
 * Interface representing the structure of the API base metadata response.
 * Provides general information about the application name, version, description, and API docs location.
 */
export interface ApiInfo {
  // The name of the API / platform, e.g., 'avance-now'
  name: string;
  // The current semantic version of the API
  version: string;
  // A brief description of the platform/API's purpose
  description: string;
  // The relative URL/endpoint where the API documentation is hosted
  documentation: string;
}

/**
 * Registers the root API index GET route on the provided Fastify application instance.
 * Provides client discovery information about the platform API.
 *
 * @param app - The Fastify application instance where the route should be registered.
 */
export function registerApiIndex(app: FastifyInstance): void {
  // Define a GET HTTP route at the '/api' endpoint
  app.get('/api', async (_request, _reply) => {
    // Construct the response body object complying with the ApiInfo interface structure
    const body: ApiInfo = {
      // Set the platform name to 'avance-now'
      name: 'avance-now',
      // Set the platform version to '0.1.0'
      version: '0.1.0',
      // Provide a brief, high-level description of the platform
      description: 'avance-now platform API',
      // Specify the endpoint path for self-documenting OpenAPI/Swagger docs
      documentation: '/api/docs',
    };
    // Return the response body which Fastify automatically serializes as a JSON response
    return body;
  });
}
