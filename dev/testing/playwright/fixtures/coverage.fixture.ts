import { test as base } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const RAW_DIR = path.resolve(process.cwd(), '.temp-v8-coverage');

export const test = base.extend<{}>({
  page: async ({ page }, use) => {
    const isChromium = page.context().browser()?.browserType().name() === 'chromium';

    if (isChromium) {
      await Promise.all([
        page.coverage.startJSCoverage({ resetOnNavigation: false }),
        page.coverage.startCSSCoverage({ resetOnNavigation: false }),
      ]);
    }

    await use(page);

    if (isChromium) {
      try {
        await page.waitForTimeout(500);

        const [jsCoverage, cssCoverage] = await Promise.all([
          page.coverage.stopJSCoverage(),
          page.coverage.stopCSSCoverage(),
        ]);

        const validJs = Array.isArray(jsCoverage) ? jsCoverage : [];
        const validCss = Array.isArray(cssCoverage) ? cssCoverage : [];
        const combinedCoverage = [...validJs, ...validCss];

        if (combinedCoverage.length > 0) {
          fs.mkdirSync(RAW_DIR, { recursive: true });
          const filename = path.join(RAW_DIR, `coverage-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
          fs.writeFileSync(filename, JSON.stringify(combinedCoverage, null, 2));
        }
      } catch (coverageError) {
        console.warn('⚠️ Coverage collection warning:', (coverageError as Error).message);
      }
    }
  },
});

export { expect } from '@playwright/test';
