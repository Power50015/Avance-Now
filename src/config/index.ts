/**
 * Configuration structure for the ERP platform (avance-now).
 * Fully models required and optional runtime configuration parameters.
 */
export interface AppConfig {
  // Execution environment (e.g., 'development', 'test', 'production')
  nodeEnv: string;
  // Port number the HTTP server listens on
  port: number;
  // Host address/IP the HTTP server binds to (e.g., '0.0.0.0')
  host: string;
  // Database host address/domain
  dbHost: string;
  // Port number the database service listens on (typically 5432 for Postgres)
  dbPort: number;
  // Name of the PostgreSQL database instance
  dbName: string;
  // Username credential used to connect to the database instance
  dbUser: string;
  // Password credential used to authenticate the database user
  dbPassword: string;
  // Cryptographic secret string used for session signing and security
  sessionSecret: string;
  // Optional Redis host address for caching/queue infrastructure
  redisHost?: string;
  // Optional Redis port number (typically 6379)
  redisPort?: number;
}

/**
 * Custom error payload tracking structure for configuration validation failures.
 */
interface ConfigError {
  // The name/key of the environment variable that failed validation
  key: string;
  // A descriptive message detailing why validation failed for this key
  message: string;
  // An example or description of the expected format/type for the variable
  expectedFormat: string;
}

/**
 * Safely reads an environment variable from process.env and checks its validity.
 *
 * @param key - The exact key name of the environment variable.
 * @param required - Flag indicating if the environment variable must be defined and non-empty.
 * @returns The string value if present, or undefined if missing/blank.
 */
function getEnvVar(key: string, required: boolean): string | undefined {
  // Query the variable value from the process' environment dictionary
  const value = process.env[key];
  // Verify if variable is required but either undefined or holds an empty/whitespace string
  if (required && (!value || value.trim() === '')) {
    // Return undefined to indicate a validation failure
    return undefined;
  }
  // Return the fetched string value
  return value;
}

/**
 * Returns a descriptive placeholder or valid example string for expected values of configuration keys.
 * Used to output informative instructions in configuration error reports.
 *
 * @param key - The environment variable key.
 * @returns A string detailing the expected format or examples.
 */
function buildExpectedFormat(key: string): string {
  // Construct a static dictionary mapping environment keys to illustrative values
  const examples: Record<string, string> = {
    // Expected node environment choices
    AVN_NODE_ENV: 'development | test | production',
    // Default server ports
    AVN_PORT: '3000',
    // Default network interface binding address
    AVN_HOST: '0.0.0.0',
    // Common database host names
    AVN_DB_HOST: 'localhost | postgres',
    // Standard Postgres port
    AVN_DB_PORT: '5432',
    // Target database name
    AVN_DB_NAME: 'avance_now',
    // Target database user
    AVN_DB_USER: 'avn_user',
    // Database credentials hint
    AVN_DB_PASSWORD: 'a-strong-password',
    // Cryptographic secret security guideline
    AVN_SESSION_SECRET: 'a-random-64-character-hex-string',
  };
  // Return the example matching the key, or fall back to a generic placeholder
  return examples[key] || '<value>';
}

/**
 * Loads, validates, and parses all required environment variables into the AppConfig interface format.
 * Throws a comprehensive validation error listing all missing variables and their expected formats.
 *
 * @throws Error - if one or more required configuration variables are missing or invalid.
 * @returns The validated AppConfig object containing loaded values.
 */
export function loadConfig(): AppConfig {
  // Declare an array to compile all configuration-related errors encountered
  const errors: ConfigError[] = [];
  // Define the comprehensive list of required environment variables for core operations
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

  // Iterate over each required environment variable to validate presence
  for (const key of requiredVars) {
    // Attempt to read the environment variable, specifying that it is required
    const val = getEnvVar(key, true);
    // If the variable is missing or blank, document the validation error details
    if (val === undefined) {
      // Append the detailed error into the errors tracker collection
      errors.push({
        // The current configuration key being validated
        key,
        // The precise validation warning message
        message: `Missing required environment variable: ${key}`,
        // The instructional placeholder template for correct configuration
        expectedFormat: buildExpectedFormat(key),
      });
    }
  }

  // Check if any validation errors were encountered during the verification pass
  if (errors.length > 0) {
    // Format each error entry into a visually readable bulleted report listing the key, message, and expected format
    const messages = errors.map(
      (e) => `  - ${e.key}: ${e.message}\n    Expected format: ${e.expectedFormat}`,
    );
    // Throw a generic error containing the consolidated validation log for easier troubleshooting
    throw new Error(
      `Configuration validation failed with ${errors.length} error(s):\n${messages.join('\n')}`,
    );
  }

  // Retrieve validated values directly from the process.env context with safe TypeScript assertions
  const nodeEnv = process.env.AVN_NODE_ENV as string;
  // Retrieve the application port string
  const port = process.env.AVN_PORT as string;
  // Retrieve the host interface binding string
  const host = process.env.AVN_HOST as string;
  // Retrieve the relational database host server name
  const dbHost = process.env.AVN_DB_HOST as string;
  // Retrieve the relational database port string
  const dbPort = process.env.AVN_DB_PORT as string;
  // Retrieve the relational database name
  const dbName = process.env.AVN_DB_NAME as string;
  // Retrieve the relational database login user string
  const dbUser = process.env.AVN_DB_USER as string;
  // Retrieve the relational database login credentials
  const dbPassword = process.env.AVN_DB_PASSWORD as string;
  // Retrieve the application core session secret key
  const sessionSecret = process.env.AVN_SESSION_SECRET as string;

  // Construct and return the fully initialized and type-cast AppConfig configuration structure
  return {
    // Assign validated nodeEnv
    nodeEnv,
    // Safely parse the port configuration string into base-10 integer
    port: parseInt(port, 10),
    // Assign validated host address
    host,
    // Assign validated dbHost address
    dbHost,
    // Safely parse the database port configuration string into base-10 integer
    dbPort: parseInt(dbPort, 10),
    // Assign validated dbName
    dbName,
    // Assign validated dbUser credential
    dbUser,
    // Assign validated dbPassword credential
    dbPassword,
    // Assign validated sessionSecret
    sessionSecret,
    // Read the optional Redis host address environment variable
    redisHost: getEnvVar('AVN_REDIS_HOST', false),
    // Safely parse optional Redis port environment variable if configured, otherwise assign undefined
    redisPort: process.env.AVN_REDIS_PORT ? parseInt(process.env.AVN_REDIS_PORT, 10) : undefined,
  };
}
