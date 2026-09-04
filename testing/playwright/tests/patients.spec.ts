import { test, expect } from '@playwright/test';

test.describe('Patient Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[placeholder="Username"]', 'doctor');
    await page.fill('input[placeholder="Password"]', 'doctor123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('Patient list displays correctly', async ({ page }) => {
    await page.goto('/patients');

    // Wait for table to load
    await page.waitForSelector('table tbody tr');

    // Check that patients are displayed
    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThan(0);

    // Check for expected patient names
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Jane Smith')).toBeVisible();
  });

  test('Can search and filter patients', async ({ page }) => {
    await page.goto('/patients');

    // Type in search box
    await page.fill('input[placeholder="Search patients"]', 'John');
    await page.waitForTimeout(500); // Wait for filter

    // Should show only John Doe
    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeLessThanOrEqual(2); // Only matching results
    await expect(page.locator('text=John Doe')).toBeVisible();
  });

  test('Can create new patient', async ({ page }) => {
    await page.goto('/patients/register');

    // Fill in patient form
    await page.fill('input[name="name"]', 'Test Patient');
    await page.fill('input[name="email"]', 'test.patient@example.com');
    await page.fill('input[name="phoneNumber"]', '+1234567890');
    await page.fill('input[name="dateOfBirth"]', '1995-05-15');
    await page.selectOption('select[name="gender"]', 'Male');
    await page.fill('input[name="address"]', '123 Test Street');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to patients list
    await page.waitForURL('**/patients');
    await expect(page.locator('text=Test Patient')).toBeVisible();
  });

  test('Patient creation validates required fields', async ({ page }) => {
    await page.goto('/patients/register');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
  });

  test('Can view patient profile', async ({ page }) => {
    await page.goto('/patients');

    // Click on a patient
    await page.click('text=John Doe');

    // Should show patient details
    await expect(page.locator('text=john.doe@example.com')).toBeVisible();
    await expect(page.locator('text=+1234567890')).toBeVisible();
    await expect(page.locator('text=Male')).toBeVisible();
  });

  test('Can edit patient information', async ({ page }) => {
    await page.goto('/patients/1');

    // Click edit button
    await page.click('button[aria-label="Edit Patient"]');

    // Modify patient info
    await page.fill('input[name="phoneNumber"]', '+9876543210');

    // Save changes
    await page.click('button[type="submit"]');

    // Should show updated info
    await expect(page.locator('text=+9876543210')).toBeVisible();
  });

  test('Can delete patient', async ({ page }) => {
    await page.goto('/patients');
    const initialCount = await page.locator('table tbody tr').count();

    // Click delete on first patient
    await page.click('button[aria-label="Delete"]');

    // Confirm deletion
    await page.click('button[aria-label="Confirm Delete"]');

    // Patient should be removed
    const finalCount = await page.locator('table tbody tr').count();
    expect(finalCount).toBeLessThan(initialCount);
  });
});
