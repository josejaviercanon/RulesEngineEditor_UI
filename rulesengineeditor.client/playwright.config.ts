import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Turned off for sequential local CRUD execution stability
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1, // Isolated run thread for dependable local backend validation
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    video: 'on',
  },

  projects: [
    // 1. Setup Project: Executes first to capture JWT token state
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    // 2. Main E2E Testing Project: Depends on 'setup' finishing successfully
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Tell Playwright to inject the pre-saved storage state
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
