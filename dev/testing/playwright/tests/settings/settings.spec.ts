import { test, expect } from '../../fixtures/coverage.fixture';
import { ACCOUNTS, loginAs } from '../../support/auth';

test.describe('settings', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ACCOUNTS.admin.username, ACCOUNTS.admin.password);
  });

  test('settings landing page renders', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
  });

  test('hospital settings page renders', async ({ page }) => {
    await page.goto('/settings/hospital', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Tenant Information', exact: true })).toBeVisible();
  });

  test('system preferences page renders', async ({ page }) => {
    await page.goto('/settings/system', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'System Preferences', exact: true })).toBeVisible();
  });

  test('notification settings page renders', async ({ page }) => {
    await page.goto('/settings/notifications', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Notification Settings', exact: true })).toBeVisible();
  });

  test('user management page renders', async ({ page }) => {
    await page.goto('/settings/users', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'User Management', exact: true })).toBeVisible();
  });

  test('profile settings page renders', async ({ page }) => {
    await page.goto('/settings/profile', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Profile Settings', exact: true })).toBeVisible();
  });
});
