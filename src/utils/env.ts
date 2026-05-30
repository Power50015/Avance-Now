export function isDev(nodeEnv: string): boolean {
  return nodeEnv === 'development';
}

export function isProd(nodeEnv: string): boolean {
  return nodeEnv === 'production';
}

export function isTest(nodeEnv: string): boolean {
  return nodeEnv === 'test';
}

export function parsePort(value: string, defaultVal: number): number {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 && parsed < 65536 ? parsed : defaultVal;
}
