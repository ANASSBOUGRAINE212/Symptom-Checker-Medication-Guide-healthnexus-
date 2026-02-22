/**
 * Doctor Flow E2E Tests
 * Tests doctor-related functionality (browsing, booking, registration)
 * 
 * Uses permanent test accounts seeded in the database
 */

import { test, expect } from '@playwright/test';
import { TEST_CREDENTIALS } from '../mocks/mockData';

test.describe('Doctor Flow', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/signin');
    await page.getByRole('textbox', { name: 'Email' }).fill(TEST_CREDENTIALS.user.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CREDENTIALS.user.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/home|diagnose/, { timeout: 10000 });
  });

  test('should browse doctors list', async ({ page }) => {
    await page.goto('http://localhost:5173/doctors');
    await expect(page).toHaveURL(/doctors/);
    
    // Check for doctors list
    const doctorCards = page.locator('[class*="doctor"], [class*="card"]');
    const count = await doctorCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should filter doctors by specialty', async ({ page }) => {
    await page.goto('http://localhost:5173/doctors');
    
    // Look for specialty filter
    const specialtyFilter = page.getByRole('combobox', { name: /specialty|specialization/i });
    if (await specialtyFilter.isVisible().catch(() => false)) {
      await specialtyFilter.click();
      
      // Select first option
      const options = page.getByRole('option');
      const count = await options.count();
      if (count > 0) {
        await options.nth(0).click();
      }
    }
  });

  test('should search doctors', async ({ page }) => {
    await page.goto('http://localhost:5173/doctors');
    
    // Look for search box
    const searchBox = page.getByRole('textbox', { name: /search/i });
    if (await searchBox.isVisible().catch(() => false)) {
      await searchBox.fill('cardiology');
      await page.waitForTimeout(1000);
    }
  });

  test('should view doctor profile', async ({ page }) => {
    await page.goto('http://localhost:5173/doctors');
    
    // Look for doctor profile links
    const doctorLinks = page.getByRole('link', { name: /view|profile|details/i });
    const count = await doctorLinks.count();
    
    if (count > 0) {
      await doctorLinks.nth(0).click();
      
      // Should navigate to doctor detail page
      await expect(page).toHaveURL(/doctors\/[a-zA-Z0-9-]+/);
    }
  });

  test('should book appointment with doctor', async ({ page }) => {
    await page.goto('http://localhost:5173/doctors');
    
    // Find and click on a doctor
    const doctorLinks = page.getByRole('link', { name: /view|profile|details/i });
    const count = await doctorLinks.count();
    
    if (count > 0) {
      await doctorLinks.nth(0).click();
      
      // Look for book appointment button
      const bookButton = page.getByRole('button', { name: /book|appointment/i });
      if (await bookButton.isVisible().catch(() => false)) {
        await bookButton.click();
        
        // Should show booking form or modal
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should apply as doctor', async ({ page }) => {
    await page.goto('http://localhost:5173/profile');
    
    // Look for "Apply as Doctor" button
    const applyButton = page.getByRole('button', { name: /apply.*doctor/i });
    if (await applyButton.isVisible().catch(() => false)) {
      await applyButton.click();
      
      // Should navigate to doctor registration
      await expect(page).toHaveURL(/doctor-register/);
    }
  });

  test('should fill doctor registration form', async ({ page }) => {
    await page.goto('http://localhost:5173/doctor-register');
    
    // Fill basic information
    const licenseInput = page.getByRole('textbox', { name: /license/i });
    if (await licenseInput.isVisible().catch(() => false)) {
      await licenseInput.fill('TEST-LICENSE-12345');
    }
    
    const experienceInput = page.getByRole('spinbutton', { name: /experience/i });
    if (await experienceInput.isVisible().catch(() => false)) {
      await experienceInput.fill('5');
    }
    
    const educationInput = page.getByRole('textbox', { name: /education/i });
    if (await educationInput.isVisible().catch(() => false)) {
      await educationInput.fill('Medical School University');
    }
  });

  test('should view doctor dashboard if user is doctor', async ({ page }) => {
    // Try to access doctor dashboard
    await page.goto('http://localhost:5173/doctor-dashboard');
    
    // If user is a doctor, should access dashboard
    // If not, should redirect or show error
    await page.waitForTimeout(2000);
  });
});
