import { test, expect } from '../../fixtures/coverage.fixture';
import { ACCOUNTS, loginAs } from '../../support/auth';

test.describe('departments', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ACCOUNTS.admin.username, ACCOUNTS.admin.password);
  });

  test('list page renders', async ({ page }) => {
    await page.goto('/departments', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Departments', exact: true })).toBeVisible();
  });

  test('register form renders', async ({ page }) => {
    await page.goto('/departments/register', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Register Department', exact: true })).toBeVisible();
  });
});
