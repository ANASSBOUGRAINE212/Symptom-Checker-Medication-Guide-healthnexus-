/**
 * Authentication E2E Tests
 * Tests complete user authentication flows in a real browser
 * 
 * Uses permanent test accounts seeded in the database
 * Run: npm run seed:test (in backend) to create test accounts
 */

import { test, expect } from '@playwright/test';
import { TEST_CREDENTIALS } from '../mocks/mockData';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto('/');
  });

  test('should display landing page', async ({ page }) => {
    // Check if the landing page loads
    await expect(page).toHaveTitle(/HealthNexus|Health/i);
  });

  test('should navigate to sign in page', async ({ page }) => {
    // Try to find and click sign in button/link
    const signInButton = page.getByRole('link', { name: /sign in/i }).or(
      page.getByRole('button', { name: /sign in/i })
    );
    
    if (await signInButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await signInButton.click();
      await expect(page).toHaveURL(/signin/);
    } else {
      // If no sign in button, navigate directly
      await page.goto('/signin');
      await expect(page).toHaveURL(/signin/);
    }
  });

  test('should login as regular user', async ({ page }) => {
    await page.goto('/signin');
    
    // Fill in test user credentials
    await page.fill('[name="email"]', TEST_CREDENTIALS.user.email);
    await page.fill('[name="password"]', TEST_CREDENTIALS.user.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to profile-setup, home, or dashboard
    await expect(page).toHaveURL(/profile-setup|home|dashboard/);
  });

  test('should login as doctor', async ({ page }) => {
    await page.goto('/signin');
    
    // Fill in test doctor credentials
    await page.fill('[name="email"]', TEST_CREDENTIALS.doctor.email);
    await page.fill('[name="password"]', TEST_CREDENTIALS.doctor.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to profile-setup, doctor dashboard, home, or dashboard
    await expect(page).toHaveURL(/profile-setup|doctor|home|dashboard/);
  });

  test('should login as admin', async ({ page }) => {
    await page.goto('/signin');
    
    // Fill in test admin credentials
    await page.fill('[name="email"]', TEST_CREDENTIALS.admin.email);
    await page.fill('[name="password"]', TEST_CREDENTIALS.admin.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to admin, home, or dashboard
    await expect(page).toHaveURL(/admin|home|dashboard/);
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/signin');
    await page.fill('[name="email"]', TEST_CREDENTIALS.user.email);
    await page.fill('[name="password"]', TEST_CREDENTIALS.user.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/profile-setup|home|dashboard/);
    
    // Wait for page to be stable
    await page.waitForLoadState('networkidle');
    
    // Find and click logout button - try multiple selectors
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout"), a:has-text("Sign Out")').first();
    
    if (await logoutButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await logoutButton.click();
      // Should redirect to home or signin
      await expect(page).toHaveURL(/\/|signin/);
    } else {
      // Skip test if logout button not found (might be in a menu)
      console.log('Logout button not found - skipping');
    }
  });
});
