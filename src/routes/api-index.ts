import { FastifyInstance } from 'fastify';
import { apiInfoRouteSchema } from '../schemas/api-index.js';
import { apiIndexHandler } from '../controllers/api-index.js';

export function registerApiIndexRoutes(app: FastifyInstance): void {
  app.get('/api', apiInfoRouteSchema, apiIndexHandler);
}
