import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('app loads and collects code coverage', async ({ page }) => {
  // Disable network interception to ensure scripts load
  await page.goto('/', { waitUntil: 'networkidle' });

  // Verify app loaded
  await expect(page.locator('#username')).toBeVisible({ timeout: 5000 });
  console.log('✅ App loaded successfully');

  // Wait for coverage data to accumulate
  await page.waitForTimeout(500);

  // Collect coverage from window.__coverage__ (populated by Istanbul instrumenter)
  const coverage = await page.evaluate(() => {
    const cov = (window as any).__coverage__;
    if (!cov) {
      console.warn('No coverage data in window.__coverage__');
      return null;
    }
    return cov;
  });

  if (coverage && Object.keys(coverage).length > 0) {
    const dir = path.join(__dirname, '../.nyc_output');
    fs.mkdirSync(dir, { recursive: true });

    const filename = path.join(dir, `coverage-${Date.now()}.json`);
    fs.writeFileSync(filename, JSON.stringify(coverage, null, 2));

    const fileCount = Object.keys(coverage).length;
    console.log(`✅ Coverage collected: ${fileCount} files instrumented`);
  } else {
    console.warn('⚠️  No coverage data collected. Check if server is instrumenting files.');
  }
});
