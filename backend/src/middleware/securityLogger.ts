import { Request, Response, NextFunction } from 'express';
import { logger, createSecurityLog } from '../lib/logger';
import fs from 'fs';
import path from 'path';

type SecurityEvent = 
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_AUTH_TOKEN'
  | 'UNAUTHORIZED_ACCESS'
  | 'SUSPICIOUS_INPUT'
  | 'XSS_ATTEMPT'
  | 'SQL_INJECTION_ATTEMPT'
  | 'ADMIN_ACCESS'
  | 'FAILED_VALIDATION';

interface SecurityLogEntry {
  timestamp: string;
  event: SecurityEvent;
  ip: string;
  userAgent: string;
  userId?: string;
  endpoint: string;
  method: string;
  details?: any;
}

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const securityLogPath = path.join(logsDir, 'security.log');

export function logSecurityEvent(
  req: Request,
  event: SecurityEvent,
  details?: any,
  userId?: string
) {
  const logEntry: SecurityLogEntry = {
    timestamp: new Date().toISOString(),
    event,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    userId: userId || req.user?.id,
    endpoint: req.path,
    method: req.method,
    details
  };

  const logLine = JSON.stringify(logEntry) + '\n';
  
  logger.error(createSecurityLog(event, {
    ip: logEntry.ip,
    userAgent: logEntry.userAgent,
    userId: logEntry.userId,
    endpoint: logEntry.endpoint,
    method: logEntry.method,
    correlationId: (req as any).correlationId,
    details: logEntry.details
  }), `Security Event: ${event}`);

  fs.appendFile(securityLogPath, logLine, (err) => {
    if (err) {
      logger.error({ err }, 'Failed to write security log file');
    }
  });
}

export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/admin')) {
    logSecurityEvent(req, 'ADMIN_ACCESS', {
      path: req.path,
      query: req.query
    });
  }

  const queryString = JSON.stringify(req.query);
  if (queryString.includes('<script') || queryString.includes('javascript:') || queryString.includes('onerror=')) {
    logSecurityEvent(req, 'XSS_ATTEMPT', {
      query: req.query,
      body: req.body
    });
  }

  const suspiciousPatterns = [
    /union\s+select/i,
    /drop\s+table/i,
    /insert\s+into/i,
    /delete\s+from/i,
    /update\s+.*set/i,
    /exec\s*\(/i,
    /script\s*>/i
  ];

  const requestData = JSON.stringify({ ...req.query, ...req.body });
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      logSecurityEvent(req, 'SQL_INJECTION_ATTEMPT', {
        pattern: pattern.source,
        data: requestData
      });
      break;
    }
  }

  next();
};

export const securityErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.status === 401) {
    logSecurityEvent(req, 'INVALID_AUTH_TOKEN', {
      error: err.message,
      headers: req.headers.authorization ? 'Bearer token present' : 'No auth header'
    });
  } else if (err.status === 403) {
    logSecurityEvent(req, 'UNAUTHORIZED_ACCESS', {
      error: err.message,
      userId: req.user?.id
    });
  } else if (err.status === 429) {
    logSecurityEvent(req, 'RATE_LIMIT_EXCEEDED', {
      error: err.message
    });
  }

  if (process.env.NODE_ENV === 'production') {
    res.status(err.status || 500).json({
      error: err.status < 500 ? err.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(err.status || 500).json({
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
  }
};
