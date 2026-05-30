import { FastifyReply, FastifyRequest } from 'fastify';
import { ApiInfo } from '../types/index.js';

export async function apiIndexHandler(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body: ApiInfo = {
    name: 'avance-now',
    version: process.env.npm_package_version || '0.1.0',
    description: 'avance-now platform API',
    documentation: '/api/docs',
    env: process.env.AVN_NODE_ENV || 'development',
  };
  reply.send(body);
}
