export interface AppConfig {
  nodeEnv: string;
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
}

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
  const port = process.env.AVN_PORT as string;
  const host = process.env.AVN_HOST as string;
  const dbHost = process.env.AVN_DB_HOST as string;
  const dbPort = process.env.AVN_DB_PORT as string;
  const dbName = process.env.AVN_DB_NAME as string;
  const dbUser = process.env.AVN_DB_USER as string;
  const dbPassword = process.env.AVN_DB_PASSWORD as string;
  const sessionSecret = process.env.AVN_SESSION_SECRET as string;

  return {
    nodeEnv,
    port: parseInt(port, 10),
    host,
    dbHost,
    dbPort: parseInt(dbPort, 10),
    dbName,
    dbUser,
    dbPassword,
    sessionSecret,
    redisHost: getEnvVar('AVN_REDIS_HOST', false),
    redisPort: process.env.AVN_REDIS_PORT ? parseInt(process.env.AVN_REDIS_PORT, 10) : undefined,
  };
}
