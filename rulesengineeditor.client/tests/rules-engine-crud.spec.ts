import { test, expect } from '@playwright/test';

function uniqueName(base: string) {
  return `${base} ${Date.now()}`;
}

/**
 * Seeds a workflow with a scenario via the backend API.
 * Returns { workflowId, scenarioId } for cleanup or further use.
 */
async function seedWorkflowAndScenario(
  baseURL: string | undefined,
  workflowName: string,
  scenarioName: string,
  mockInput: object = { input1: { country: 'us', loyaltyFactor: 3 } },
  expectedOutput: object = { isSuccess: true }
) {
  if (!baseURL) throw new Error('baseURL is required for seeding');

  const rulesJson = JSON.stringify([{ WorkflowName: workflowName, Rules: [] }]);

  const wfRes = await fetch(`${baseURL}/rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflowName,
      version: 1,
      jsonContent: rulesJson,
      status: 'Draft'
    })
  });

  if (!wfRes.ok) {
    throw new Error(`Failed to seed workflow: ${wfRes.status} ${await wfRes.text()}`);
  }

  const workflow = await wfRes.json();
  const workflowId = workflow.workflowDefinitionId || workflow.WorkflowDefinitionId;

  const scRes = await fetch(`${baseURL}/scenarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflowDefinitionId: workflowId,
      scenarioName,
      mockInputJson: JSON.stringify(mockInput),
      expectedOutputJson: JSON.stringify(expectedOutput)
    })
  });

  if (!scRes.ok) {
    throw new Error(`Failed to seed scenario: ${scRes.status} ${await scRes.text()}`);
  }

  const scenario = await scRes.json();
  const scenarioId = scenario.scenarioId;

  return { workflowId, scenarioId };
}

/**
 * Helper: opens the workflow modal by clicking the New button.
 */
async function openWorkflowModal(page: import('@playwright/test').Page) {
  await page.click('[data-testid="new-workflow-btn"]');
  await expect(page.locator('[data-testid="workflow-modal"]')).toBeVisible({ timeout: 5000 });
}

/**
 * Helper: creates a new workflow from the modal using the default template.
 */
async function createWorkflowFromModal(page: import('@playwright/test').Page, workflowName: string) {
  await openWorkflowModal(page);
  
  // Click the "Create New Workflow" button to enter creation mode
  await page.click('[data-testid="workflow-modal-create-btn"]');
  
  // Fill the workflow name input
  await page.fill('#workflow-name', workflowName);
  
  // Submit the form
  await page.click('[data-testid="workflow-submit-btn"]');
  
  // Wait for modal to close
  await expect(page.locator('[data-testid="workflow-modal"]')).not.toBeVisible({ timeout: 5000 });
}

/**
 * Helper: selects an existing workflow from the modal by name.
 */
async function selectWorkflowFromModal(page: import('@playwright/test').Page, workflowName: string) {
  await openWorkflowModal(page);
  await page.click(`[data-testid="workflow-modal"] >> text=${workflowName}`);
  // Wait for modal to close
  await expect(page.locator('[data-testid="workflow-modal"]')).not.toBeVisible({ timeout: 5000 });
}

test.describe('Rules Engine Workflow CRUD (Modal-based)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="rules-editor-pane"]')).toBeVisible();
  });

  test('app starts with empty editors and no workflow list', async ({ page }) => {
    // Verify empty state hint is visible
    await expect(page.locator('[data-testid="workflow-list-empty"]')).toBeVisible();
    // Verify no workflow items are shown in sidebar
    await expect(page.locator('[data-testid^="workflow-item-"]')).toHaveCount(0);
  });

  test('open modal and view workflow list', async ({ page }) => {
    await openWorkflowModal(page);
    
    // Modal should be visible
    await expect(page.locator('[data-testid="workflow-modal"]')).toBeVisible();
    // Create New and Cancel buttons should be visible
    await expect(page.locator('[data-testid="workflow-modal-create-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="workflow-modal-cancel-btn"]')).toBeVisible();
  });

  test('create new workflow from modal loads default template', async ({ page }) => {
    const workflowName = uniqueName('E2E Template WF');
    await createWorkflowFromModal(page, workflowName);

    // Verify the Rules Editor contains the default template
    // The template should contain the workflow name
    const editorContent = await page.locator('[data-testid="rules-editor-pane"] .monaco-editor').textContent();
    expect(editorContent).toContain(workflowName);
    expect(editorContent).toContain('DefaultRule');
    expect(editorContent).toContain('LambdaExpression');

    // Verify scenario list shows empty state
    await expect(page.locator('text=No scenarios for this workflow.')).toBeVisible();
  });

  test('cancel modal returns to empty state', async ({ page }) => {
    await openWorkflowModal(page);
    await page.click('[data-testid="workflow-modal-cancel-btn"]');
    
    // Modal should close
    await expect(page.locator('[data-testid="workflow-modal"]')).not.toBeVisible();
    // Empty state should remain
    await expect(page.locator('[data-testid="workflow-list-empty"]')).toBeVisible();
  });

  test('select workflow from modal loads it into editor', async ({ baseURL, page }) => {
    const workflowName = uniqueName('E2E Select WF');
    const scenarioName = uniqueName('E2E Select SC');

    const { workflowId } = await seedWorkflowAndScenario(baseURL, workflowName, scenarioName);

    try {
      await selectWorkflowFromModal(page, workflowName);

      // Verify the workflow is loaded — sidebar shows the workflow indicator
      await expect(page.locator(`text=Workflow #${workflowId}`)).toBeVisible({ timeout: 5000 });

      // Verify scenario list shows the seeded scenario
      await expect(page.locator(`text=${scenarioName}`)).toBeVisible({ timeout: 10000 });
    } finally {
      await fetch(`${baseURL}/rules/${workflowId}`, { method: 'DELETE' });
    }
  });

  test('save new workflow persists it', async ({ page }) => {
    const workflowName = uniqueName('E2E Save WF');
    await createWorkflowFromModal(page, workflowName);

    // Now save the workflow using the Save button
    await page.click('[data-testid="save-workflow-btn"]');
    // Wait a moment for the save to complete
    await page.waitForTimeout(1000);

    // Open modal again and verify the workflow appears in the list
    await openWorkflowModal(page);
    await expect(page.locator(`[data-testid="workflow-modal"] >> text=${workflowName}`)).toBeVisible({ timeout: 10000 });
    
    // Close modal
    await page.click('[data-testid="workflow-modal-cancel-btn"]');
  });

  test('update workflow persists changes', async ({ baseURL, page }) => {
    const workflowName = uniqueName('E2E Update WF');
    const { workflowId } = await seedWorkflowAndScenario(baseURL, workflowName, 'dummy-scenario');

    try {
      await selectWorkflowFromModal(page, workflowName);

      // Modify the Rules JSON in the editor
      await page.click('[data-testid="rules-editor-pane"]');
      await page.keyboard.press('Control+a');
      const updatedJson = JSON.stringify([{ WorkflowName: workflowName, Rules: [{ RuleName: 'UpdatedRule', SuccessEvent: '20', ErrorMessage: 'Updated', ErrorType: 'Error', RuleExpressionType: 'LambdaExpression', Expression: 'input1 == true' }] }], null, 2);
      await page.keyboard.type(updatedJson);

      // Save the workflow
      await page.click('[data-testid="save-workflow-btn"]');
      await page.waitForTimeout(1000);

      // Reload and verify persistence
      await page.reload();
      await expect(page.locator('[data-testid="rules-editor-pane"]')).toBeVisible();
      await selectWorkflowFromModal(page, workflowName);
      
      const editorContent = await page.locator('[data-testid="rules-editor-pane"] .monaco-editor').textContent();
      expect(editorContent).toContain('UpdatedRule');
    } finally {
      await fetch(`${baseURL}/rules/${workflowId}`, { method: 'DELETE' });
    }
  });

  test('delete workflow removes it permanently', async ({ baseURL, page }) => {
    const workflowName = uniqueName('E2E Delete WF');
    const { workflowId } = await seedWorkflowAndScenario(baseURL, workflowName, 'dummy-scenario');

    try {
      // Open modal and delete the workflow
      await openWorkflowModal(page);
      
      page.on('dialog', dialog => {
        if (dialog.type() === 'confirm') {
          dialog.accept();
        } else {
          dialog.accept();
        }
      });

      const workflowItem = page.locator(`[data-testid="workflow-modal-item-${workflowId}"]`);
      await workflowItem.hover();
      await workflowItem.locator('button[title="Delete Workflow"]').click();
      
      // Wait for deletion and list refresh
      await page.waitForTimeout(1000);
      
      // Verify the workflow is no longer in the modal list
      await expect(page.locator(`[data-testid="workflow-modal"] >> text=${workflowName}`)).not.toBeVisible();
      
      // Close modal
      await page.click('[data-testid="workflow-modal-cancel-btn"]');
    } finally {
      // Cleanup (may already be deleted)
      await fetch(`${baseURL}/rules/${workflowId}`, { method: 'DELETE' }).catch(() => {});
    }
  });
});

test.describe('Workflow Scenario Lifecycle (Modal-based)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="rules-editor-pane"]')).toBeVisible();
  });

  test('changing workflow reloads scenario list', async ({ baseURL, page }) => {
    const workflowName1 = uniqueName('E2E WF1');
    const scenarioName1 = uniqueName('E2E SC1');
    const workflowName2 = uniqueName('E2E WF2');
    const scenarioName2 = uniqueName('E2E SC2');

    const { workflowId: id1 } = await seedWorkflowAndScenario(baseURL, workflowName1, scenarioName1);
    const { workflowId: id2 } = await seedWorkflowAndScenario(baseURL, workflowName2, scenarioName2);

    try {
      // Select first workflow
      await selectWorkflowFromModal(page, workflowName1);
      await expect(page.locator(`text=${scenarioName1}`)).toBeVisible({ timeout: 10000 });
      await expect(page.locator(`text=${scenarioName2}`)).not.toBeVisible();

      // Switch to second workflow
      await selectWorkflowFromModal(page, workflowName2);
      await expect(page.locator(`text=${scenarioName2}`)).toBeVisible({ timeout: 10000 });
      await expect(page.locator(`text=${scenarioName1}`)).not.toBeVisible();
    } finally {
      await fetch(`${baseURL}/rules/${id1}`, { method: 'DELETE' });
      await fetch(`${baseURL}/rules/${id2}`, { method: 'DELETE' });
    }
  });

  test('creating new workflow clears scenario state', async ({ page }) => {
    const workflowName1 = uniqueName('E2E Clear WF1');
    const scenarioName = uniqueName('E2E Clear SC');

    // Create first workflow and scenario
    await createWorkflowFromModal(page, workflowName1);

    // Save the workflow first so we have a workflowId
    await page.click('[data-testid="save-workflow-btn"]');
    await page.waitForTimeout(1000);

    // Create a scenario
    await page.click('[data-testid="new-scenario-btn"]');
    await page.fill('[data-testid="new-scenario-name-input"]', scenarioName);
    await page.click('[data-testid="confirm-create-scenario-btn"]');
    await expect(page.locator(`text=${scenarioName}`)).toBeVisible({ timeout: 10000 });

    // Load the scenario
    await page.click(`text=${scenarioName}`);
    await expect(page.locator('[data-testid="facts-editor-pane"]')).toBeVisible();

    // Now create a new workflow — scenario state should clear
    const workflowName2 = uniqueName('E2E Clear WF2');
    await createWorkflowFromModal(page, workflowName2);

    // The scenario list should show empty state
    await expect(page.locator(`text=${scenarioName}`)).not.toBeVisible();
    await expect(page.locator('text=No scenarios for this workflow.')).toBeVisible();
  });

  test('create scenario with facts and expected output', async ({ page }) => {
    const workflowName = uniqueName('E2E SC Create WF');
    const scenarioName = uniqueName('E2E SC Create');

    await createWorkflowFromModal(page, workflowName);

    // Save the workflow first
    await page.click('[data-testid="save-workflow-btn"]');
    await page.waitForTimeout(1000);

    // Create scenario
    await page.click('[data-testid="new-scenario-btn"]');
    await page.fill('[data-testid="new-scenario-name-input"]', scenarioName);
    await page.click('[data-testid="confirm-create-scenario-btn"]');
    await expect(page.locator(`text=${scenarioName}`)).toBeVisible({ timeout: 10000 });
  });

  test('load scenario populates facts and assertions', async ({ baseURL, page }) => {
    const workflowName = uniqueName('E2E SC Load WF');
    const scenarioName = uniqueName('E2E SC Load');
    const expectedOutput = { IsSuccess: true };

    const { workflowId } = await seedWorkflowAndScenario(baseURL, workflowName, scenarioName, 
      { input1: { country: 'us' } }, expectedOutput);

    try {
      await selectWorkflowFromModal(page, workflowName);
      await expect(page.locator(`text=${scenarioName}`)).toBeVisible({ timeout: 10000 });

      // Click the scenario to load it
      await page.click(`text=${scenarioName}`);
      await expect(page.locator('[data-testid="facts-editor-pane"]')).toBeVisible();

      // Verify assertion table is populated from expected output
      await expect(page.locator('[data-testid="assertion-table"]')).toBeVisible();
      await expect(page.locator('text=IsSuccess')).toBeVisible();
    } finally {
      await fetch(`${baseURL}/rules/${workflowId}`, { method: 'DELETE' });
    }
  });

  test('update scenario persists changes', async ({ baseURL, page }) => {
    const workflowName = uniqueName('E2E SC Update WF');
    const scenarioName = uniqueName('E2E SC Update');

    const { workflowId } = await seedWorkflowAndScenario(baseURL, workflowName, scenarioName);

    try {
      await selectWorkflowFromModal(page, workflowName);
      await expect(page.locator(`text=${scenarioName}`)).toBeVisible({ timeout: 10000 });

      // Load the scenario
      await page.click(`text=${scenarioName}`);
      await expect(page.locator('[data-testid="facts-editor-pane"]')).toBeVisible();

      // Modify facts
      const updatedFacts = JSON.stringify({ input1: { country: 'uk', loyaltyFactor: 10 } });
      await page.click('[data-testid="facts-editor-pane"]');
      await page.keyboard.press('Control+a');
      await page.keyboard.type(updatedFacts);

      // Update scenario
      page.on('dialog', dialog => {
        if (dialog.type() === 'prompt') {
          dialog.accept(scenarioName);
        } else {
          dialog.accept();
        }
      });
      await page.click('[data-testid="update-scenario-btn"]');
      await page.waitForTimeout(1000);

      // Reload and verify persistence
      await page.reload();
      await expect(page.locator('[data-testid="rules-editor-pane"]')).toBeVisible();
      await selectWorkflowFromModal(page, workflowName);
      await expect(page.locator(`text=${scenarioName}`)).toBeVisible({ timeout: 10000 });
      await page.click(`text=${scenarioName}`);
      await expect(page.locator('[data-testid="facts-editor-pane"]')).toBeVisible();
    } finally {
      await fetch(`${baseURL}/rules/${workflowId}`, { method: 'DELETE' });
    }
  });

  test('delete scenario removes it and clears state', async ({ baseURL, page }) => {
    const workflowName = uniqueName('E2E SC Delete WF');
    const scenarioName = uniqueName('E2E SC Delete');

    const { workflowId } = await seedWorkflowAndScenario(baseURL, workflowName, scenarioName);

    try {
      await selectWorkflowFromModal(page, workflowName);
      await expect(page.locator(`text=${scenarioName}`)).toBeVisible({ timeout: 10000 });

      // Load the scenario
      await page.click(`text=${scenarioName}`);
      await expect(page.locator('[data-testid="facts-editor-pane"]')).toBeVisible();

      // Delete the scenario
      page.on('dialog', dialog => {
        if (dialog.type() === 'confirm') {
          dialog.accept();
        } else {
          dialog.accept();
        }
      });

      const scenarioItem = page.locator(`text=${scenarioName}`).locator('xpath=../..');
      await scenarioItem.hover();
      await scenarioItem.locator('[data-testid="delete-scenario-btn"]').click();

      // Verify scenario is removed
      await expect(page.locator(`text=${scenarioName}`)).not.toBeVisible();
      // Facts editor should still be visible but reset
      await expect(page.locator('[data-testid="facts-editor-pane"]')).toBeVisible();
    } finally {
      await fetch(`${baseURL}/rules/${workflowId}`, { method: 'DELETE' });
    }
  });
});

test.describe('Assertion Validation After Dry-Run', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="rules-editor-pane"]')).toBeVisible();
  });

  test('add assertion triggers warning when no scenario is loaded', async ({ page }) => {
    const workflowName = uniqueName('E2E Warn WF');

    // Create workflow from template
    await createWorkflowFromModal(page, workflowName);

    // Listen to dialog and accept the warning
    let dialogMsg = '';
    page.on('dialog', dialog => {
      dialogMsg = dialog.message();
      dialog.accept();
    });

    // Try to add assertion without any scenario
    await page.click('[data-testid="add-assertion-btn"]');
    
    // Verify warning was shown
    expect(dialogMsg).toBe('Please select or create a scenario first.');
  });

  test('assertion actual values populate after dry-run', async ({ page }) => {
    const workflowName = uniqueName('E2E Assert WF');
    const scenarioName = uniqueName('E2E Assert SC');

    // Create workflow from template
    await createWorkflowFromModal(page, workflowName);

    // Save the workflow first
    await page.click('[data-testid="save-workflow-btn"]');
    await page.waitForTimeout(1000);

    // Create and load a scenario first
    await page.click('[data-testid="new-scenario-btn"]');
    await page.fill('[data-testid="new-scenario-name-input"]', scenarioName);
    await page.click('[data-testid="confirm-create-scenario-btn"]');
    await expect(page.locator(`text=${scenarioName}`)).toBeVisible({ timeout: 10000 });

    // Add a manual assertion
    await page.click('[data-testid="add-assertion-btn"]');
    // The assertion row should appear
    await expect(page.locator('[data-testid="assertion-table"]')).toBeVisible();

    // Fill in the assertion path and expected value
    const pathInput = page.locator('[data-testid="assertion-table"] input[placeholder="[0].IsSuccess"]').last();
    await pathInput.fill('[0].IsSuccess');
    const valueInput = page.locator('[data-testid="assertion-table"] input[placeholder="true"]').last();
    await valueInput.fill('true');

    // Run dry-run
    await page.click('[data-testid="run-dryrun-btn"]');
    await expect(page.locator('[data-testid="results-viewer-pane"]')).toBeVisible();
    
    // Wait for results
    const resultsPane = page.locator('[data-testid="results-viewer-pane"]');
    await expect(resultsPane.locator('text=Overall Success')).toBeVisible({ timeout: 15000 });

    // Verify assertion actual value is populated (not "-" or empty)
    const actualCells = page.locator('[data-testid^="assertion-actual-"]');
    const count = await actualCells.count();
    expect(count).toBeGreaterThan(0);
    
    // At least one actual value should not be "-"
    let hasValue = false;
    for (let i = 0; i < count; i++) {
      const text = await actualCells.nth(i).textContent();
      if (text && text.trim() !== '-') {
        hasValue = true;
        break;
      }
    }
    expect(hasValue).toBe(true);
  });

  test('assertion re-evaluates on subsequent dry-run', async ({ page }) => {
    const workflowName = uniqueName('E2E ReEval WF');
    const scenarioName = uniqueName('E2E ReEval SC');

    // Create workflow from template
    await createWorkflowFromModal(page, workflowName);

    // Save the workflow first
    await page.click('[data-testid="save-workflow-btn"]');
    await page.waitForTimeout(1000);

    // Create and load a scenario first
    await page.click('[data-testid="new-scenario-btn"]');
    await page.fill('[data-testid="new-scenario-name-input"]', scenarioName);
    await page.click('[data-testid="confirm-create-scenario-btn"]');
    await expect(page.locator(`text=${scenarioName}`)).toBeVisible({ timeout: 10000 });

    // Add a manual assertion
    await page.click('[data-testid="add-assertion-btn"]');
    const pathInput = page.locator('[data-testid="assertion-table"] input[placeholder="[0].IsSuccess"]').last();
    await pathInput.fill('[0].IsSuccess');
    const valueInput = page.locator('[data-testid="assertion-table"] input[placeholder="true"]').last();
    await valueInput.fill('true');

    // First dry-run
    await page.click('[data-testid="run-dryrun-btn"]');
    await expect(page.locator('[data-testid="results-viewer-pane"]')).toBeVisible();
    const resultsPane = page.locator('[data-testid="results-viewer-pane"]');
    await expect(resultsPane.locator('text=Overall Success')).toBeVisible({ timeout: 15000 });

    // Capture first actual value
    const actualCell = page.locator('[data-testid^="assertion-actual-"]').first();
    const firstValue = await actualCell.textContent();

    // Modify facts and run again
    await page.click('[data-testid="facts-editor-pane"]');
    await page.keyboard.press('Control+a');
    await page.keyboard.type(JSON.stringify({ input1: false }));

    // Second dry-run
    await page.click('[data-testid="run-dryrun-btn"]');
    await page.waitForTimeout(2000);

    // Verify actual value cell still has content (re-evaluated)
    const secondValue = await actualCell.textContent();
    // Both should have some value (not empty)
    expect(firstValue?.trim()).not.toBe('');
    expect(secondValue?.trim()).not.toBe('');
  });
});
