import { test, expect } from '../../fixtures/coverage.fixture';
import { ACCOUNTS, loginAs } from '../../support/auth';

test.describe('laboratory', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ACCOUNTS.admin.username, ACCOUNTS.admin.password);
  });

  test('test catalogue list page renders', async ({ page }) => {
    await page.goto('/laboratory', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Laboratory', exact: true })).toBeVisible();
  });

  test('register test form renders', async ({ page }) => {
    await page.goto('/laboratory/register', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Register Laboratory Test', exact: true })).toBeVisible();
  });

  test('requests list page renders', async ({ page }) => {
    await page.goto('/laboratory/requests', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Laboratory Requests', exact: true })).toBeVisible();
  });
});
