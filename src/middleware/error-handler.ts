import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ErrorResponse } from '../types/index.js';

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
    message: error.message,
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

export function notFoundHandler(_request: FastifyRequest, reply: FastifyReply): void {
  reply.status(404).send({
    error: 'Not Found',
    message: `Route ${_request.method} ${_request.url} not found`,
    code: 'NOT_FOUND',
    statusCode: 404,
    requestId: _request.id,
  } satisfies ErrorResponse);
}
