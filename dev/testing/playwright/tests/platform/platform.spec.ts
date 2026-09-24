import { test, expect } from '../../fixtures/coverage.fixture';
import { ACCOUNTS, loginAs } from '../../support/auth';

// KNOWN BUG (see dev/architecture/KNOWN_ISSUES.md, "SUPER_ADMIN's PLATFORM_*
// permissions silently disappeared..."): every route under /platform requires
// a PLATFORM_* permission, and superadmin's account currently has none in the
// database. All of these are expected to fail until that's fixed.
test.describe('platform administration', () => {
  test.fail();

  test.beforeEach(async ({ page }) => {
    await loginAs(page, ACCOUNTS.superadmin.username, ACCOUNTS.superadmin.password);
  });

  test('platform dashboard renders', async ({ page }) => {
    await page.goto('/platform/dashboard', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Platform Dashboard', exact: true })).toBeVisible();
  });

  test('tenants list page renders', async ({ page }) => {
    await page.goto('/platform/tenants', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Tenants', exact: true })).toBeVisible();
  });

  test('create tenant form renders', async ({ page }) => {
    await page.goto('/platform/tenants/create', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Create Tenant', exact: true })).toBeVisible();
  });

  test('platform users page renders', async ({ page }) => {
    await page.goto('/platform/users', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Users', exact: true })).toBeVisible();
  });

  test('plans page renders', async ({ page }) => {
    await page.goto('/platform/plans', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Plans', exact: true })).toBeVisible();
  });

  test('subscriptions page renders', async ({ page }) => {
    await page.goto('/platform/subscriptions', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Subscriptions', exact: true })).toBeVisible();
  });

  test('modules page renders', async ({ page }) => {
    await page.goto('/platform/modules', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Modules', exact: true })).toBeVisible();
  });
});
