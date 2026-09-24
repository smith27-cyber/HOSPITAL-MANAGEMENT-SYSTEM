import { test, expect } from '../../fixtures/coverage.fixture';
import { ACCOUNTS, loginAs } from '../../support/auth';

test.describe('billing', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ACCOUNTS.admin.username, ACCOUNTS.admin.password);
  });

  test('list page renders', async ({ page }) => {
    await page.goto('/billing', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Billing', exact: true })).toBeVisible();
  });

  test('create billing record form renders', async ({ page }) => {
    await page.goto('/billing/register', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Create Billing Record', exact: true })).toBeVisible();
  });

  test('receipts page renders', async ({ page }) => {
    await page.goto('/billing/receipts', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Payment Receipts', exact: true })).toBeVisible();
  });
});
