/**
 * User Flow E2E Tests
 * Tests complete user journeys through the application
 * 
 * Uses permanent test accounts seeded in the database
 */

import { test, expect } from '@playwright/test';
import { TEST_CREDENTIALS } from '../mocks/mockData';

test.describe('Complete User Flow', () => {
  
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('http://localhost:5173/signin');
    
    // Fill login form with test user credentials
    await page.getByRole('textbox', { name: 'Email' }).fill(TEST_CREDENTIALS.user.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CREDENTIALS.user.password);
    
    // Check remember me
    await page.getByText('Remember me for 30 days').click();
    
    // Submit login
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Should redirect to profile-setup, home, diagnose, or dashboard
    await expect(page).toHaveURL(/profile-setup|home|diagnose|dashboard/, { timeout: 10000 });
  });

  test('should navigate through main pages', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/signin');
    await page.getByRole('textbox', { name: 'Email' }).fill(TEST_CREDENTIALS.user.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CREDENTIALS.user.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for login to complete
    await page.waitForURL(/home|diagnose|profile-setup/, { timeout: 10000 });
    
    // Wait for page to be stable
    await page.waitForLoadState('networkidle');
    
    // Navigate to Doctors page
    await page.getByRole('link', { name: 'Doctors' }).first().click();
    await expect(page).toHaveURL(/doctors/);
    
    // Navigate to Medications page
    await page.goto('http://localhost:5173/medications');
    await expect(page).toHaveURL(/medications/);
    
    // Navigate to Diseases page (if available)
    const diseasesLink = page.getByRole('link', { name: 'Diseases' }).first();
    if (await diseasesLink.isVisible().catch(() => false)) {
      await diseasesLink.click();
      await expect(page).toHaveURL(/diseases/);
    }
    
    // Navigate to Profile page
    await page.getByRole('link', { name: 'Profile' }).first().click();
    await expect(page).toHaveURL(/profile/);
  });

  test('should access profile tabs', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/signin');
    await page.getByRole('textbox', { name: 'Email' }).fill(TEST_CREDENTIALS.user.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CREDENTIALS.user.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for login
    await expect(page).toHaveURL(/profile-setup|home|diagnose|dashboard/, { timeout: 10000 });
    
    // Navigate directly to profile page
    await page.goto('http://localhost:5173/profile');
    await page.waitForURL(/profile/, { timeout: 5000 });
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check if tabs exist and click them
    const tabs = page.getByRole('tab');
    const tabCount = await tabs.count();
    
    if (tabCount > 0) {
      // Click through available tabs
      for (let i = 0; i < Math.min(tabCount, 3); i++) {
        await tabs.nth(i).click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should navigate to forgot password', async ({ page }) => {
    await page.goto('http://localhost:5173/signin');
    
    // Click forgot password link
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    await expect(page).toHaveURL(/forgot-password/);
    
    // Go back to sign in
    await page.getByRole('link', { name: '← Back to Sign In' }).click();
    await expect(page).toHaveURL(/signin/);
  });

  test('should access appointments page', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/signin');
    await page.getByRole('textbox', { name: 'Email' }).fill(TEST_CREDENTIALS.user.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CREDENTIALS.user.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for login
    await page.waitForURL(/home|diagnose/, { timeout: 10000 });
    
    // Try to navigate to appointments directly
    await page.goto('http://localhost:5173/appointments');
    await expect(page).toHaveURL(/appointments/);
  });

  test('should search for doctors', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/signin');
    await page.getByRole('textbox', { name: 'Email' }).fill(TEST_CREDENTIALS.user.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CREDENTIALS.user.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for login
    await expect(page).toHaveURL(/profile-setup|home|diagnose|dashboard/, { timeout: 10000 });
    
    // Navigate directly to doctors page
    await page.goto('http://localhost:5173/doctors');
    await expect(page).toHaveURL(/doctors/);
    
    // Check if search functionality exists
    const searchBox = page.getByRole('textbox', { name: /search/i });
    if (await searchBox.isVisible().catch(() => false)) {
      await searchBox.fill('cardiology');
    }
  });

  test('should access medications search', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/signin');
    await page.getByRole('textbox', { name: 'Email' }).fill(TEST_CREDENTIALS.user.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CREDENTIALS.user.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for login
    await expect(page).toHaveURL(/profile-setup|home|diagnose|dashboard/, { timeout: 10000 });
    
    // Navigate directly to medications page
    await page.goto('http://localhost:5173/medications');
    await expect(page).toHaveURL(/medications/);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if search exists (flexible check)
    const searchBox = page.getByRole('textbox').first();
    if (await searchBox.isVisible().catch(() => false)) {
      await searchBox.fill('paracetamol');
      await page.waitForTimeout(1000);
    }
  });
});
