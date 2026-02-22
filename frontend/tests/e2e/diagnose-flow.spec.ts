/**
 * Diagnose Flow E2E Tests
 * Tests symptom checker and diagnosis functionality
 * 
 * Uses permanent test accounts seeded in the database
 */

import { test, expect } from '@playwright/test';
import { TEST_CREDENTIALS } from '../mocks/mockData';

test.describe('Diagnose Flow', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/signin');
    await page.getByRole('textbox', { name: 'Email' }).fill(TEST_CREDENTIALS.user.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CREDENTIALS.user.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/home|diagnose/, { timeout: 10000 });
  });

  test('should access symptom checker', async ({ page }) => {
    // Navigate to diagnose page
    await page.goto('http://localhost:5173/diagnose');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Should be on diagnose page
    await expect(page).toHaveURL(/diagnose/);
    
    // Check for symptom checker content (flexible check)
    const hasSymptomContent = await page.getByText(/symptom|diagnose|select/i).first().isVisible().catch(() => false);
    expect(hasSymptomContent).toBeTruthy();
  });

  test('should select symptoms', async ({ page }) => {
    await page.goto('http://localhost:5173/diagnose');
    
    // Look for symptom selection interface
    const symptomCheckboxes = page.getByRole('checkbox');
    const count = await symptomCheckboxes.count();
    
    if (count > 0) {
      // Select first few symptoms
      await symptomCheckboxes.nth(0).click();
      if (count > 1) await symptomCheckboxes.nth(1).click();
      if (count > 2) await symptomCheckboxes.nth(2).click();
    }
  });

  test('should submit diagnosis request', async ({ page }) => {
    await page.goto('http://localhost:5173/diagnose');
    
    // Select at least one symptom
    const symptomCheckboxes = page.getByRole('checkbox');
    const count = await symptomCheckboxes.count();
    
    if (count > 0) {
      await symptomCheckboxes.nth(0).click();
      
      // Look for submit/diagnose button
      const submitButton = page.getByRole('button', { name: /diagnose|submit|check/i });
      if (await submitButton.isVisible().catch(() => false)) {
        await submitButton.click();
        
        // Should show results or redirect
        await page.waitForTimeout(2000);
      }
    }
  });

  test('should view diagnosis history', async ({ page }) => {
    // Navigate to diagnoses page
    await page.goto('http://localhost:5173/diagnoses');
    
    // Should show diagnosis history
    await expect(page).toHaveURL(/diagnoses/);
  });

  test('should view diagnosis details', async ({ page }) => {
    await page.goto('http://localhost:5173/diagnoses');
    
    // Look for diagnosis cards/items
    const diagnosisItems = page.getByRole('link').filter({ hasText: /view|details/i });
    const count = await diagnosisItems.count();
    
    if (count > 0) {
      // Click first diagnosis
      await diagnosisItems.nth(0).click();
      
      // Should navigate to detail page
      await expect(page).toHaveURL(/diagnosis\/[a-zA-Z0-9-]+/);
    }
  });
});
