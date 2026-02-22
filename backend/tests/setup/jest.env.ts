// Set NODE_ENV before anything else
process.env.NODE_ENV = 'test';

// Load environment variables
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Force use of test database by overriding DATABASE_URL
if (process.env.DATABASE_TEST_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_TEST_URL;
  console.log('🔧 Test environment configured - Using test database');
}

console.log('🔧 Test environment configured - NODE_ENV:', process.env.NODE_ENV);
