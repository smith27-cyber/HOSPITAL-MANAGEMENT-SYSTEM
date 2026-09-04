import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('User can login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="Username"]', 'doctor');
    await page.fill('input[placeholder="Password"]', 'doctor123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard');
    await expect(page).toHaveTitle(/Dashboard/i);
  });

  test('User cannot login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="Username"]', 'doctor');
    await page.fill('input[placeholder="Password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should see error message
    const errorMessage = page.locator('text=Invalid credentials');
    await expect(errorMessage).toBeVisible();
  });

  test('User is redirected to login when accessing protected routes', async ({ page }) => {
    await page.goto('/patients');
    await page.waitForURL('**/login');
    await expect(page.locator('text=Login')).toBeVisible();
  });

  test('User can logout', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="Username"]', 'doctor');
    await page.fill('input[placeholder="Password"]', 'doctor123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard');

    // Click logout button (typically in header/menu)
    await page.click('button[aria-label="Logout"]');

    await page.waitForURL('**/login');
    await expect(page.locator('text=Login')).toBeVisible();
  });

  test('Empty credentials show validation error', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');

    // Should see required field errors
    await expect(page.locator('text=Username is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });
});
