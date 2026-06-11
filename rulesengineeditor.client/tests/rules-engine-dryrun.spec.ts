import { test, expect } from '@playwright/test';

function uniqueName(base: string) {
  return `${base} ${Date.now()}`;
}

test.describe('Rules Engine Dry-Run Execution', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="rules-editor-pane"]')).toBeVisible();
  });

  test('trigger dry-run and verify results', async ({ page }) => {
    const workflowName = uniqueName('E2E DryRun Workflow');

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

    // Click dry run using the default sample workflow
    await page.click('[data-testid="run-dryrun-btn"]');
    await expect(page.locator('[data-testid="results-viewer-pane"]')).toBeVisible();
    const resultsPane = page.locator('[data-testid="results-viewer-pane"]');
    await expect(resultsPane.locator('text=Overall Success')).toBeVisible({ timeout: 15000 });
  });

  test('verify dry-run results schema', async ({ page }) => {
    const workflowName = uniqueName('E2E Schema Workflow');

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

    // Click dry run using the default sample workflow
    await page.click('[data-testid="run-dryrun-btn"]');
    await expect(page.locator('[data-testid="results-viewer-pane"]')).toBeVisible();
    const resultsPane = page.locator('[data-testid="results-viewer-pane"]');
    await expect(resultsPane.locator('text=Overall Success')).toBeVisible({ timeout: 15000 });

    // Verify schema keys in raw JSON view
    await page.click('[title="Raw JSON View"]');
    const rawJson = await page.locator('[data-testid="results-viewer-pane"] .monaco-editor').textContent();
    expect(rawJson).toContain('isSuccess');
  });

  test('dry-run failure handling with invalid rules', async ({ page }) => {
    test.slow(); // This test needs extra time for mode switching

    const workflowName = uniqueName('E2E Fail Workflow');

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

    // Switch to Online Mode to enable backend API calls
    await page.click('button:has-text("Sandbox Mode")');
    await expect(page.locator('button:has-text("Online Mode")')).toBeVisible();

    // Intercept the dry-run API call to return an error response that won't trigger fallback
    // The frontend falls back on network errors, but not on HTTP errors with valid JSON responses
    await page.route('**/rules/dry-run', async (route) => {
      // Return a 200 response with an error payload to bypass the fallback logic
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          isSuccess: false, 
          errorMessage: 'Invalid rule expression syntax at line 1',
          ruleResultTree: null 
        })
      });
    });

    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.click('[data-testid="run-dryrun-btn"]');
    await expect(page.locator('[data-testid="results-viewer-pane"]')).toBeVisible();
    const resultsPane = page.locator('[data-testid="results-viewer-pane"]');
    await expect(resultsPane.locator('text=Evaluation Error')).toBeVisible({ timeout: 15000 });

    expect(consoleErrors.filter(e => e.includes('uncaught exception'))).toHaveLength(0);
  });
});
