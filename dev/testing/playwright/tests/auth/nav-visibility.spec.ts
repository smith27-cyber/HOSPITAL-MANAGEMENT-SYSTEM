import { test, expect } from '../../fixtures/coverage.fixture';
import { ACCOUNTS, login } from '../../support/auth';

// KNOWN BUG (see dev/architecture/KNOWN_ISSUES.md): TenantModuleService hardcodes
// an absolute `http://localhost:8081/api/tenant/modules` URL instead of a
// relative `/api/...` path. hms-jar has no CORS policy at all (removed
// deliberately - the browser is only ever meant to reach it same-origin via
// ng serve's dev proxy or hms-webb's forward controller), so this direct
// cross-origin call is blocked by the browser and always fails. Every nav item
// is gated on hasModule(...), which is always false once module loading fails -
// the result is a completely empty sidebar for every user, verified directly via
// the browser's own CORS error. Marked as an expected failure so the suite
// stays green until this is fixed.
test.describe('nav visibility', () => {
  test.fail();

  // Smoke-level only: confirm the nav renders and a visible link actually
  // navigates somewhere real. Per-role/per-permission comparison across roles
  // belongs in a future RBAC-focused suite, not duplicated here.
  test('nav renders after login and a visible link navigates to a real page', async ({ page }) => {
    await login(page, ACCOUNTS.admin.username, ACCOUNTS.admin.password);
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10000 });

    const patientsLink = page.locator('.nav-item[routerLink="/patients"]');
    await expect(patientsLink).toBeVisible();

    await patientsLink.click();

    await expect(page).toHaveURL(/\/patients$/);
    await expect(page.locator('.sidebar')).toBeVisible();
  });
});
