import { AppConfig } from '../types/index.js';
import { parsePort } from '../utils/env.js';

interface ConfigError {
  key: string;
  message: string;
  expectedFormat: string;
}

function getEnvVar(key: string, required: boolean): string | undefined {
  const value = process.env[key];
  if (required && (!value || value.trim() === '')) {
    return undefined;
  }
  return value;
}

function buildExpectedFormat(key: string): string {
  const examples: Record<string, string> = {
    AVN_NODE_ENV: 'development | test | production',
    AVN_PORT: '3000',
    AVN_HOST: '0.0.0.0',
    AVN_DB_HOST: 'localhost | postgres',
    AVN_DB_PORT: '5432',
    AVN_DB_NAME: 'avance_now',
    AVN_DB_USER: 'avn_user',
    AVN_DB_PASSWORD: 'a-strong-password',
    AVN_SESSION_SECRET: 'a-random-64-character-hex-string',
    AVN_CORS_ORIGIN: '* | http://localhost:3000',
    AVN_RATE_LIMIT_MAX: '100',
    AVN_LOG_LEVEL: 'debug | info | warn | error',
    AVN_TRUST_PROXY: 'true | false',
    AVN_ENABLE_VIEWS: 'true | false',
    AVN_ENABLE_DEBUG: 'true | false',
  };
  return examples[key] || '<value>';
}

export function loadConfig(): AppConfig {
  const errors: ConfigError[] = [];
  const requiredVars = [
    'AVN_NODE_ENV',
    'AVN_PORT',
    'AVN_HOST',
    'AVN_DB_HOST',
    'AVN_DB_PORT',
    'AVN_DB_NAME',
    'AVN_DB_USER',
    'AVN_DB_PASSWORD',
    'AVN_SESSION_SECRET',
  ];

  for (const key of requiredVars) {
    const val = getEnvVar(key, true);
    if (val === undefined) {
      errors.push({
        key,
        message: `Missing required environment variable: ${key}`,
        expectedFormat: buildExpectedFormat(key),
      });
    }
  }

  if (errors.length > 0) {
    const messages = errors.map(
      (e) => `  - ${e.key}: ${e.message}\n    Expected format: ${e.expectedFormat}`,
    );
    throw new Error(
      `Configuration validation failed with ${errors.length} error(s):\n${messages.join('\n')}`,
    );
  }

  const nodeEnv = process.env.AVN_NODE_ENV as string;

  return {
    nodeEnv,
    isDev: nodeEnv === 'development',
    isProd: nodeEnv === 'production',
    isTest: nodeEnv === 'test',
    port: parsePort(process.env.AVN_PORT as string, 3000),
    host: process.env.AVN_HOST as string,
    dbHost: process.env.AVN_DB_HOST as string,
    dbPort: parsePort(process.env.AVN_DB_PORT as string, 5432),
    dbName: process.env.AVN_DB_NAME as string,
    dbUser: process.env.AVN_DB_USER as string,
    dbPassword: process.env.AVN_DB_PASSWORD as string,
    sessionSecret: process.env.AVN_SESSION_SECRET as string,
    redisHost: getEnvVar('AVN_REDIS_HOST', false),
    redisPort: process.env.AVN_REDIS_PORT ? parseInt(process.env.AVN_REDIS_PORT, 10) : undefined,
    logLevel: getEnvVar('AVN_LOG_LEVEL', false) || (nodeEnv === 'production' ? 'warn' : 'info'),
    enableViews: (getEnvVar('AVN_ENABLE_VIEWS', false) || 'true') === 'true',
    enableDebug: (getEnvVar('AVN_ENABLE_DEBUG', false) || 'false') === 'true',
    corsOrigin: getEnvVar('AVN_CORS_ORIGIN', false) || '*',
    rateLimitMax: parseInt(getEnvVar('AVN_RATE_LIMIT_MAX', false) || '100', 10),
    trustProxy: (getEnvVar('AVN_TRUST_PROXY', false) || 'false') === 'true',
    keepAliveTimeout: parseInt(getEnvVar('AVN_KEEPALIVE_TIMEOUT', false) || '5000', 10),
  };
}
