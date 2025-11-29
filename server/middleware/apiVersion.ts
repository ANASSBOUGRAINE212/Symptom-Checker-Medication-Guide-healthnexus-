import { Request, Response, NextFunction } from 'express';

export const addVersionHeaders = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-API-Version', 'v1');
  res.setHeader('X-API-Deprecated', 'false');
  next();
};

export const deprecationWarning = (req: Request, res: Response, next: NextFunction) => {
  if (!req.path.includes('/v1/')) {
    res.setHeader('X-API-Deprecated', 'true');
    res.setHeader('X-API-Deprecation-Info', 'This endpoint will be deprecated. Please use /api/v1/ instead.');
    res.setHeader('X-API-Sunset-Date', '2026-05-10');
  }
  next();
};

export const getApiVersion = (req: Request): string => {
  const pathMatch = req.path.match(/\/v(\d+)\//);
  if (pathMatch) return `v${pathMatch[1]}`;
  
  const headerVersion = req.get('X-API-Version');
  if (headerVersion) return headerVersion;
  
  return 'v1';
};
