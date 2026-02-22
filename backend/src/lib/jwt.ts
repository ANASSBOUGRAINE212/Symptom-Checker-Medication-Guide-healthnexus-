import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { logger } from './logger';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-token-secret-change-in-production';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-change-in-production';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  tokenVersion?: number;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  try {
    const token = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: 'healthnexus',
      audience: 'healthnexus-api'
    });
    return token;
  } catch (error) {
    logger.error({ err: error }, 'Access token generation failed');
    throw new Error('Failed to generate access token');
  }
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  try {
    // Add a unique jti (JWT ID) to prevent duplicate tokens when generated at the same second
    const jti = randomBytes(16).toString('hex');
    const token = jwt.sign({ ...payload, jti }, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'healthnexus',
      audience: 'healthnexus-api'
    });
    return token;
  } catch (error) {
    logger.error({ err: error }, 'Refresh token generation failed');
    throw new Error('Failed to generate refresh token');
  }
};

export const verifyAccessToken = (token: string): DecodedToken => {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET, {
      issuer: 'healthnexus',
      audience: 'healthnexus-api'
    }) as DecodedToken;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid access token');
    }
    logger.error({ err: error }, 'Access token verification failed');
    throw new Error('Token verification failed');
  }
};

export const verifyRefreshToken = (token: string): DecodedToken => {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET, {
      issuer: 'healthnexus',
      audience: 'healthnexus-api'
    }) as DecodedToken;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    logger.error({ err: error }, 'Refresh token verification failed');
    throw new Error('Token verification failed');
  }
};

export const generateRandomToken = (length: number = 32): string => {
  return randomBytes(length).toString('hex');
};

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const decoded = jwt.decode(token) as DecodedToken;
    return decoded;
  } catch (error) {
    logger.error({ err: error }, 'Token decoding failed');
    return null;
  }
};

export const getTokenExpiry = (token: string): number | null => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }
  return decoded.exp;
};

export const isTokenExpired = (token: string): boolean => {
  const expiry = getTokenExpiry(token);
  if (!expiry) {
    return true;
  }
  return Date.now() >= expiry * 1000;
};
