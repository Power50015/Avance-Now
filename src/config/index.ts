import type { AppConfig, NodeEnv } from '../types/index.js';
import { parsePort, parsePositiveInt } from '../utils/env.js';

/** Structured config validation error for developer-friendly startup messages. */
interface ConfigError {
  key: string;
  message: string;
  expectedFormat: string;
}

/** Known valid values for `AVN_NODE_ENV`. */
const VALID_NODE_ENVS = new Set<NodeEnv>(['development', 'production', 'test']);

/**
 * Reads an environment variable by key.
 * Returns `undefined` when the variable is required but missing or blank.
 *
 * @param key - Environment variable name.
 * @param required - When `true`, blank/missing values return `undefined`.
 */
function getEnvVar(key: string, required: boolean): string | undefined {
  const value = process.env[key];
  if (required && (!value || value.trim() === '')) {
    return undefined;
  }
  return value;
}

/**
 * Returns a human-readable example for a given config key.
 * Used in startup error messages to guide operators.
 *
 * @param key - Environment variable name.
 */
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

/**
 * Loads, validates, and returns the application configuration from
 * environment variables.
 *
 * Throws a detailed error listing every missing or invalid variable
 * so operators can fix all problems in a single pass.
 *
 * @throws {Error} When one or more required environment variables are missing.
 */
export function loadConfig(): AppConfig {
  const errors: ConfigError[] = [];

  // --- Collect & validate required vars in a single pass ---
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
  ] as const;

  const validated = new Map<string, string>();

  for (const key of requiredVars) {
    const val = process.env[key]?.trim();
    if (!val) {
      errors.push({
        key,
        message: `Missing required environment variable: ${key}`,
        expectedFormat: buildExpectedFormat(key),
      });
    } else {
      validated.set(key, val);
    }
  }

  // --- Validate AVN_NODE_ENV value ---
  const rawNodeEnv = validated.get('AVN_NODE_ENV');
  if (rawNodeEnv && !VALID_NODE_ENVS.has(rawNodeEnv as NodeEnv)) {
    errors.push({
      key: 'AVN_NODE_ENV',
      message: `Invalid value "${rawNodeEnv}" for AVN_NODE_ENV`,
      expectedFormat: buildExpectedFormat('AVN_NODE_ENV'),
    });
  }

  if (errors.length > 0) {
    const messages = errors.map(
      (e) => `  - ${e.key}: ${e.message}\n    Expected format: ${e.expectedFormat}`,
    );
    throw new Error(
      `Configuration validation failed with ${errors.length} error(s):\n${messages.join('\n')}`,
    );
  }

  // After the error gate, all required vars are guaranteed present.
  const getRequired = (key: (typeof requiredVars)[number]): string => {
    const val = validated.get(key);
    if (val === undefined) {
      throw new Error(`Unexpected missing configuration key: ${key}`);
    }
    return val;
  };

  const nodeEnv = getRequired('AVN_NODE_ENV') as NodeEnv;

  return {
    nodeEnv,
    version: process.env.npm_package_version || '0.1.0',
    port: parsePort(getRequired('AVN_PORT'), 3000),
    host: getRequired('AVN_HOST'),
    dbHost: getRequired('AVN_DB_HOST'),
    dbPort: parsePort(getRequired('AVN_DB_PORT'), 5432),
    dbName: getRequired('AVN_DB_NAME'),
    dbUser: getRequired('AVN_DB_USER'),
    dbPassword: getRequired('AVN_DB_PASSWORD'),
    sessionSecret: getRequired('AVN_SESSION_SECRET'),
    redisHost: getEnvVar('AVN_REDIS_HOST', false),
    redisPort: parsePort(process.env.AVN_REDIS_PORT || '', 6379) || undefined,
    logLevel: getEnvVar('AVN_LOG_LEVEL', false) || (nodeEnv === 'production' ? 'warn' : 'info'),
    enableViews: (getEnvVar('AVN_ENABLE_VIEWS', false) || 'true') === 'true',
    enableDebug: (getEnvVar('AVN_ENABLE_DEBUG', false) || 'false') === 'true',
    corsOrigin: getEnvVar('AVN_CORS_ORIGIN', false) || '*',
    rateLimitMax: parsePositiveInt(getEnvVar('AVN_RATE_LIMIT_MAX', false), 100, 10000),
    trustProxy: (getEnvVar('AVN_TRUST_PROXY', false) || 'false') === 'true',
    keepAliveTimeout: parsePositiveInt(getEnvVar('AVN_KEEPALIVE_TIMEOUT', false), 5000, 300000),
  };
}
