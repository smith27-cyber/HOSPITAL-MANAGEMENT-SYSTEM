import * as fs from 'fs';
import * as path from 'path';
import { BrowserContext, Page } from '@playwright/test';

// =====================================================
// The 9 dev-login identities (thor + one *-testuser per
// RBAC role) and the 1 password-login identity (admin,
// which has no dev-login account). See
// dev/planning/playwright/tasks/todo/task-0-4-decide-auth-reuse.md
// =====================================================

export const DEV_LOGIN_IDENTITIES = [
  'thor',
  'doc-testuser',
  'nurse-testuser',
  'rec-testuser',
  'pharm-testuser',
  'lab-testuser',
  'acct-testuser',
  'records-testuser',
  'mgr-testuser',
] as const;

export const PASSWORD_LOGIN_IDENTITIES = [
  { username: 'admin', password: 'admin123' },
] as const;

// =====================================================
// The app keeps its session (`hms_token`, `hms_user`) in
// sessionStorage (see AuthService), not cookies or
// localStorage — so Playwright's built-in
// `context.storageState()` can't capture or restore it at
// all (verified live: storageState() produces an empty
// {cookies: [], origins: []} for this app). These two
// functions are the sessionStorage-specific replacement.
// =====================================================

function sessionFile(identity: string): string {
  return path.join(__dirname, '..', '.auth', `${identity}.json`);
}

export async function captureSession(
  page: Page,
  identity: string
): Promise<void> {

  const raw = await page.evaluate(
    () => JSON.stringify(sessionStorage)
  );

  const file = sessionFile(identity);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, raw);
}

export async function restoreSession(
  context: BrowserContext,
  identity: string
): Promise<void> {

  const raw = fs.readFileSync(sessionFile(identity), 'utf-8');
  const entries: Record<string, string> = JSON.parse(raw);

  // Must run before any of the app's own scripts, so
  // AuthService already finds a token in sessionStorage
  // when it checks on page load.

  await context.addInitScript((data) => {
    for (const [key, value] of Object.entries(data)) {
      window.sessionStorage.setItem(key, value);
    }
  }, entries);
}
