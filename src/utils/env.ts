/**
 * Returns `true` when the given environment string is `'development'`.
 * @param nodeEnv - The value of `AVN_NODE_ENV`.
 */
export function isDev(nodeEnv: string): boolean {
  return nodeEnv === 'development';
}

/**
 * Returns `true` when the given environment string is `'production'`.
 * @param nodeEnv - The value of `AVN_NODE_ENV`.
 */
export function isProd(nodeEnv: string): boolean {
  return nodeEnv === 'production';
}

/**
 * Returns `true` when the given environment string is `'test'`.
 * @param nodeEnv - The value of `AVN_NODE_ENV`.
 */
export function isTest(nodeEnv: string): boolean {
  return nodeEnv === 'test';
}

/**
 * Parses a string into a valid TCP/UDP port number (1–65535).
 * Returns `defaultVal` when the input is missing, non-numeric, or out of range.
 *
 * @param value - Raw string to parse (typically from an environment variable).
 * @param defaultVal - Fallback port when parsing fails.
 */
export function parsePort(value: string, defaultVal: number): number {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 && parsed < 65536 ? parsed : defaultVal;
}

/**
 * Parses a string into a positive integer with an optional upper-bound.
 * Returns `defaultVal` when the input is missing, non-numeric, zero/negative,
 * or exceeds `max`.
 *
 * @param value - Raw string to parse (typically from an environment variable).
 * @param defaultVal - Fallback value when parsing fails.
 * @param max - Upper bound (inclusive). Defaults to `Number.MAX_SAFE_INTEGER`.
 */
export function parsePositiveInt(
  value: string | undefined,
  defaultVal: number,
  max: number = Number.MAX_SAFE_INTEGER,
): number {
  if (!value) return defaultVal;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 && parsed <= max ? parsed : defaultVal;
}
