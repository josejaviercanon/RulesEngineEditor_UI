import { test as setup } from '@playwright/test';

setup('authenticate local session', async ({ page }) => {
  // 1. Navigate to your app domain
  await page.goto('http://localhost:5173');
  
  // 2. Inject your local development JWT token
  await page.evaluate(() => {
    const dummyToken = "YOUR_LOCAL_DEV_JWT_TOKEN"; 
    localStorage.setItem('token', dummyToken);
    // Add any other user profile items your React state expects:
    localStorage.setItem('user', JSON.stringify({ id: 1, roles: ['Admin'] }));
  });

  // 3. Save storage state to skip login step in other tests
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
