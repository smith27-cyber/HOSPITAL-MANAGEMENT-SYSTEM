import { test, expect } from '../../fixtures/coverage.fixture';
import { ACCOUNTS, loginAs } from '../../support/auth';

test.describe('admissions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ACCOUNTS.admin.username, ACCOUNTS.admin.password);
  });

  test('list page renders', async ({ page }) => {
    await page.goto('/admissions', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Admissions', exact: true })).toBeVisible();
  });

  test('register form renders', async ({ page }) => {
    await page.goto('/admissions/register', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Register Admission', exact: true })).toBeVisible();
    await expect(page.locator('#patient')).toBeVisible();
    await expect(page.locator('#admissionType')).toBeVisible();
  });
});
