import { test, expect } from '@playwright/test';

test.describe('Billing Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[placeholder="Username"]', 'reception');
    await page.fill('input[placeholder="Password"]', 'reception123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('Billing list displays invoices', async ({ page }) => {
    await page.goto('/billing');
    await page.waitForSelector('table tbody tr');

    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThan(0);

    // Check for invoice details
    await expect(page.locator('text=INV-')).toBeVisible();
  });

  test('Can create new invoice', async ({ page }) => {
    await page.goto('/billing/register');

    // Select patient
    await page.selectOption('select[name="patient"]', '1');

    // Select consultation
    await page.selectOption('select[name="consultation"]', '1');

    // Add billing items
    await page.click('button[text="Add Item"]');

    // Fill item details
    await page.fill('input[name="items[0].description"]', 'Consultation Fee');
    await page.fill('input[name="items[0].amount"]', '50');

    // Add another item
    await page.click('button[text="Add Item"]');
    await page.fill('input[name="items[1].description"]', 'Lab Tests');
    await page.fill('input[name="items[1].amount"]', '150');

    // Add discount
    await page.fill('input[name="discount"]', '10');

    // Set tax rate
    await page.fill('input[name="taxRate"]', '0.10');

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to billing list
    await page.waitForURL('**/billing');
  });

  test('Invoice calculation is correct', async ({ page }) => {
    await page.goto('/billing/register');

    // Select patient
    await page.selectOption('select[name="patient"]', '1');

    // Add items
    await page.click('button[text="Add Item"]');
    await page.fill('input[name="items[0].description"]', 'Service');
    await page.fill('input[name="items[0].amount"]', '100');

    // Add discount
    await page.fill('input[name="discount"]', '10');

    // Set tax rate
    await page.fill('input[name="taxRate"]', '0.10');

    // Check calculated total
    // Subtotal: 100, Discount: 10, Tax: (100-10)*0.10 = 9, Total: 100-10+9 = 99
    const total = page.locator('text=Total: 99');
    await expect(total).toBeVisible();
  });

  test('Can view invoice details', async ({ page }) => {
    await page.goto('/billing');

    // Click on invoice
    await page.click('table tbody tr:first-child');

    // Should show invoice details
    await expect(page.locator('text=Items')).toBeVisible();
    await expect(page.locator('text=Total')).toBeVisible();
    await expect(page.locator('text=Payment Status')).toBeVisible();
  });

  test('Can record payment', async ({ page }) => {
    await page.goto('/billing');

    // Click on pending invoice
    const pendingInvoice = page.locator('text=pending').first();
    const row = pendingInvoice.locator('..');
    await row.click();

    // Click record payment button
    await page.click('button[text="Record Payment"]');

    // Enter payment amount
    await page.fill('input[name="amount"]', '220');

    // Select payment method
    await page.selectOption('select[name="paymentMethod"]', 'credit_card');

    // Submit payment
    await page.click('button[type="submit"]');

    // Should show updated status
    await expect(page.locator('text=Payment recorded')).toBeVisible();
  });

  test('Can generate invoice receipt', async ({ page }) => {
    await page.goto('/billing');

    // Click on invoice
    await page.click('table tbody tr:first-child');

    // Click print/download button
    const downloadPromise = page.waitForEvent('popup');
    await page.click('button[text="Print"]');

    // Should open or generate receipt
    const newPage = await downloadPromise;
    expect(newPage).toBeDefined();
  });

  test('Billing list can be filtered', async ({ page }) => {
    await page.goto('/billing');

    // Filter by status
    await page.selectOption('select[name="status"]', 'paid');

    // Should show only paid invoices
    await expect(page.locator('text=paid')).toBeVisible();
  });

  test('Cannot create invoice with missing fields', async ({ page }) => {
    await page.goto('/billing/register');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=Patient is required')).toBeVisible();
  });
});
