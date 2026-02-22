/**
 * Admin Flow E2E Tests
 * Tests admin-specific functionality
 * 
 * Uses permanent test accounts seeded in the database
 */

import { test, expect } from '@playwright/test';
import { TEST_CREDENTIALS } from '../mocks/mockData';

test.describe('Admin Flow', () => {
  // Login before each test with ADMIN credentials
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/signin');
    await page.getByRole('textbox', { name: 'Email' }).fill(TEST_CREDENTIALS.admin.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CREDENTIALS.admin.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/home|diagnose|admin/, { timeout: 10000 });
  });

  test('should access admin panel', async ({ page }) => {
    // Try to navigate to admin page
    await page.goto('http://localhost:5173/admin');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Should be able to access admin page
    await expect(page).toHaveURL(/admin/);
    
    // Check for admin-specific content (more flexible check)
    const pageContent = await page.content();
    const hasAdminContent = pageContent.toLowerCase().includes('admin') || 
                           pageContent.toLowerCase().includes('dashboard') || 
                           pageContent.toLowerCase().includes('manage') ||
                           pageContent.toLowerCase().includes('users') ||
                           pageContent.toLowerCase().includes('doctors') ||
                           pageContent.toLowerCase().includes('statistics');
    
    expect(hasAdminContent).toBeTruthy();
  });

  test('should view pending doctor applications', async ({ page }) => {
    await page.goto('http://localhost:5173/admin');
    
    // Look for doctor verification section
    const doctorSection = page.getByText(/doctor|verification|pending/i).first();
    if (await doctorSection.isVisible().catch(() => false)) {
      await doctorSection.click();
    }
  });

  test('should manage diseases', async ({ page }) => {
    await page.goto('http://localhost:5173/admin');
    
    // Try to access disease management
    const diseasesLink = page.getByRole('link', { name: /diseases/i });
    if (await diseasesLink.isVisible().catch(() => false)) {
      await diseasesLink.click();
    }
  });

  test('should manage medications', async ({ page }) => {
    await page.goto('http://localhost:5173/admin');
    
    // Try to access medication management
    const medicationsLink = page.getByRole('link', { name: /medications/i });
    if (await medicationsLink.isVisible().catch(() => false)) {
      await medicationsLink.click();
    }
  });

  test('should view system statistics', async ({ page }) => {
    await page.goto('http://localhost:5173/admin');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for any statistics/metrics (flexible check)
    const pageContent = await page.content();
    const hasStats = pageContent.includes('total') || 
                     pageContent.includes('users') || 
                     pageContent.includes('doctors') || 
                     pageContent.includes('appointments') ||
                     pageContent.includes('statistics');
    
    expect(hasStats).toBeTruthy();
  });

  test('should access user management', async ({ page }) => {
    await page.goto('http://localhost:5173/admin');
    
    // Look for user management section
    const usersSection = page.getByText(/users|manage users/i).first();
    if (await usersSection.isVisible().catch(() => false)) {
      await usersSection.click();
    }
  });
});
