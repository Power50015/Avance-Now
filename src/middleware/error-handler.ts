// Import Fastify types to properly type the error handler middleware function parameters
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

/**
 * Interface representing the standardized shape of error responses returned to clients.
 * Ensures consistent response schemas for all API error conditions.
 */
export interface ErrorResponse {
  // A short name/category representing the type of error (e.g., 'Validation Error' or 'Internal Server Error')
  error: string;
  // A descriptive, human-readable message details about what went wrong
  message: string;
  // An internal standardized machine-readable error code (e.g., 'INTERNAL_ERROR', 'VALIDATION_ERROR')
  code: string;
  // The HTTP status code associated with the response
  statusCode: number;
}

/**
 * Standardized global error handler for Fastify.
 * Intercepts all unhandled errors thrown during request lifecycle, sanitizes them,
 * formats them consistently, and replies with appropriate status codes and error payloads.
 *
 * @param error - The error object thrown, enriched with optional validation and statusCode properties.
 * @param _request - The Fastify request object (unused, prefixed with underscore).
 * @param reply - The Fastify reply object used to send the formatted error response.
 */
export function errorHandler(
  // Expecting a FastifyError, potentially containing custom statusCode or validation arrays from schema validation
  error: FastifyError & { statusCode?: number; validation?: { message: string }[] },
  // FastifyRequest typed argument
  _request: FastifyRequest,
  // FastifyReply typed argument
  reply: FastifyReply,
): void {
  // Extract or default the HTTP status code (defaulting to 500 Internal Server Error if not set)
  const statusCode = error.statusCode || 500;

  // Initialize the baseline error response payload structure
  const body: ErrorResponse = {
    // Hide details of 500+ errors to prevent information leakage, otherwise expose error message
    error: statusCode >= 500 ? 'Internal Server Error' : error.message,
    // Provide a generic message for internal errors, otherwise display the exact error message
    message:
      statusCode >= 500 ? 'An unexpected error occurred. Please try again later.' : error.message,
    // Assign a standardized code category based on the HTTP status code
    code: statusCode >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
    // Assign the derived numeric HTTP status code
    statusCode,
  };

  // Special-case validation errors originating from Fastify's schema validators (e.g., Ajv)
  if (error.validation) {
    // Override the generic error field with a specific validation label
    body.error = 'Validation Error';
    // Map individual validation issues into a single, semicolon-separated message list
    body.message = error.validation.map((v) => v.message).join('; ');
    // Override the error code to indicate validation failure
    body.code = 'VALIDATION_ERROR';
  }

  // Set the response status and transmit the JSON error response payload back to the client
  reply.status(statusCode).send(body);
}
