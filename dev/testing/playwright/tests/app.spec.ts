import { test, expect } from '../fixtures/coverage.fixture';

test('app loads and collects code coverage', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  await expect(page.locator('#username')).toBeVisible({ timeout: 5000 });
  console.log('✅ App loaded successfully');
});
