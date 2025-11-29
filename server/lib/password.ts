import bcrypt from 'bcryptjs';
import { logger } from './logger';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    logger.error({ err: error }, 'Password hashing failed');
    throw new Error('Failed to hash password');
  }
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
  } catch (error) {
    logger.error({ err: error }, 'Password verification failed');
    return false;
  }
};

export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[]
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  const commonPasswords = [
    'password', '12345678', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a stronger password');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
