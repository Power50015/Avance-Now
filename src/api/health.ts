import { FastifyInstance } from 'fastify';

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

export function registerHealthCheck(app: FastifyInstance): void {
  app.get('/health', async (_request, _reply) => {
    const body: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
    return body;
  });
}
