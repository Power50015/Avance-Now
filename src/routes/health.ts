import { FastifyInstance } from 'fastify';
import { healthRouteSchema } from '../schemas/health.js';
import { healthCheckHandler } from '../controllers/health.js';

export function registerHealthRoutes(app: FastifyInstance): void {
  app.get('/health', healthRouteSchema, healthCheckHandler);
}
