import { FastifyInstance } from 'fastify';
import { rootHandler } from '../controllers/root.js';

/**
 * Registers the `GET /` route that renders the EJS index page.
 *
 * This function should only be called when the view engine is registered
 * (i.e. when `config.enableViews` is `true`).
 *
 * @param app - Fastify instance to register routes onto.
 */
export function registerRootRoutes(app: FastifyInstance): void {
  app.get('/', rootHandler);
}
