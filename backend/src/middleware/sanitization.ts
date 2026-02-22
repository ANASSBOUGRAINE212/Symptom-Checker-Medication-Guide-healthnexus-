import { Request, Response, NextFunction } from 'express';

// Simple HTML sanitization function
function sanitizeString(str: string): string {
  if (typeof str !== 'string') return str;
  
  // Remove script tags and their content
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  str = str.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  str = str.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Escape HTML entities
  str = str.replace(/</g, '&lt;');
  str = str.replace(/>/g, '&gt;');
  str = str.replace(/"/g, '&quot;');
  str = str.replace(/'/g, '&#x27;');
  str = str.replace(/\//g, '&#x2F;');
  
  return str;
}

// Recursively sanitize object
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
}

// Middleware to sanitize request body
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
}
