import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';
const testUser = {
  email: 'admin@localhost.local',
  password: 'Admin@123456'
};

setup('authenticate', async ({ page }) => {
  // Navigate to root and let the app handle auth routing
  await page.goto('/');

  // Wait for either the login form or the editor to appear
  const loginEmail = page.locator('input[type="email"]');
  const editorPane = page.locator('[data-testid="rules-editor-pane"]');

  // Wait up to 15s for one of them to be visible
  await expect(loginEmail.or(editorPane)).toBeVisible({ timeout: 15000 });

  // If we're on the login page, perform manual login
  if (await loginEmail.isVisible().catch(() => false)) {
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Wait for navigation to the editor
    await expect(editorPane).toBeVisible({ timeout: 15000 });
  }

  // Verify we are on the editor
  await expect(editorPane).toBeVisible();

  // Save authentication state
  await page.context().storageState({ path: authFile });
});
