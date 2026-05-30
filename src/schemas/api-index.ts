export const apiInfoResponseSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        version: { type: 'string' },
        description: { type: 'string' },
        documentation: { type: 'string' },
        env: { type: 'string' },
      },
    },
  },
};

export const apiInfoRouteSchema = {
  schema: {
    description: 'API root endpoint with platform metadata',
    tags: ['system'],
    ...apiInfoResponseSchema,
  },
};
