import { FastifyReply, FastifyRequest } from 'fastify';
import { getHealthStatus } from '../services/health.js';

export async function healthCheckHandler(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const version = process.env.npm_package_version || '0.1.0';
  reply.send(getHealthStatus(version));
}
