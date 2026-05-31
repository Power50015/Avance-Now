/** JSON Schema for the `GET /api` 200 response body. */
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

/** Route-level schema options for the API index endpoint. */
export const apiInfoRouteSchema = {
  schema: {
    description: 'API root endpoint with platform metadata',
    tags: ['system'],
    ...apiInfoResponseSchema,
  },
};
