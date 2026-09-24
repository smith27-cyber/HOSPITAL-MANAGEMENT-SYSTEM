import { test, expect } from '../../fixtures/coverage.fixture';
import { ACCOUNTS, loginAs } from '../../support/auth';

test.describe('pharmacy', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ACCOUNTS.admin.username, ACCOUNTS.admin.password);
  });

  test('queue page renders', async ({ page }) => {
    await page.goto('/pharmacy/queue', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Pharmacy Queue', exact: true })).toBeVisible();
  });

  test('stock page renders', async ({ page }) => {
    await page.goto('/pharmacy/stock', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Stock Management', exact: true })).toBeVisible();
  });
});
