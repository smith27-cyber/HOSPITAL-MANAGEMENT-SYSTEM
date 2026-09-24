import { test, expect } from '../../fixtures/coverage.fixture';
import { ACCOUNTS, loginAs } from '../../support/auth';

test.describe('doctors', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ACCOUNTS.admin.username, ACCOUNTS.admin.password);
  });

  test('list page renders', async ({ page }) => {
    await page.goto('/doctors', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Doctors', exact: true })).toBeVisible();
  });

  test('register form renders', async ({ page }) => {
    await page.goto('/doctors/register', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Register Doctor', exact: true })).toBeVisible();
  });
});
