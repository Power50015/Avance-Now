import { HealthStatus } from '../types/index.js';

/**
 * Builds a {@link HealthStatus} snapshot of the current process.
 *
 * Memory values are rounded to whole megabytes for readability in
 * dashboards and alerting systems.
 *
 * @param version - Application version string (from `AppConfig.version`).
 * @returns A health status object suitable for JSON serialisation.
 */
export function getHealthStatus(version: string): HealthStatus {
  const memoryUsage = process.memoryUsage();
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
    },
    version,
  };
}
