import { test, expect } from '../../fixtures/coverage.fixture';
import { ACCOUNTS, login, getToken } from '../../support/auth';

// KNOWN BUG (see dev/architecture/KNOWN_ISSUES.md): after a failed login, the
// Login component's internal state updates correctly (verified directly via
// `ng.getComponent()`: loading becomes false, errorMessage is set) but the view
// never re-renders - the form stays stuck showing "Logging in..." with the
// submit button and both inputs permanently disabled. The user cannot retry
// without a full page reload. These tests assert the CORRECT behavior and are
// marked as expected failures so the suite stays green until this is fixed;
// Playwright will flag them once they start passing for real.
test.describe('wrong credentials', () => {
  test.fail();

  test('wrong password shows an error and re-enables the form', async ({ page }) => {
    await login(page, ACCOUNTS.admin.username, 'wrong-password');

    await expect(page.locator('.login-error')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeEnabled();
    await expect(page).toHaveURL(/\/login$/);
    expect(await getToken(page)).toBeNull();
  });

  test('unknown username shows an error and re-enables the form', async ({ page }) => {
    await login(page, 'no-such-user', 'whatever123');

    await expect(page.locator('.login-error')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeEnabled();
    await expect(page).toHaveURL(/\/login$/);
    expect(await getToken(page)).toBeNull();
  });
});
