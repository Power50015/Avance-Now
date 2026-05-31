/** Reusable JSON Schema for pagination query parameters. */
export const paginationQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  },
};

/** Reusable JSON Schema for UUID-style `:id` route parameters. */
export const idParamSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', pattern: '^[a-fA-F0-9-]+$' },
  },
  required: ['id'],
};

/** Reusable JSON Schema for the standard error response envelope. */
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
