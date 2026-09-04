import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('Application loads and shows login page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Login')).toBeVisible();
  });

  test('User can complete login flow', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[placeholder="Username"]', 'doctor');
    await page.fill('input[placeholder="Password"]', 'doctor123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('Dashboard displays key metrics', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[placeholder="Username"]', 'doctor');
    await page.fill('input[placeholder="Password"]', 'doctor123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard');

    // Check for dashboard elements
    await expect(page.locator('text=Total Patients')).toBeVisible();
    await expect(page.locator('text=Appointments Today')).toBeVisible();
    await expect(page.locator('text=Pending Consultations')).toBeVisible();
  });

  test('Navigation menu is accessible', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="Username"]', 'doctor');
    await page.fill('input[placeholder="Password"]', 'doctor123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard');

    // Check menu items exist
    await expect(page.locator('text=Patients')).toBeVisible();
    await expect(page.locator('text=Appointments')).toBeVisible();
    await expect(page.locator('text=Consultations')).toBeVisible();
    await expect(page.locator('text=Billing')).toBeVisible();
  });

  test('Can navigate to Patients module', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="Username"]', 'doctor');
    await page.fill('input[placeholder="Password"]', 'doctor123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard');
    await page.click('text=Patients');

    await page.waitForURL('**/patients');
    await expect(page.locator('text=Patients')).toBeVisible();
  });

  test('Can navigate to Appointments module', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="Username"]', 'doctor');
    await page.fill('input[placeholder="Password"]', 'doctor123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard');
    await page.click('text=Appointments');

    await page.waitForURL('**/appointments');
    await expect(page.locator('text=Appointments')).toBeVisible();
  });

  test('Can navigate to Billing module', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="Username"]', 'doctor');
    await page.fill('input[placeholder="Password"]', 'doctor123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard');
    await page.click('text=Billing');

    await page.waitForURL('**/billing');
    await expect(page.locator('text=Billing')).toBeVisible();
  });
});
