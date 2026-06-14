## Why

The current app loads all workflows into the Sidebar on startup, cluttering the UI and pre-populating editors with sample data. Users need a cleaner initial state — empty editors on launch — with an explicit "New" action that opens a modal to select or create a workflow. Additionally, scenario assertion fields must reliably update after each dry-run, and comprehensive E2E tests are needed to validate all CRUD operations for Workflows and Scenarios.

## What Changes

- **Remove auto-load of workflow list at startup**: The Sidebar will no longer fetch and display all workflows on mount. Editors start empty.
- **Replace "New" button with modal workflow selector**: Clicking "New" opens a modal popup listing available workflows to load, plus an option to create a new workflow from a default simple template.
- **Load scenarios only after workflow selection**: When a workflow is loaded (via modal or template), its scenarios are fetched and displayed in the Sidebar.
- **Default simple template on "New"**: When the user chooses to create a new workflow, a minimal default Rules JSON template is loaded into the editor.
- **Verify assertion field updates after dry-run**: Ensure the AssertionTable re-evaluates all paths against the latest `testResult` and displays actual values correctly.
- **Add comprehensive E2E tests**: New Playwright tests covering full CRUD workflows and scenarios, modal interaction, template loading, and assertion validation after dry-run.

## Capabilities

### New Capabilities

- `workflow-load-modal`: Modal-based workflow selection replacing the auto-loaded sidebar list. Covers the modal UI, workflow list fetching on demand, default template creation, and scenario loading after selection.

### Modified Capabilities

- `workflow-management`: Remove the "list workflows at startup" requirement. Change the "New" button behavior from `window.prompt()` to a modal dialog. Add default template loading.
- `scenario-management`: Clarify that scenarios are only loaded after a workflow is explicitly selected (via modal or template), not on app startup.
- `scenario-validation`: Add explicit requirement that assertion actual-value fields are populated and re-evaluated after every dry-run execution.
- `playwright-e2e-testing`: Add new E2E test scenarios for modal workflow selection, default template creation, assertion field updates after dry-run, and comprehensive CRUD validation coverage.

## Impact

- **`src/components/Sidebar.jsx`**: Major refactor — remove auto-load `useEffect`, replace "New" button handler with modal trigger, add modal component integration.
- **`src/components/WorkflowModal.jsx`** (new): New modal component for workflow selection and creation.
- **`src/App.jsx`**: May need minor adjustments to pass modal state or handle empty initial state.
- **`src/hooks/useRulesReducer.js`**: Possibly add a `SET_DEFAULT_TEMPLATE` action or handle empty initial state for `currentRules`.
- **`src/components/AssertionTable.jsx`**: Verify and potentially fix `evaluatePath()` to correctly resolve actual values from `testResult` after dry-run.
- **`tests/rules-engine-crud.spec.ts`**: Significant rewrite to accommodate modal-based workflow loading instead of direct sidebar list interaction.
- **`tests/rules-engine-dryrun.spec.ts`**: Add assertion field validation tests.
- **`docs/UI.Architecture.md`**: Update to reflect new startup behavior and modal component.
- **`docs/UI.DebugGuide.md`**: Update if new failure modes are introduced.
