import { test, expect } from '../../fixtures/coverage.fixture';
import { ACCOUNTS, login, getToken } from '../../support/auth';

test('logout clears the session and returning to a protected route redirects to /login', async ({ page }) => {
  await login(page, ACCOUNTS.admin.username, ACCOUNTS.admin.password);
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10000 });

  await page.locator('.logout-button').click();

  await expect(page).toHaveURL(/\/login$/);
  expect(await getToken(page)).toBeNull();

  // Back-navigation must not reveal stale authenticated content - the auth
  // guard re-runs on every navigation, including browser back/forward.
  await page.goBack();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator('.sidebar')).not.toBeVisible();
});
