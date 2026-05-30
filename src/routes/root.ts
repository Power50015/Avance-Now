import { FastifyInstance } from 'fastify';
import { rootHandler } from '../controllers/root.js';

export function registerRootRoutes(app: FastifyInstance): void {
  app.get('/', rootHandler);
}
