import { test, expect } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('RulesEngine Scenario Management & Dry Runs', () => {

  test('should handle scenario CRUD and trigger dry run simulation', async ({ page }) => {
    await page.goto('http://localhost:5173/workflows/default-id');

    // Create Scenario
    await page.getByTestId('btn-add-scenario').click();
    await page.getByTestId('input-scenario-name').fill('High Risk Transaction');
    await page.getByTestId('textarea-mock-payload').fill(JSON.stringify({ amount: 5000, country: 'US' }, null, 2));
    await page.getByTestId('btn-save-scenario').click();

    // Trigger Dry Run
    await page.getByTestId('btn-select-scenario').selectOption({ label: 'High Risk Transaction' });
    await page.getByTestId('btn-execute-dryrun').click();

    // Validate execution output response from the running backend
    const outputPanel = page.getByTestId('dryrun-output-panel');
    await expect(outputPanel).toBeVisible();
    await expect(outputPanel).toContainText('"result": "approved"'); 
  });
});
