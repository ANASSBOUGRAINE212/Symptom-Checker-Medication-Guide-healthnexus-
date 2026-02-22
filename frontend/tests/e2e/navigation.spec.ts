/**
 * Navigation E2E Tests
 * Tests application routing and navigation flows
 */

import { test, expect } from '@playwright/test';

test.describe('Application Navigation', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // Should load the landing/home page or redirect to signin
    await expect(page).toHaveURL(/^\/$|\/home|\/signin$/);
  });

  test('should show 404 page for invalid routes', async ({ page }) => {
    await page.goto('/invalid-route-that-does-not-exist-12345');
    
    // Check for 404 content - adjust to match your actual 404 page
    const notFoundText = page.getByText(/404|not found/i);
    await expect(notFoundText).toBeVisible({ timeout: 5000 });
  });

  // TODO: Add navigation tests after creating test user
  // To test protected routes, you need:
  // 1. A test user account in your database
  // 2. Login before testing protected routes
  // 3. Adjust selectors to match your actual UI
  
  // Example structure:
  // test.beforeEach(async ({ page }) => {
  //   // Login with test account
  //   await page.goto('/signin');
  //   await page.fill('[name="email"]', 'test@example.com');
  //   await page.fill('[name="password"]', 'Test123!@#');
  //   await page.click('button[type="submit"]');
  //   await page.waitForURL('/home');
  // });
  //
  // test('should navigate to diseases', async ({ page }) => {
  //   await page.click('text=Diseases');
  //   await expect(page).toHaveURL(/diseases/);
  // });
});
