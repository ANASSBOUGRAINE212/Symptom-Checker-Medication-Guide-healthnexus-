// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { prisma } from '../lib/database';
import { logger } from '../lib/logger';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.substring(7)
      : null;

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'No authentication token provided',
        code: 'NO_TOKEN'
      });
      return;
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid token',
        code: 'INVALID_TOKEN'
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true
      }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        error: 'Account is inactive',
        code: 'ACCOUNT_INACTIVE'
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    logger.error({ err: error }, 'Authentication middleware error');
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

export const requireEmailVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated', code: 'NOT_AUTHENTICATED' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { emailVerified: true }
    });

    if (!user?.emailVerified) {
      res.status(403).json({ success: false, error: 'Email verification required', code: 'EMAIL_NOT_VERIFIED' });
      return;
    }

    next();
  } catch (error) {
    logger.error({ err: error }, 'Email verification check failed');
    res.status(500).json({ success: false, error: 'Verification check failed', code: 'VERIFICATION_ERROR' });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated', code: 'NOT_AUTHENTICATED' });
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const userEmail = req.user.email.toLowerCase();
  
  const isAdmin = req.user.role === 'ADMIN' || (adminEmail && userEmail === adminEmail);

  if (!isAdmin) {
    logger.warn({ userId: req.user.id }, 'Unauthorized admin access attempt');
    res.status(403).json({ success: false, error: 'Admin access required', code: 'INSUFFICIENT_PERMISSIONS' });
    return;
  }

  next();
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated', code: 'NOT_AUTHENTICATED' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn({ userId: req.user.id, requiredRoles: roles }, 'Unauthorized role access attempt');
      res.status(403).json({ success: false, error: 'Insufficient permissions', code: 'INSUFFICIENT_PERMISSIONS' });
      return;
    }

    next();
  };
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.substring(7)
      : null;

    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, email: true, role: true, isActive: true }
        });

        if (user?.isActive) {
          req.user = { id: user.id, email: user.email, role: user.role };
        }
      } catch {
      }
    }
    next();
  } catch (error) {
    logger.error({ err: error }, 'Optional auth middleware error');
    next();
  }
};
