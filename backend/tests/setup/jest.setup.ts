// Jest Setup Configuration
// This file runs before all test files

// Load test environment variables
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Override NODE_ENV for tests
process.env.NODE_ENV = 'test';

// Import the main test setup
import './testSetup';

// Suppress console logs during tests (optional)
// Uncomment if you want cleaner test output
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };

// Global test utilities
global.testTimeout = 30000;

// Mock external services if needed
// Example: Mock email service
// jest.mock('../src/lib/email', () => ({
//   sendEmail: jest.fn().mockResolvedValue(true),
// }));

// Custom matchers (optional)
expect.extend({
  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false,
      };
    }
  },
});

// Global error handler for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Increase timeout for all tests (configured in jest.config.js but can be overridden here)
// Note: Individual tests can override this with their own timeout

console.log('🧪 Jest setup completed - Test environment ready');
