import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  } : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const createAuditLog = (action: string, details: any) => ({
  type: 'AUDIT',
  action,
  timestamp: new Date().toISOString(),
  ...details,
});

export const createSecurityLog = (event: string, details: any) => ({
  type: 'SECURITY',
  event,
  timestamp: new Date().toISOString(),
  ...details,
});

export const createPerformanceLog = (operation: string, duration: number, details?: any) => ({
  type: 'PERFORMANCE',
  operation,
  duration,
  timestamp: new Date().toISOString(),
  ...details,
});
