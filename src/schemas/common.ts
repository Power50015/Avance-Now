export const paginationQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  },
};

export const idParamSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', pattern: '^[a-fA-F0-9-]+$' },
  },
  required: ['id'],
};

export const errorResponseSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    message: { type: 'string' },
    code: { type: 'string' },
    statusCode: { type: 'integer' },
    requestId: { type: 'string' },
  },
};
