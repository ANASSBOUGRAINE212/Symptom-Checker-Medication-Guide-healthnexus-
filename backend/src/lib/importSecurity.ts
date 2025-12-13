// Import Security - File validation and content sanitization

const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<link/gi,
  /data:/gi,
  /vbscript:/gi,
  /expression\s*\(/gi,
  /url\s*\(/gi,
  /@import/gi,
  /<!--/g,
  /-->/g,
  /\$\{/g,
  /`/g,
  /\{\{/g,
  /\}\}/g,
  /<\?/g,
  /\?>/g,
  /<%/g,
  /%>/g,
  /eval\s*\(/gi,
  /Function\s*\(/gi,
  /setTimeout\s*\(/gi,
  /setInterval\s*\(/gi,
  /document\./gi,
  /window\./gi,
  /\.innerHTML/gi,
  /\.outerHTML/gi,
  /\.insertAdjacentHTML/gi,
];

const SQL_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|UNION|DECLARE)\b)/gi,
  /(--)|(\/\*)|(\*\/)/g,
  /(;|\||&)/g,
];

const MAX_FIELD_LENGTHS: Record<string, number> = {
  name: 500,
  category: 200,
  severity: 50,
  definition: 10000,
  symptoms: 5000,
  causes: 5000,
  testsAndProcedures: 5000,
  medications: 5000,
  treatments: 5000,
  prevention: 5000,
  prognosis: 5000,
  prevalence: 200,
  categories: 1000,
};

const MAX_RECORDS = 10000;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface SecurityCheckResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: string;
}

export interface FileSecurityResult {
  isValid: boolean;
  errors: string[];
}

export function containsDangerousContent(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(value)) {
      return true;
    }
  }
  return false;
}

export function containsSQLInjection(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  
  for (const pattern of SQL_PATTERNS) {
    if (pattern.test(value)) {
      return true;
    }
  }
  return false;
}

export function sanitizeString(value: string): string {
  if (!value || typeof value !== 'string') return '';
  
  let sanitized = value
    .replace(/\0/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
  
  return sanitized;
}

export function validateField(
  fieldName: string, 
  value: string | undefined,
  required: boolean = false
): SecurityCheckResult {
  const errors: string[] = [];
  
  if (required && (!value || value.trim() === '')) {
    return { isValid: false, errors: [`${fieldName} is required`] };
  }
  
  if (!value || value.trim() === '') {
    return { isValid: true, errors: [], sanitizedValue: '' };
  }
  
  const maxLength = MAX_FIELD_LENGTHS[fieldName] || 5000;
  if (value.length > maxLength) {
    errors.push(`${fieldName} exceeds maximum length of ${maxLength} characters`);
  }
  
  if (containsDangerousContent(value)) {
    errors.push(`${fieldName} contains potentially dangerous content`);
  }
  
  const sanitizedValue = sanitizeString(value);
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue
  };
}

export function validateFile(file: Express.Multer.File): FileSecurityResult {
  const errors: string[] = [];
  
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
  
  const allowedExtensions = ['.csv', '.json'];
  const fileExt = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
  if (!allowedExtensions.includes(fileExt)) {
    errors.push(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`);
  }
  
  const allowedMimeTypes = ['text/csv', 'application/json', 'text/plain', 'application/octet-stream'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    errors.push(`Invalid MIME type: ${file.mimetype}`);
  }
  
  if (file.originalname.includes('\0')) {
    errors.push('Invalid filename');
  }
  
  if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
    errors.push('Invalid filename - path traversal detected');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateRecordCount(count: number): FileSecurityResult {
  if (count > MAX_RECORDS) {
    return {
      isValid: false,
      errors: [`Too many records. Maximum allowed: ${MAX_RECORDS}`]
    };
  }
  return { isValid: true, errors: [] };
}

export function sanitizeDiseaseRecord(record: any): { sanitized: any; errors: string[] } {
  const errors: string[] = [];
  const sanitized: any = {};
  
  const requiredFields = ['name', 'category', 'severity', 'definition'];
  
  for (const field of requiredFields) {
    const result = validateField(field, record[field], true);
    if (!result.isValid) {
      errors.push(...result.errors);
    }
    sanitized[field] = result.sanitizedValue || '';
  }
  
  const optionalFields = ['prognosis', 'prevalence'];
  for (const field of optionalFields) {
    const result = validateField(field, record[field], false);
    if (!result.isValid) {
      errors.push(...result.errors);
    }
    sanitized[field] = result.sanitizedValue || '';
  }
  
  const arrayFields = ['categories', 'symptoms', 'causes', 'testsAndProcedures', 'medications', 'treatments', 'prevention'];
  for (const field of arrayFields) {
    if (Array.isArray(record[field])) {
      sanitized[field] = record[field].map((item: string) => {
        const result = validateField(field, item, false);
        if (!result.isValid) errors.push(...result.errors);
        return result.sanitizedValue || '';
      }).filter((item: string) => item !== '');
    } else if (typeof record[field] === 'string') {
      const result = validateField(field, record[field], false);
      if (!result.isValid) errors.push(...result.errors);
      sanitized[field] = result.sanitizedValue || '';
    } else {
      sanitized[field] = [];
    }
  }
  
  return { sanitized, errors };
}

export function logSecurityEvent(event: string, details: any): void {
  console.warn(`[SECURITY] ${event}:`, JSON.stringify(details, null, 2));
}
