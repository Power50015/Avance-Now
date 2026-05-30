import pino from 'pino';

export function createLogger(level: string): pino.Logger {
  return pino({
    level,
    transport:
      level === 'debug' || level === 'info'
        ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss.l' } }
        : undefined,
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        requestId: req.id,
        headers: req.headers,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
      err: pino.stdSerializers.err,
    },
  });
}
