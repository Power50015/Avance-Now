/**
 * Valid runtime environment identifiers for the avance-now platform.
 * Used to constrain `AVN_NODE_ENV` to known values at the type level.
 */
export type NodeEnv = 'development' | 'production' | 'test';

/**
 * Application-wide configuration derived from validated environment variables.
 * Constructed once at startup by {@link loadConfig} and decorated onto the
 * Fastify instance as `app.config`.
 */
export interface AppConfig {
  nodeEnv: NodeEnv;
  version: string;
  port: number;
  host: string;
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  sessionSecret: string;
  redisHost?: string;
  redisPort?: number;
  logLevel: string;
  enableViews: boolean;
  enableDebug: boolean;
  corsOrigin: string;
  rateLimitMax: number;
  trustProxy: boolean;
  keepAliveTimeout: number;
}

/**
 * Response payload for the `/health` endpoint.
 * Reports basic process telemetry for monitoring and orchestration tools.
 */
export interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
  version: string;
}

/**
 * Response payload for the `/api` root index endpoint.
 * Provides platform metadata and a documentation link.
 */
export interface ApiInfo {
  name: string;
  version: string;
  description: string;
  documentation: string;
  env: string;
}

/**
 * Standardised error response envelope sent to clients on any non-2xx reply.
 * All error handlers must conform to this shape.
 */
export interface ErrorResponse {
  error: string;
  message: string;
  code: string;
  statusCode: number;
  requestId?: string;
  details?: unknown;
}
