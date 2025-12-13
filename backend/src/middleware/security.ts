import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import xss from 'xss';

declare global {
  namespace Express {
    interface Locals {
      nonce?: string;
    }
  }
}

export const httpsRedirect = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'production') {
    const forwardedProto = req.header('x-forwarded-proto');
    const isHttps = forwardedProto === 'https' || req.secure;

    if (!isHttps) {
      const httpsUrl = `https://${req.header('host')}${req.url}`;
      return res.redirect(301, httpsUrl);
    }
  }
  next();
};

export const generateNonce = (_req: Request, res: Response, next: NextFunction) => {
  const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    const developmentCSP = [
      "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
      "script-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
      "style-src * 'unsafe-inline' data:",
      "img-src * data: blob:",
      "font-src * data:",
      "connect-src * data: blob:",
      "media-src * data: blob:",
      "object-src * data:",
      "child-src * data: blob:",
      "frame-src * data:",
      "worker-src * blob: data: 'unsafe-eval'",
      "form-action *",
      "base-uri *"
    ].join('; ');

    res.setHeader('Content-Security-Policy', developmentCSP);
    res.locals.nonce = '';
  } else {
    const nonce = Buffer.from(uuidv4()).toString('base64');
    res.locals.nonce = nonce;

    const cspDirectives = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' 'unsafe-inline'`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
      "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' wss:",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');

    res.setHeader('Content-Security-Policy', cspDirectives);
  }

  next();
};

export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  next();
};

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return xss(obj, {
      whiteList: {},
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style']
    });
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanKey = typeof key === 'string' ? xss(key, { whiteList: {}, stripIgnoreTag: true }) : key;
      sanitized[cleanKey] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

export const securityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
};
