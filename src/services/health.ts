import { HealthStatus } from '../types/index.js';

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
