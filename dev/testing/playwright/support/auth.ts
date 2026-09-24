import type { Page } from '@playwright/test';

export const ACCOUNTS = {
  admin: { username: 'admin', password: 'admin123', role: 'ADMIN' },
  superadmin: { username: 'superadmin', password: 'superadmin123', role: 'SUPER_ADMIN' },
  doctor: { username: 'test_doctor', password: 'doctor123', role: 'DOCTOR' },
} as const;

export async function fillLoginForm(page: Page, username: string, password: string) {
  await page.locator('#username').fill(username);
  await page.locator('#password').fill(password);
}

export async function login(page: Page, username: string, password: string) {
  await page.goto('/login', { waitUntil: 'networkidle' });
  await fillLoginForm(page, username, password);
  await page.getByRole('button', { name: 'Login' }).click();
}

// Faster than driving the real login form for tests whose concern is a
// downstream page, not login itself: gets a real token from the real backend
// (not fabricated), then seeds it into sessionStorage directly so authGuard/
// permissionGuard see a genuinely authenticated session on first navigation.
export async function loginAs(page: Page, username: string, password: string) {
  const response = await page.request.post('/api/auth/login', {
    data: { username, password },
  });
  const body = await response.json();

  await page.goto('/login');
  await page.evaluate(
    ([token, user]) => {
      sessionStorage.setItem('hms_token', token as string);
      sessionStorage.setItem('hms_user', JSON.stringify(user));
    },
    [
      body.token,
      {
        username: body.username,
        fullName: body.fullName,
        role: body.role,
        roles: body.roles ?? [],
        permissions: body.permissions ?? [],
      },
    ] as const
  );
}

export function getToken(page: Page) {
  return page.evaluate(() => sessionStorage.getItem('hms_token'));
}

export function getStoredUser(page: Page) {
  return page.evaluate(() => {
    const raw = sessionStorage.getItem('hms_user');
    return raw ? JSON.parse(raw) : null;
  });
}
