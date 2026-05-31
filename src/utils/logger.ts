import pino from 'pino';
import type { NodeEnv } from '../types/index.js';

/**
 * Creates the application-wide Pino logger instance.
 *
 * In development, logs are piped through `pino-pretty` for human-readable
 * output. In production and test environments, raw JSON is emitted for
 * structured log aggregation (e.g. Datadog, ELK).
 *
 * The request serializer intentionally omits sensitive headers such as
 * `Authorization` and `Cookie` to prevent credential leakage into log stores.
 *
 * @param level - Pino log level (`debug`, `info`, `warn`, `error`, `fatal`).
 * @param nodeEnv - Current runtime environment, used to decide transport.
 */
export function createLogger(level: string, nodeEnv: NodeEnv): pino.Logger {
  const usePretty = nodeEnv === 'development';

  return pino({
    level,
    transport: usePretty
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss.l' } }
      : undefined,
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        requestId: req.id,
        userAgent: req.headers?.['user-agent'],
        host: req.headers?.host,
        contentType: req.headers?.['content-type'],
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
      err: pino.stdSerializers.err,
    },
  });
}
