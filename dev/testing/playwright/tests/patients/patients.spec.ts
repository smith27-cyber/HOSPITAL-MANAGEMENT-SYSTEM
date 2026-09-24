import { test, expect } from '../../fixtures/coverage.fixture';
import { ACCOUNTS, loginAs } from '../../support/auth';

test.describe('patients', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ACCOUNTS.admin.username, ACCOUNTS.admin.password);
  });

  test('list page renders', async ({ page }) => {
    await page.goto('/patients', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Patients', exact: true })).toBeVisible();
  });

  test('register form renders with required fields', async ({ page }) => {
    await page.goto('/patients/register', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Register Patient', exact: true })).toBeVisible();
    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('#lastName')).toBeVisible();
  });
});
