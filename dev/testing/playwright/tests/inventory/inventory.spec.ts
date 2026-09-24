import { test, expect } from '../../fixtures/coverage.fixture';
import { ACCOUNTS, loginAs } from '../../support/auth';

test.describe('inventory', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ACCOUNTS.admin.username, ACCOUNTS.admin.password);
  });

  test('list page renders', async ({ page }) => {
    await page.goto('/inventory', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Inventory', exact: true })).toBeVisible();
  });

  test('register form renders', async ({ page }) => {
    await page.goto('/inventory/register', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Register Inventory Item', exact: true })).toBeVisible();
    await expect(page.locator('#itemName')).toBeVisible();
  });
});
