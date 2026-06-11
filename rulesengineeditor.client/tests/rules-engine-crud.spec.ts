import { test, expect } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('RulesEngine Workflow CRUD Operations', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/workflows');
  });

  test('should create, read, update, and delete a workflow', async ({ page }) => {
    // CREATE
    await page.getByTestId('btn-create-workflow').click();
    await page.getByTestId('input-workflow-name').fill('Local Test Workflow');
    await page.getByTestId('btn-save-workflow').click();
    await expect(page.getByTestId('workflow-list')).toContainText('Local Test Workflow');

    // READ
    await page.getByText('Local Test Workflow').click();
    await expect(page.getByTestId('workflow-title')).toHaveText('Local Test Workflow');

    // UPDATE
    await page.getByTestId('btn-edit-rules').click();
    // Simulate drag-drop or rule property addition
    await page.getByTestId('input-rule-description').fill('Updated rule criteria');
    await page.getByTestId('btn-save-changes').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Saved successfully');

    // DELETE
    await page.getByTestId('btn-delete-workflow').click();
    await page.getByTestId('btn-confirm-delete').click();
    await expect(page.getByText('Local Test Workflow')).not.toBeVisible();
  });
});
