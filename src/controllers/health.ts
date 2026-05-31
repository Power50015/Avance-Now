import { FastifyReply, FastifyRequest } from 'fastify';
import { getHealthStatus } from '../services/health.js';

/**
 * Handler for `GET /health`.
 *
 * Returns process-level telemetry (uptime, memory, version) for use by
 * monitoring tools and orchestrators. The version is sourced from the
 * decorated `app.config` for consistency.
 *
 * @param request - The incoming Fastify request.
 * @param reply - The Fastify reply.
 */
export async function healthCheckHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const config = request.server.config;
  reply.send(getHealthStatus(config.version));
}
