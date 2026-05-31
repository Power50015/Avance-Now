import { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';

/**
 * Registers security-related Fastify plugins: Helmet (HTTP headers),
 * CORS, and rate limiting.
 *
 * Security decisions:
 * - CSP is enabled with a strict default policy suitable for the EJS admin UI.
 * - When CORS origin is wildcard (`*`), `credentials` is forced to `false`
 *   to prevent open credential relay attacks.
 * - Rate limit errors use the standard {@link ErrorResponse} envelope.
 *
 * @param app - Fastify instance to register plugins onto.
 * @param corsOrigin - Comma-separated list of allowed origins, or `'*'`.
 * @param rateLimitMax - Maximum requests per IP per time window.
 */
export async function registerSecurityPlugins(
  app: FastifyInstance,
  corsOrigin: string,
  rateLimitMax: number,
): Promise<void> {
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'same-site' },
  });

  const isWildcard = corsOrigin === '*';
  await app.register(cors, {
    origin: isWildcard ? true : corsOrigin.split(',').map((o) => o.trim()),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: !isWildcard,
  });

  await app.register(rateLimit, {
    max: rateLimitMax,
    timeWindow: '1 minute',
    errorResponseBuilder: (_request, context) => ({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Max ${context.max} requests per ${context.after}`,
      code: 'RATE_LIMIT_ERROR',
      statusCode: 429,
    }),
  });
}
