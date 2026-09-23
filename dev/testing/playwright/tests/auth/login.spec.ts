import { test, expect } from '@playwright/test';

// =====================================================
// task-1-1 — login with valid credentials
// =====================================================

test('login with valid credentials redirects to dashboard and stores the session', async ({ page }) => {
  await page.goto('/login');

  await page.fill('#username', 'admin');
  await page.fill('#password', 'admin123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/\/dashboard$/);

  // SECURITY.md documents localStorage; the actual code (AuthService)
  // uses sessionStorage — confirmed live, doc fixed to match.
  const token = await page.evaluate(() => sessionStorage.getItem('hms_token'));
  expect(token).toBeTruthy();

  const user = await page.evaluate(() => sessionStorage.getItem('hms_user'));
  expect(user).toBeTruthy();

  await expect(page.locator('.sidebar-nav .nav-item').first()).toBeVisible();
});

// =====================================================
// task-1-2 — login with invalid credentials
// =====================================================

test('login with wrong password shows an error and does not authenticate', async ({ page }) => {
  await page.goto('/login');

  await page.fill('#username', 'admin');
  await page.fill('#password', 'not-the-real-password');
  await page.click('button[type="submit"]');

  await expect(page.locator('.login-error')).toBeVisible();

  // Backend returns 403 here, not 401 — AuthService.login() throws a
  // generic RuntimeException for bad credentials, and with no global
  // exception handler (KNOWN_ISSUES.md P1, task-9-5), Spring Security's
  // default handler turns that into 403. The frontend's 403 branch
  // shows "Access denied..." — misleading for a simple wrong password,
  // but this is the real, current behavior, not what it should say.
  await expect(page.locator('.login-error')).toContainText('Access denied');

  await expect(page).toHaveURL(/\/login$/);

  const token = await page.evaluate(() => sessionStorage.getItem('hms_token'));
  expect(token).toBeNull();
});

// =====================================================
// task-1-3 — login with empty/malformed input
// =====================================================

test('login button stays disabled until both fields are filled', async ({ page }) => {
  await page.goto('/login');

  const submit = page.locator('button[type="submit"]');

  // Both empty.
  await expect(submit).toBeDisabled();

  // Username only.
  await page.fill('#username', 'admin');
  await expect(submit).toBeDisabled();

  // Both filled — now enabled. No network call has happened yet;
  // this is purely template-driven form validation (required attrs +
  // loginForm.invalid), confirmed by the button state, not assumed.
  await page.fill('#password', 'admin123');
  await expect(submit).toBeEnabled();

  // Clearing one re-disables it.
  await page.fill('#password', '');
  await expect(submit).toBeDisabled();
});

// =====================================================
// task-1-4 — logout
// =====================================================

test('logout clears the session, redirects to login, and back-navigation does not show stale content', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'admin123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.click('.logout-button');

  await expect(page).toHaveURL(/\/login$/);

  const token = await page.evaluate(() => sessionStorage.getItem('hms_token'));
  expect(token).toBeNull();

  // logout() uses router.navigate(['/login'], { replaceUrl: true }),
  // so the dashboard entry is replaced, not just covered — going back
  // should not land on an authenticated-looking page.
  await page.goBack();
  await expect(page).toHaveURL(/\/login$/);
});

// =====================================================
// task-1-5 — route guard blocks unauthenticated access
// =====================================================

test('navigating directly to a protected route while unauthenticated redirects to login', async ({ page }) => {
  await page.goto('/patients');

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator('#username')).toBeVisible();
});

// =====================================================
// task-1-6 — route guard redirect target
// =====================================================

test('the auth guard redirects to a plain /login, not a returnUrl-preserving one', async ({ page }) => {
  // authGuard (auth.guard.ts) always returns router.createUrlTree(['/login'])
  // with no query params — confirmed from source, not assumed. This test
  // pins that actual behavior so a future change to add return-url support
  // is a deliberate, visible change to this test, not a silent regression.
  await page.goto('/patients');

  await expect(page).toHaveURL('http://localhost:4200/login');
});
