import { createCipheriv, createDecipheriv, randomBytes, createHash, timingSafeEqual } from 'crypto';
import { logger } from './logger';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

const getEncryptionKey = (): Buffer => {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error('ENCRYPTION_SECRET environment variable is required');
  }
  if (secret.length < 32) {
    throw new Error('ENCRYPTION_SECRET must be at least 32 characters long');
  }
  return createHash('sha256').update(secret).digest();
};

export const encryptField = (data: any): string | null => {
  try {
    if (data === null || data === undefined) return null;
    
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    const plaintext = JSON.stringify(data);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    const combined = Buffer.concat([iv, tag, Buffer.from(encrypted, 'hex')]);
    return combined.toString('base64');
  } catch (error) {
    logger.error({ err: error }, 'Field encryption failed');
    throw new Error('Encryption failed');
  }
};

export const decryptField = (encryptedData: string | null): any => {
  try {
    if (encryptedData === null || encryptedData === undefined) return null;
    
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedData, 'base64');
    
    if (combined.length < IV_LENGTH + TAG_LENGTH) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = combined.subarray(0, IV_LENGTH);
    const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH + TAG_LENGTH);
    
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    logger.error({ err: error }, 'Field decryption failed');
    throw new Error('Decryption failed');
  }
};

export const encryptFields = (data: Record<string, any>, fieldsToEncrypt: string[]): Record<string, any> => {
  const result = { ...data };
  
  for (const field of fieldsToEncrypt) {
    if (result[field] !== undefined) {
      result[`${field}Encrypted`] = encryptField(result[field]);
      delete result[field];
    }
  }
  
  return result;
};

export const decryptFields = (data: Record<string, any>, fieldsToDecrypt: string[]): Record<string, any> => {
  const result = { ...data };
  
  for (const field of fieldsToDecrypt) {
    const encryptedField = `${field}Encrypted`;
    if (result[encryptedField] !== undefined) {
      result[field] = decryptField(result[encryptedField]);
      delete result[encryptedField];
    }
  }
  
  return result;
};

export const generateNewEncryptionKey = (): string => {
  return randomBytes(32).toString('hex');
};

export const testEncryption = (): boolean => {
  try {
    const testCases = [
      { test: 'simple string', number: 123 },
      { array: [1, 2, 3], nested: { deep: 'value' } },
      { special: 'chars!@#$%^&*()' },
      null,
      '',
    ];
    
    for (const testData of testCases) {
      const encrypted = encryptField(testData);
      const decrypted = decryptField(encrypted);
      
      if (JSON.stringify(testData) !== JSON.stringify(decrypted)) {
        logger.error({ testData, decrypted }, 'Encryption test failed for data');
        return false;
      }
    }
    
    const data = { test: 'same data' };
    const encrypted1 = encryptField(data);
    const encrypted2 = encryptField(data);
    
    if (encrypted1 === encrypted2) {
      logger.error('Encryption not using random IVs - security risk');
      return false;
    }
    
    logger.info('Encryption health check passed all tests');
    return true;
  } catch (error) {
    logger.error({ err: error }, 'Encryption health check failed');
    return false;
  }
};