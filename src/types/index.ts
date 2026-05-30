export interface AppConfig {
  nodeEnv: string;
  isDev: boolean;
  isProd: boolean;
  isTest: boolean;
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

export interface ApiInfo {
  name: string;
  version: string;
  description: string;
  documentation: string;
  env: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  code: string;
  statusCode: number;
  requestId?: string;
  details?: unknown;
}
