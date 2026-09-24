import { test, expect } from '../../fixtures/coverage.fixture';
import { ACCOUNTS, loginAs } from '../../support/auth';

test('dashboard renders for an authenticated tenant user', async ({ page }) => {
  await loginAs(page, ACCOUNTS.admin.username, ACCOUNTS.admin.password);
  await page.goto('/dashboard', { waitUntil: 'networkidle' });

  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
});
