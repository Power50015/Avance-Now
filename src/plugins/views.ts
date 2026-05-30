import { FastifyInstance } from 'fastify';
import fastifyView from '@fastify/view';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerViewEngine(app: FastifyInstance): Promise<void> {
  await app.register(fastifyView, {
    engine: { ejs },
    root: path.join(__dirname, '..', 'views'),
  });
}
