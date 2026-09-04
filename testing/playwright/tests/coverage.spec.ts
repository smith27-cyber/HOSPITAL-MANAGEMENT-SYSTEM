/**
 * Coverage Collection Example Tests
 * Demonstrates how to collect line-by-line coverage data
 */

import { coverageTest as test, expect } from '../fixtures/coverage';

test.describe('Coverage Instrumentation', () => {
  test('collect coverage for auth flow', async ({ page, coverage }) => {
    // Login flow to measure coverage of auth module
    await page.goto('/login');
    await page.fill('input[placeholder="Username"]', 'doctor');
    await page.fill('input[placeholder="Password"]', 'doctor123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // Collect coverage data
    const result = await coverage.collect('auth-login-flow');
    console.log(`Coverage collected: ${result.js} JS files, ${result.css} CSS files`);
  });

  test('collect coverage for patient list', async ({ page, coverage }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[placeholder="Username"]', 'doctor');
    await page.fill('input[placeholder="Password"]', 'doctor123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Patient list flow
    await page.goto('/patients');
    await page.waitForSelector('table tbody tr');
    await expect(page.locator('table tbody tr')).toBeTruthy();

    // Collect coverage
    const result = await coverage.collect('patient-list-flow');
    console.log(`Coverage collected: ${result.js} JS files, ${result.css} CSS files`);
  });

  test('collect coverage for patient creation', async ({ page, coverage }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[placeholder="Username"]', 'doctor');
    await page.fill('input[placeholder="Password"]', 'doctor123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Create patient
    await page.goto('/patients/register');
    await page.fill('input[name="name"]', 'Coverage Test Patient');
    await page.fill('input[name="email"]', 'coverage@test.com');
    await page.fill('input[name="phoneNumber"]', '+1234567890');
    await page.fill('input[name="dateOfBirth"]', '1995-05-15');
    await page.selectOption('select[name="gender"]', 'Male');
    await page.fill('input[name="address"]', '123 Test St');

    await page.click('button[type="submit"]');
    await page.waitForURL('**/patients');

    // Collect coverage
    const result = await coverage.collect('patient-creation-flow');
    console.log(`Coverage collected: ${result.js} JS files, ${result.css} CSS files`);
  });

  test('collect coverage for appointments', async ({ page, coverage }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[placeholder="Username"]', 'reception');
    await page.fill('input[placeholder="Password"]', 'reception123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Appointments flow
    await page.goto('/appointments');
    await page.waitForSelector('table tbody tr');

    // View queue
    await page.goto('/appointments/queue');
    await page.waitForSelector('table tbody tr', { timeout: 5000 }).catch(() => {});

    // Collect coverage
    const result = await coverage.collect('appointments-flow');
    console.log(`Coverage collected: ${result.js} JS files, ${result.css} CSS files`);
  });

  test('collect coverage for billing', async ({ page, coverage }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[placeholder="Username"]', 'reception');
    await page.fill('input[placeholder="Password"]', 'reception123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Billing flow
    await page.goto('/billing');
    await page.waitForSelector('table tbody tr');

    // Try to view invoice
    await page.click('table tbody tr:first-child').catch(() => {});

    // Collect coverage
    const result = await coverage.collect('billing-flow');
    console.log(`Coverage collected: ${result.js} JS files, ${result.css} CSS files`);
  });
});
