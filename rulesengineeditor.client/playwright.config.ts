import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for RulesEngineEditor E2E testing.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'on-failure' }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:65426',
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'on-first-retry'
  },

  projects: [
    {
      name: 'setup',
      testMatch: '**/*.setup.ts'
    },
    {
      name: 'e2e',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json'
      }
    }
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:65426',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});
