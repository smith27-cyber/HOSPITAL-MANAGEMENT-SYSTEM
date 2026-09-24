import { test, expect } from '../../fixtures/coverage.fixture';
import { ACCOUNTS, loginAs } from '../../support/auth';

test.describe('appointments', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ACCOUNTS.admin.username, ACCOUNTS.admin.password);
  });

  test('list page renders', async ({ page }) => {
    await page.goto('/appointments', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Appointments', exact: true })).toBeVisible();
  });

  test('waiting queue renders', async ({ page }) => {
    await page.goto('/appointments/queue', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Waiting Queue', exact: true })).toBeVisible();
  });

  test('register form renders', async ({ page }) => {
    await page.goto('/appointments/register', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Register Appointment', exact: true })).toBeVisible();
  });
});
