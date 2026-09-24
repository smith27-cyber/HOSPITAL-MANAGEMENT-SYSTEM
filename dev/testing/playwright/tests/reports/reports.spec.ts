import { test, expect } from '../../fixtures/coverage.fixture';
import { ACCOUNTS, loginAs } from '../../support/auth';

test('reports page renders', async ({ page }) => {
  await loginAs(page, ACCOUNTS.admin.username, ACCOUNTS.admin.password);
  await page.goto('/reports', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Reporting Period', exact: true })).toBeVisible();
});
