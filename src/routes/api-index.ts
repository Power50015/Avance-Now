import { FastifyInstance } from 'fastify';
import { apiInfoRouteSchema } from '../schemas/api-index.js';
import { apiIndexHandler } from '../controllers/api-index.js';

/**
 * Registers the `GET /api` endpoint with platform metadata.
 *
 * @param app - Fastify instance to register routes onto.
 */
export function registerApiIndexRoutes(app: FastifyInstance): void {
  app.get('/api', apiInfoRouteSchema, apiIndexHandler);
}
