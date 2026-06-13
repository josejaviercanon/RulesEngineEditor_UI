# Playwright E2E Testing

## Purpose

End-to-end testing framework for the RulesEngineEditor UI using Playwright, covering workflow/scenario CRUD operations, workflow-scenario lifecycle, and dry-run execution validation against the live backend.

## MODIFIED Requirements

### Requirement: Workflow and Scenario CRUD is covered by E2E tests
The system SHALL provide automated tests that validate full Create, Read, Update, and Delete operations for Workflows and their child Scenarios through the UI, including workflow-scenario lifecycle transitions.

#### Scenario: Create a new workflow
- **WHEN** the user clicks the "New Workflow" button (selector: `[data-testid="new-workflow-btn"]`)
- **THEN** a new workflow appears in the sidebar list
- **AND** the Rules Editor pane is populated with default rule JSON

#### Scenario: Update workflow rules
- **WHEN** the user modifies the JSON inside the Rules Editor Monaco instance
- **AND** clicks the "Save" button (selector: `[data-testid="save-workflow-btn"]`)
- **THEN** the backend receives a PUT/POST payload matching the updated rules schema
- **AND** a success indicator is visible in the UI

#### Scenario: Delete a workflow
- **WHEN** the user selects a workflow and clicks the "Delete" button (selector: `[data-testid="delete-workflow-btn"]`)
- **AND** confirms the deletion
- **THEN** the workflow is removed from the sidebar list
- **AND** the backend no longer returns it on subsequent GET requests

#### Scenario: CRUD for scenarios inside a workflow
- **WHEN** the user opens an existing workflow
- **THEN** they can add a new scenario (selector: `[data-testid="new-scenario-btn"]`)
- **AND** edit scenario facts/settings in the Facts Editor pane
- **AND** save the scenario
- **AND** delete the scenario
- **AND** each action reflects correctly in the UI and backend API responses

#### Scenario: Selecting a workflow loads its scenarios
- **WHEN** the test seeds two workflows each with one scenario via backend API
- **AND** the user clicks the first workflow in the Sidebar
- **THEN** the scenario list displays the first workflow's scenario
- **AND** the scenario name is visible

#### Scenario: Changing workflow reloads scenarios
- **WHEN** the user clicks the second workflow in the Sidebar
- **THEN** the first workflow's scenarios disappear
- **AND** the second workflow's scenarios appear
- **AND** the Facts Editor and assertion table are cleared if a scenario was previously loaded

#### Scenario: Creating new workflow clears scenario state
- **WHEN** the user has a workflow loaded with a scenario selected
- **AND** the user clicks "Save as New Workflow" and confirms
- **THEN** the new workflow appears in the sidebar
- **AND** the scenario list is empty
- **AND** the Facts Editor does not contain the previous scenario's mock input
- **AND** the assertion table is empty

#### Scenario: Update scenario facts and expected output
- **WHEN** the user loads an existing scenario
- **AND** modifies the facts JSON in the Facts Editor
- **AND** clicks "Update Scenario"
- **THEN** the backend reflects the updated `mockInputJson`
- **AND** reloading the scenario shows the updated facts

#### Scenario: Delete active scenario clears editor state
- **WHEN** the user deletes the currently loaded scenario
- **AND** confirms the deletion
- **THEN** the scenario disappears from the Sidebar
- **AND** the Facts Editor returns to default empty state
- **AND** the assertion table is cleared

### Requirement: Dry-run execution and results are validated end-to-end
The system SHALL provide automated tests that trigger a dry-run from the UI and verify the execution results against the live backend response.

#### Scenario: Trigger dry-run
- **WHEN** the user clicks the "Run Dry-Run" button (selector: `[data-testid="run-dryrun-btn"]`)
- **THEN** the UI sends a dry-run request to the backend with the current rules and scenario facts
- **AND** the Results Viewer pane displays the backend response

#### Scenario: Verify dry-run results schema
- **WHEN** a dry-run completes successfully
- **THEN** the Results Viewer JSON matches the backend payload schema exactly
- **AND** no console errors are emitted

#### Scenario: Dry-run failure handling
- **WHEN** a dry-run request returns a 4xx/5xx error or invalid rule JSON
- **THEN** the UI displays the error message accurately in the results or notification area
- **AND** the UI remains interactive

### Requirement: UI components expose stable data-testid selectors
The system SHALL annotate key interactive and display components with `data-testid` attributes so that E2E tests can locate elements without relying on CSS classes or DOM structure.

#### Scenario: Sidebar selectors
- **WHEN** inspecting the Sidebar component
- **THEN** workflow items have `data-testid="workflow-item-<id>"` (or similar stable pattern)
- **AND** action buttons have `data-testid="new-workflow-btn"`, `data-testid="delete-workflow-btn"`, etc.
- **AND** scenario items have `data-testid="scenario-item-<id>"`
- **AND** scenario action buttons have `data-testid="new-scenario-btn"`, `data-testid="update-scenario-btn"`, `data-testid="delete-scenario-btn"`

#### Scenario: Editor pane selectors
- **WHEN** inspecting the Rules Editor, Facts Editor, and Results Viewer panes
- **THEN** each pane container has a unique `data-testid`
- **AND** primary action buttons (Save, Run Dry-Run, Add Scenario) have unique `data-testid` values

### Requirement: Local debugging and reporting artifacts are generated
The system SHALL produce local test artifacts that aid rapid debugging of failures without external services.

#### Scenario: HTML report on failure
- **WHEN** a Playwright test fails
- **THEN** an HTML report is generated and opened automatically (if configured)
- **AND** the report contains the failing assertion, screenshot, and trace link

#### Scenario: Trace files for inspection
- **WHEN** any test completes (pass or fail)
- **THEN** a trace ZIP is saved under `test-results/`
- **AND** the trace can be opened in the VS Code Playwright extension or `npx playwright show-trace`

### Requirement: VS Code workspace settings align with Playwright extension
The system SHALL include `.vscode/settings.json` entries that configure the Playwright extension for the local project context.

#### Scenario: Extension configuration
- **WHEN** opening the project in VS Code with the Playwright extension installed
- **THEN** the Test Explorer discovers tests from `tests/**/*.spec.ts`
- **AND** the default execution profile uses headed mode for visual debugging
