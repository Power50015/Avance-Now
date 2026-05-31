import { FastifyInstance } from 'fastify';
import { healthRouteSchema } from '../schemas/health.js';
import { healthCheckHandler } from '../controllers/health.js';

/**
 * Registers the `GET /health` endpoint for process-level health checks.
 *
 * @param app - Fastify instance to register routes onto.
 */
export function registerHealthRoutes(app: FastifyInstance): void {
  app.get('/health', healthRouteSchema, healthCheckHandler);
}
