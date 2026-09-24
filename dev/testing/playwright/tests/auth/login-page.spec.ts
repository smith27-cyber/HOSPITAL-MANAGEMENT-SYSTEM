import { test, expect } from '../../fixtures/coverage.fixture';

test('login page renders', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator('#username')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});
