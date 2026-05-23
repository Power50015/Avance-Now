import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export interface ErrorResponse {
  error: string;
  message: string;
  code: string;
  statusCode: number;
}

export function errorHandler(
  error: FastifyError & { statusCode?: number; validation?: { message: string }[] },
  _request: FastifyRequest,
  reply: FastifyReply,
): void {
  const statusCode = error.statusCode || 500;

  const body: ErrorResponse = {
    error: statusCode >= 500 ? 'Internal Server Error' : error.message,
    message:
      statusCode >= 500 ? 'An unexpected error occurred. Please try again later.' : error.message,
    code: statusCode >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
    statusCode,
  };

  if (error.validation) {
    body.error = 'Validation Error';
    body.message = error.validation.map((v) => v.message).join('; ');
    body.code = 'VALIDATION_ERROR';
  }

  reply.status(statusCode).send(body);
}
