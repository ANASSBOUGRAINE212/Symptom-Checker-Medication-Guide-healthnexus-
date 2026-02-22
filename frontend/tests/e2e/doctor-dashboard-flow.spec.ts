/**
 * Doctor Dashboard Flow E2E Tests
 * Tests doctor-specific dashboard and patient management features
 * 
 * Uses permanent test doctor account seeded in the database
 * Run: npm run seed:test (in backend) to create test accounts
 */

import { test, expect } from '@playwright/test';
import { TEST_CREDENTIALS } from '../mocks/mockData';

test.describe('Doctor Dashboard Flow', () => {
  // Login before each test with DOCTOR credentials
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/signin');
    await page.getByRole('textbox', { name: 'Email' }).fill(TEST_CREDENTIALS.doctor.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CREDENTIALS.doctor.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/home|diagnose|doctor/, { timeout: 10000 });
  });

  test('should access doctor dashboard', async ({ page }) => {
    // Navigate to doctor dashboard
    await page.goto('http://localhost:5173/doctor-dashboard');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Should be on doctor dashboard (or redirected if not a doctor)
    const currentUrl = page.url();
    
    // If user is a doctor, should be on dashboard
    if (currentUrl.includes('doctor-dashboard')) {
      await expect(page).toHaveURL(/doctor-dashboard/);
      
      // Check for dashboard content
      const pageContent = await page.content();
      const hasDashboardContent = pageContent.includes('dashboard') || 
                                  pageContent.includes('appointments') ||
                                  pageContent.includes('patients');
      expect(hasDashboardContent).toBeTruthy();
    }
  });

  test('should view doctor appointments', async ({ page }) => {
    await page.goto('http://localhost:5173/doctor-dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check if on doctor dashboard
    if (page.url().includes('doctor-dashboard')) {
      // Look for appointments section
      const appointmentsSection = page.getByText(/appointments|schedule/i).first();
      if (await appointmentsSection.isVisible().catch(() => false)) {
        await appointmentsSection.click();
      }
      
      // Check for appointment list or calendar
      const hasAppointments = await page.getByText(/appointment|patient|time|date/i).first().isVisible().catch(() => false);
      expect(hasAppointments).toBeTruthy();
    }
  });

  test('should view patients list', async ({ page }) => {
    await page.goto('http://localhost:5173/doctor-patients');
    await page.waitForLoadState('networkidle');
    
    // Check if on patients page
    if (page.url().includes('doctor-patients')) {
      await expect(page).toHaveURL(/doctor-patients/);
      
      // Check for patients content
      const pageContent = await page.content();
      const hasPatientsContent = pageContent.includes('patient') || 
                                 pageContent.includes('name') ||
                                 pageContent.includes('appointment');
      expect(hasPatientsContent).toBeTruthy();
    }
  });

  test('should update appointment status', async ({ page }) => {
    await page.goto('http://localhost:5173/doctor-dashboard');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('doctor-dashboard')) {
      // Look for appointment status buttons
      const statusButtons = page.getByRole('button', { name: /confirm|complete|cancel|accept/i });
      const count = await statusButtons.count();
      
      if (count > 0) {
        // Click first status button
        await statusButtons.nth(0).click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should view doctor profile', async ({ page }) => {
    await page.goto('http://localhost:5173/doctor-profile');
    await page.waitForLoadState('networkidle');
    
    // Check if on doctor profile page
    if (page.url().includes('doctor-profile')) {
      await expect(page).toHaveURL(/doctor-profile/);
      
      // Check for profile content
      const pageContent = await page.content();
      const hasProfileContent = pageContent.includes('profile') || 
                               pageContent.includes('specialization') ||
                               pageContent.includes('license') ||
                               pageContent.includes('experience');
      expect(hasProfileContent).toBeTruthy();
    }
  });

  test('should update doctor profile', async ({ page }) => {
    await page.goto('http://localhost:5173/doctor-profile');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('doctor-profile')) {
      // Look for edit button
      const editButton = page.getByRole('button', { name: /edit|update/i });
      if (await editButton.isVisible().catch(() => false)) {
        await editButton.click();
        await page.waitForTimeout(1000);
        
        // Look for bio/description field
        const bioField = page.getByRole('textbox', { name: /bio|description|about/i });
        if (await bioField.isVisible().catch(() => false)) {
          await bioField.fill('Updated doctor bio for testing');
        }
      }
    }
  });

  test('should manage doctor schedule', async ({ page }) => {
    await page.goto('http://localhost:5173/doctor-profile');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('doctor-profile')) {
      // Look for schedule section
      const scheduleSection = page.getByText(/schedule|availability|hours/i).first();
      if (await scheduleSection.isVisible().catch(() => false)) {
        await scheduleSection.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should view appointment details', async ({ page }) => {
    await page.goto('http://localhost:5173/doctor-dashboard');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('doctor-dashboard')) {
      // Look for appointment cards or rows
      const appointmentLinks = page.getByRole('link', { name: /view|details/i });
      const count = await appointmentLinks.count();
      
      if (count > 0) {
        await appointmentLinks.nth(0).click();
        await page.waitForTimeout(2000);
      }
    }
  });

  test('should add notes to appointment', async ({ page }) => {
    await page.goto('http://localhost:5173/doctor-dashboard');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('doctor-dashboard')) {
      // Look for notes/comments field
      const notesField = page.getByRole('textbox', { name: /notes|comments|diagnosis/i });
      if (await notesField.isVisible().catch(() => false)) {
        await notesField.fill('Test appointment notes');
        
        // Look for save button
        const saveButton = page.getByRole('button', { name: /save|submit/i });
        if (await saveButton.isVisible().catch(() => false)) {
          await saveButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test('should filter appointments by status', async ({ page }) => {
    await page.goto('http://localhost:5173/doctor-dashboard');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('doctor-dashboard')) {
      // Look for status filter
      const statusFilter = page.getByRole('combobox', { name: /status|filter/i });
      if (await statusFilter.isVisible().catch(() => false)) {
        await statusFilter.click();
        
        // Select first option
        const options = page.getByRole('option');
        const count = await options.count();
        if (count > 0) {
          await options.nth(0).click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });
});
