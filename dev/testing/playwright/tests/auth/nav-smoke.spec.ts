import { test, expect } from '@playwright/test';
import { restoreSession, DEV_LOGIN_IDENTITIES } from '../../fixtures/auth';

// =====================================================
// task-1-7 — nav menu renders per role (smoke-level only)
//
// Confirms the nav renders *something* per role, and every
// visible link navigates to a real page — not a 404, not a
// silent bounce back to /login. The detailed per-permission
// comparison across roles is Phase 9's job, not this one.
// =====================================================

for (const identity of DEV_LOGIN_IDENTITIES) {

  test(`nav renders and every visible link works for ${identity}`, async ({ context, page }) => {

    await restoreSession(context, identity);
    await page.goto('/dashboard');

    // Should actually be on the dashboard, not bounced to
    // login by a broken/expired session.
    await expect(page).toHaveURL(/\/dashboard$/);

    const navItems = page.locator('.sidebar-nav .nav-item');

    // .count() doesn't auto-retry like toBeVisible() does — without
    // this, count() can race the sidebar's render and see 0 items
    // that show up a moment later (confirmed via screenshot: the nav
    // was fully rendered, this was a test timing bug, not an app one).
    await expect(navItems.first()).toBeVisible();

    const count = await navItems.count();
    expect(count).toBeGreaterThan(0);

    const hrefs = await navItems.evaluateAll(
      (elements) => elements.map((el) => (el as HTMLAnchorElement).getAttribute('href'))
    );

    for (const href of hrefs) {

      if (!href) continue;

      await page.goto(href);

      // A broken/unreachable route in this app redirects to
      // /login (unknown-route fallback) — a visible nav link
      // that leads back to login is exactly the "no 404s, no
      // blank routes" failure this test exists to catch.
      await expect(page).not.toHaveURL(/\/login$/);

      await expect(page.locator('body')).not.toBeEmpty();
    }
  });
}
