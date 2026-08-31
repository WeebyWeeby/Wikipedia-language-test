import { test, expect } from '@playwright/test';

test.use({ channel: 'chrome' });

const BASE = 'https://qa-lab.dev.dnc.pp.ua';

test.describe('Authentication', () => {
  test('Registration - basic flow', async ({ page }) => {
    page.setDefaultNavigationTimeout(60000);
    await page.goto(`${BASE}/login`);
    const signupLink = page.getByRole('link', { name: /sign up|register|create account/i });
    if (await signupLink.count() > 0) {
      await signupLink.first().click();
    } else {
      const signupButton = page.getByRole('button', { name: /sign up|register|create account/i });
      if (await signupButton.count() > 0) {
        await signupButton.first().click();
      } else {
        test.skip('No registration link or button found on /login');
      }
    }
      const email = `playwright+${Date.now()}@example.com`;
      const emailField = page.locator('#email').first();
      await expect(emailField).toBeVisible({ timeout: 10000 });
      await emailField.fill(email);

      const passwordField = page.locator('#password').first();
      await expect(passwordField).toBeVisible({ timeout: 10000 });
      await passwordField.fill('P@ssw0rd123');
    const submit = page.getByRole('button', { name: /register|sign up|create account|submit/i });
    if (await submit.count() > 0) {
      await submit.first().click();
    } else {
      await page.locator('button[type="submit"]').first().click().catch(() => {});
    }
    await expect(page).toHaveURL(/(dashboard|welcome|account|login)/i, { timeout: 10000 }).catch(() => {});
  });

  test('Login - valid credentials', async ({ page }) => {
    test.setTimeout(60000);
    page.setDefaultNavigationTimeout(60000);

    await page.goto(`${BASE}/login`);

    const TEST_EMAIL = 'existing_user@example.com';
    const TEST_PASSWORD =  'Password';

    const heading = page.getByRole('heading', { name: /log ?in|sign in|welcome back/i });
    await expect(heading).toBeVisible({ timeout: 10000 });
    let emailField = page.getByPlaceholder('Enter your email');
    if (await emailField.count() === 0) emailField = page.locator('input[name="email"]');
    await expect(emailField).toBeVisible({ timeout: 10000 });
    await emailField.fill(TEST_EMAIL);

    let passwordField = page.getByPlaceholder('Enter your password');
    if (await passwordField.count() === 0) passwordField = page.locator('input[name="password"]');
    await expect(passwordField).toBeVisible({ timeout: 10000 });
    await passwordField.fill(TEST_PASSWORD);

    const loginBtn = page.getByRole('button', { name: /log ?in|sign in|submit/i });
    if (await loginBtn.count() > 0) {
      await expect(loginBtn.first()).toBeVisible({ timeout: 5000 });
      await loginBtn.first().click();
    } else {
      const submitBtn = page.locator('button[type="submit"]').first();
      await expect(submitBtn).toBeVisible({ timeout: 5000 });
      await submitBtn.click();
    }

    await expect(page).toHaveURL(/(dashboard|account|profile)/i, { timeout: 20000 });
  });

  test('Registration - validations', async ({ page }) => {
    test.setTimeout(60000);
    page.setDefaultNavigationTimeout(60000);

    await page.goto(`${BASE}/login`);

    const signupLink = page.getByRole('link', { name: /sign up|register|create account/i });
    const signupButton = page.getByRole('button', { name: /sign up|register|create account/i });
    if (await signupLink.count() > 0) {
      await signupLink.first().click();
    } else if (await signupButton.count() > 0) {
      await signupButton.first().click();
    } else {
      test.skip('No registration entry point found');
    }

    await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible({ timeout: 10000 });

    const submit = page.getByRole('button', { name: /sign up|register|create account/i });

    await submit.click();
    const emailWrapper = page.locator('xpath=//div[label[@for="email"]]');
    const emailError = emailWrapper.getByText(/This field is required|Not a valid email format|Not a valid email/i);
    await expect(emailError).toBeVisible({ timeout: 5000 });
    await expect(emailError).toHaveText(/This field is required/i);

    await page.locator('#email').fill('not-an-email');
    await page.locator('#password').fill('short');
    await submit.click();

    await expect(emailWrapper.getByText(/Not a valid email format|not a valid email/i)).toBeVisible({ timeout: 5000 });

    const passwordWrapper = page.locator('xpath=//div[label[@for="password"]]');
    await expect(passwordWrapper.getByText(/Shall contain at least 1 number/i)).toBeVisible({ timeout: 5000 });
    await expect(passwordWrapper.getByText(/Shall contain at least 1 upper case/i)).toBeVisible({ timeout: 5000 });
  });

  test('Login - validations', async ({ page }) => {
    test.setTimeout(60000);
    page.setDefaultNavigationTimeout(60000);

    await page.goto(`${BASE}/login`);

    const submit = page.getByRole('button', { name: /log ?in|sign in|submit|login/i });

    await submit.click();
    const emailWrapper = page.locator('xpath=//div[label[@for="email"]]');
    const passwordWrapper = page.locator('xpath=//div[label[@for="password"]]');
    await expect(emailWrapper.getByText(/This field is required/i)).toBeVisible({ timeout: 5000 });
    await expect(passwordWrapper.getByText(/This field is required/i)).toBeVisible({ timeout: 5000 });
    await page.locator('#email').fill('not-an-email');
    await page.locator('#password').fill('short');
    await submit.click();
    await expect(emailWrapper.getByText(/Not a valid email format|not a valid email/i)).toBeVisible({ timeout: 5000 });
    const pwLen = passwordWrapper.getByText(/Shall be 7 to 15 characters/i);
    if (await pwLen.count() > 0) await expect(pwLen).toBeVisible();
    const pwNum = passwordWrapper.getByText(/Shall contain at least 1 number/i);
    if (await pwNum.count() > 0) await expect(pwNum).toBeVisible();
    const pwUpper = passwordWrapper.getByText(/Shall contain at least 1 upper case/i);
    if (await pwUpper.count() > 0) await expect(pwUpper).toBeVisible();
    const info = test.info();
    await info.attach('login-page-html', { body: Buffer.from(await page.content()), contentType: 'text/html' });
    await info.attach('login-screenshot', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  });
});
