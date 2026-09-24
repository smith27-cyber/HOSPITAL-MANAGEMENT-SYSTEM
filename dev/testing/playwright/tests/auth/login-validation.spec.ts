import { test, expect } from '../../fixtures/coverage.fixture';

test.describe('client-side input validation', () => {
  test('login button is disabled until both fields are filled', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    const submit = page.getByRole('button', { name: 'Login' });

    await expect(submit).toBeDisabled();

    await page.locator('#username').fill('someone');
    await expect(submit).toBeDisabled();

    await page.locator('#password').fill('secret');
    await expect(submit).toBeEnabled();
  });

  // login.ts's login() has its own manual "Please enter your username/password"
  // checks, but they're unreachable through the real UI: the submit button is
  // [disabled]="loading || loginForm.invalid", and per the HTML spec a form's
  // implicit submission (pressing Enter in a field) requires a non-disabled
  // submit control - so Enter is blocked exactly like a click would be.
  // Verified directly: login() never runs (component state's errorMessage stays
  // '') when submitting via Enter with a field empty. Confirming the absence
  // rather than assuming either way, per this task's own instruction.
  test('pressing Enter with an empty field does not submit the form', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });

    await page.locator('#username').fill('someone');
    await page.locator('#username').press('Enter');

    await expect(page.locator('.login-error')).not.toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
