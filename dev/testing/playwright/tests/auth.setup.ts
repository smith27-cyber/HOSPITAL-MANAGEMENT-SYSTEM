import { test as setup, expect } from '@playwright/test';
import {
  captureSession,
  DEV_LOGIN_IDENTITIES,
  PASSWORD_LOGIN_IDENTITIES,
} from '../fixtures/auth';

// =====================================================
// Runs once per full suite run (Playwright's `setup`
// project, see playwright.config.ts) and saves each
// identity's authenticated storageState to .auth/. See
// dev/planning/playwright/tasks/todo/task-0-4-decide-auth-reuse.md
// =====================================================

for (const username of DEV_LOGIN_IDENTITIES) {
  setup(`authenticate as ${username} (dev-login)`, async ({ page }) => {
    await page.goto('/login');

    if (username === 'thor') {
      await page.locator('.dev-login-thor').click();
    } else {
      await page.locator('.dev-login-testuser').selectOption(username);
    }

    await expect(page).toHaveURL(/\/dashboard/);

    await captureSession(page, username);
  });
}

for (const { username, password } of PASSWORD_LOGIN_IDENTITIES) {
  setup(`authenticate as ${username} (password)`, async ({ page }) => {
    await page.goto('/login');

    await page.fill('#username', username);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);

    await captureSession(page, username);
  });
}
