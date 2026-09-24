import { test, expect } from '../../fixtures/coverage.fixture';
import { ACCOUNTS, loginAs } from '../../support/auth';

test('consultations list page renders', async ({ page }) => {
  await loginAs(page, ACCOUNTS.admin.username, ACCOUNTS.admin.password);
  await page.goto('/consultations', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Consultations', exact: true })).toBeVisible();
});
