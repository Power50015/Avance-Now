import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ErrorResponse } from '../types/index.js';

/**
 * Global Fastify error handler.
 *
 * - Logs 5xx errors at `error` level and 4xx errors at `warn` level.
 * - Never leaks internal error details to the client for 5xx responses.
 * - Converts Fastify validation errors into a structured `VALIDATION_ERROR`
 *   response with per-field details.
 *
 * @param error - The error thrown by a route handler or hook.
 * @param request - The incoming Fastify request.
 * @param reply - The Fastify reply used to send the error response.
 */
export function errorHandler(
  error: FastifyError & {
    statusCode?: number;
    validation?: { message: string }[];
    code?: string;
  },
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  const statusCode = error.statusCode || 500;
  const requestId = request.id as string;

  if (statusCode >= 500) {
    request.log.error({ err: error, requestId }, 'Internal server error');
  } else {
    request.log.warn({ err: error, requestId }, 'Request error');
  }

  const body: ErrorResponse = {
    error: statusCode >= 500 ? 'Internal Server Error' : error.message,
    message: statusCode >= 500 ? 'An unexpected error occurred' : error.message,
    code: error.code || (statusCode >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'),
    statusCode,
    requestId,
  };

  if (error.validation) {
    body.error = 'Validation Error';
    body.message = error.validation.map((v) => v.message).join('; ');
    body.code = 'VALIDATION_ERROR';
    body.details = error.validation;
  }

  reply.status(statusCode).send(body);
}

/**
 * Handler for requests that do not match any registered route.
 * Returns a structured 404 response with the attempted method and URL.
 *
 * @param request - The incoming Fastify request.
 * @param reply - The Fastify reply used to send the 404 response.
 */
export function notFoundHandler(request: FastifyRequest, reply: FastifyReply): void {
  reply.status(404).send({
    error: 'Not Found',
    message: `Route ${request.method} ${request.url} not found`,
    code: 'NOT_FOUND',
    statusCode: 404,
    requestId: request.id,
  } satisfies ErrorResponse);
}
