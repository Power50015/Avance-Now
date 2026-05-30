import { FastifyReply, FastifyRequest } from 'fastify';
import { AppConfig } from '../types/index.js';

export async function rootHandler(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const config = _request.server.config as AppConfig | undefined;
  return reply.view('index.ejs', { config });
}
