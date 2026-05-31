import { FastifyInstance } from 'fastify';
import fastifyView from '@fastify/view';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Registers the `@fastify/view` plugin with EJS as the template engine.
 *
 * Templates are resolved from `src/views/` (relative to this plugin file).
 * This plugin is only registered when `config.enableViews` is `true`.
 *
 * @param app - Fastify instance to register the view engine onto.
 */
export async function registerViewEngine(app: FastifyInstance): Promise<void> {
  await app.register(fastifyView, {
    engine: { ejs },
    root: path.join(__dirname, '..', 'views'),
  });
}
