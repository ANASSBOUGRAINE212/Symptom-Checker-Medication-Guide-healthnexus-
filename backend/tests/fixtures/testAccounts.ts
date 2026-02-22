/**
 * Test Account Credentials
 * 
 * These match the permanent test accounts seeded in the database
 * Run: npm run seed:test to create these accounts
 * 
 * Same credentials used in frontend E2E tests
 */

import request from 'supertest';

export const TEST_CREDENTIALS = {
  user: {
    email: 'test-user@healthnexus.test',
    password: 'TestUser123!@#',
  },
  doctor: {
    email: 'test-doctor@healthnexus.test',
    password: 'TestDoctor123!@#',
  },
  admin: {
    email: 'test-admin@healthnexus.test',
    password: 'TestAdmin123!@#',
  },
};

/**
 * Helper to get test credentials by role
 */
export function getTestCredentials(role: 'user' | 'doctor' | 'admin') {
  return TEST_CREDENTIALS[role];
}

/**
 * Helper to get login tokens for test accounts
 */
export async function getTestUserToken(app: any, role: 'user' | 'doctor' | 'admin' = 'user') {
  const credentials = TEST_CREDENTIALS[role];
  
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send(credentials);
  
  if (res.status !== 200) {
    throw new Error(`Failed to login test ${role}: ${res.body.error || 'Unknown error'}`);
  }
  
  return {
    accessToken: res.body.accessToken,
    refreshToken: res.body.refreshToken,
    user: res.body.user,
  };
}
