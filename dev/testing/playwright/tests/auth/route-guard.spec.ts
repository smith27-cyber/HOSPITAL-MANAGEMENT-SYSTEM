import { test, expect } from '../../fixtures/coverage.fixture';

test('navigating directly to a protected route while unauthenticated redirects to /login', async ({ page }) => {
  await page.goto('/dashboard', { waitUntil: 'networkidle' });

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator('#username')).toBeVisible();
});

test('navigating directly to a nested protected route while unauthenticated redirects to /login', async ({ page }) => {
  await page.goto('/patients', { waitUntil: 'networkidle' });

  await expect(page).toHaveURL(/\/login$/);
});

// authGuard (core/guards/auth.guard.ts) redirects to a fixed '/login' with no
// returnUrl/redirect query param captured - there is no "go back to where you
// were going" behavior to test here, unlike some route guards. Confirming the
// absence rather than assuming it, per task-1-6's own instruction.
test('the redirect does not carry a return-to-original-page query param', async ({ page }) => {
  await page.goto('/patients', { waitUntil: 'networkidle' });

  await expect(page).toHaveURL(/\/login$/);
  expect(new URL(page.url()).search).toBe('');
});
