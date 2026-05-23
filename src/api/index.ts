import { FastifyInstance } from 'fastify';

export interface ApiInfo {
  name: string;
  version: string;
  description: string;
  documentation: string;
}

export function registerApiIndex(app: FastifyInstance): void {
  app.get('/api', async (_request, _reply) => {
    const body: ApiInfo = {
      name: 'avance-now',
      version: '0.1.0',
      description: 'avance-now platform API',
      documentation: '/api/docs',
    };
    return body;
  });
}
