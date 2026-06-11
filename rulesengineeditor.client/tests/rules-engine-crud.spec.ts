import { test, expect } from '@playwright/test';

function uniqueName(base: string) {
  return `${base} ${Date.now()}`;
}

test.describe('Rules Engine Workflow CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="rules-editor-pane"]')).toBeVisible();
  });

  test('create a new workflow', async ({ page }) => {
    const workflowName = uniqueName('E2E Test Workflow');

    page.on('dialog', dialog => {
      if (dialog.type() === 'prompt') {
        dialog.accept(workflowName);
      } else {
        dialog.accept();
      }
    });

    await page.click('[data-testid="new-workflow-btn"]');
    await expect(page.locator(`text=${workflowName}`)).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="rules-editor-pane"]')).toBeVisible();
  });

  test('update workflow rules', async ({ page }) => {
    const workflowName = uniqueName('E2E Update Workflow');

    page.on('dialog', dialog => {
      if (dialog.type() === 'prompt') {
        dialog.accept(workflowName);
      } else {
        dialog.accept();
      }
    });

    await page.click('[data-testid="new-workflow-btn"]');
    await expect(page.locator(`text=${workflowName}`)).toBeVisible({ timeout: 10000 });

    await page.click(`text=${workflowName}`);

    // Focus the Rules Editor and replace content with updated JSON
    await page.click('[data-testid="rules-editor-pane"]');
    await page.keyboard.press('Control+a');
    await page.keyboard.type(JSON.stringify([{ WorkflowName: 'Updated Workflow', Rules: [] }], null, 2));

    await page.click('[data-testid="save-workflow-btn"]');
    await expect(page.locator(`text=${workflowName}`)).toBeVisible();
  });

  test('delete a workflow', async ({ page }) => {
    const workflowName = uniqueName('E2E Delete Workflow');

    page.on('dialog', dialog => {
      if (dialog.type() === 'prompt') {
        dialog.accept(workflowName);
      } else if (dialog.type() === 'confirm') {
        dialog.accept();
      } else {
        dialog.accept();
      }
    });

    await page.click('[data-testid="new-workflow-btn"]');
    await expect(page.locator(`text=${workflowName}`)).toBeVisible({ timeout: 10000 });

    const workflowItem = page.locator(`text=${workflowName}`).locator('xpath=../..');
    await workflowItem.hover();
    await workflowItem.locator('[data-testid="delete-workflow-btn"]').click();

    await expect(page.locator(`text=${workflowName}`)).not.toBeVisible();
  });

  test('scenario CRUD inside a workflow', async ({ page }) => {
    const workflowName = uniqueName('E2E Scenario Workflow');
    const scenarioName = uniqueName('E2E Test Scenario');

    page.on('dialog', dialog => {
      if (dialog.type() === 'prompt') {
        const msg = dialog.message().toLowerCase();
        if (msg.includes('workflow')) {
          dialog.accept(workflowName);
        } else if (msg.includes('scenario')) {
          dialog.accept(scenarioName);
        } else if (msg.includes('expected output')) {
          dialog.accept('{}');
        } else {
          dialog.accept();
        }
      } else if (dialog.type() === 'confirm') {
        dialog.accept();
      } else {
        dialog.accept();
      }
    });

    await page.click('[data-testid="new-workflow-btn"]');
    await expect(page.locator(`text=${workflowName}`)).toBeVisible({ timeout: 10000 });

    await page.click(`text=${workflowName}`);
    await page.click('[data-testid="new-scenario-btn"]');
    await expect(page.locator(`text=${scenarioName}`)).toBeVisible({ timeout: 10000 });

    await page.click(`text=${scenarioName}`);
    await expect(page.locator('[data-testid="facts-editor-pane"]')).toBeVisible();

    const scenarioItem = page.locator(`text=${scenarioName}`).locator('xpath=../..');
    await scenarioItem.hover();
    await scenarioItem.locator('[data-testid="delete-scenario-btn"]').click();

    await expect(page.locator(`text=${scenarioName}`)).not.toBeVisible();
  });
});
