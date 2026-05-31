import { FastifyReply, FastifyRequest } from 'fastify';
import { ApiInfo } from '../types/index.js';

/**
 * Handler for `GET /api`.
 *
 * Returns platform metadata including name, version, documentation link,
 * and current environment. All values are sourced from the decorated
 * `app.config` rather than raw `process.env` to ensure consistency.
 *
 * @param request - The incoming Fastify request.
 * @param reply - The Fastify reply.
 */
export async function apiIndexHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const config = request.server.config;
  const body: ApiInfo = {
    name: 'avance-now',
    version: config.version,
    description: 'avance-now platform API',
    documentation: '/api/docs',
    env: config.nodeEnv,
  };
  reply.send(body);
}
