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

export function getToken(page: Page) {
  return page.evaluate(() => sessionStorage.getItem('hms_token'));
}

export function getStoredUser(page: Page) {
  return page.evaluate(() => {
    const raw = sessionStorage.getItem('hms_user');
    return raw ? JSON.parse(raw) : null;
  });
}
