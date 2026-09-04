import { test, expect } from '@playwright/test';

test('load login page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#username')).toBeVisible();
});
