export const healthResponseSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        timestamp: { type: 'string' },
        uptime: { type: 'number' },
        memory: {
          type: 'object',
          properties: {
            heapUsed: { type: 'number' },
            heapTotal: { type: 'number' },
            rss: { type: 'number' },
          },
        },
        version: { type: 'string' },
      },
    },
  },
};

export const healthRouteSchema = {
  schema: {
    description: 'Health check endpoint for monitoring and orchestration tools',
    tags: ['system'],
    ...healthResponseSchema,
  },
};
