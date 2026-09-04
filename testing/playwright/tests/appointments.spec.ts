import { test, expect } from '@playwright/test';

test.describe('Appointment Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[placeholder="Username"]', 'reception');
    await page.fill('input[placeholder="Password"]', 'reception123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('Appointment list displays correctly', async ({ page }) => {
    await page.goto('/appointments');
    await page.waitForSelector('table tbody tr');

    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThan(0);

    // Check for appointment details
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Dr. John Smith')).toBeVisible();
  });

  test('Can schedule new appointment', async ({ page }) => {
    await page.goto('/appointments/register');

    // Select patient
    await page.selectOption('select[name="patient"]', '1');

    // Select doctor
    await page.selectOption('select[name="doctor"]', '1');

    // Set appointment date/time
    await page.fill('input[name="dateTime"]', '2026-09-15T10:00');

    // Add reason
    await page.fill('textarea[name="reason"]', 'Follow-up consultation');

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to appointments list
    await page.waitForURL('**/appointments');
    await expect(page.locator('text=Follow-up consultation')).toBeVisible();
  });

  test('Appointment scheduling validates conflict', async ({ page }) => {
    await page.goto('/appointments/register');

    // Try to schedule at conflicting time
    await page.selectOption('select[name="patient"]', '1');
    await page.selectOption('select[name="doctor"]', '1');
    await page.fill('input[name="dateTime"]', '2026-09-10T14:00'); // Existing appointment time

    await page.click('button[type="submit"]');

    // Should show conflict error
    const errorMessage = page.locator('text=Doctor not available');
    await expect(errorMessage).toBeVisible();
  });

  test('Can view appointment details', async ({ page }) => {
    await page.goto('/appointments');

    // Click on appointment
    await page.click('table tbody tr:first-child');

    // Should show appointment details
    await expect(page.locator('text=Scheduled')).toBeVisible();
  });

  test('Can update appointment status', async ({ page }) => {
    await page.goto('/appointments');

    // Click edit on first appointment
    await page.click('button[aria-label="Edit"]');

    // Change status
    await page.selectOption('select[name="status"]', 'completed');

    // Save
    await page.click('button[type="submit"]');

    // Should show updated status
    await expect(page.locator('text=completed')).toBeVisible();
  });

  test('Can cancel appointment', async ({ page }) => {
    await page.goto('/appointments');
    const initialCount = await page.locator('table tbody tr').count();

    // Click delete
    await page.click('button[aria-label="Cancel"]');

    // Confirm
    await page.click('button[aria-label="Confirm"]');

    // Appointment should be removed
    const finalCount = await page.locator('table tbody tr').count();
    expect(finalCount).toBeLessThan(initialCount);
  });

  test('Queue view shows appointments in order', async ({ page }) => {
    await page.goto('/appointments/queue');

    await page.waitForSelector('table tbody tr');

    // Queue should show scheduled appointments
    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThan(0);

    // Should show total waiting count
    await expect(page.locator('text=Total Waiting')).toBeVisible();
  });
});
