## ADDED Requirements

### Requirement: Playwright E2E test framework is installed and configured
The system SHALL include a Playwright test framework configured to run against the local Vite dev server and live backend API.

#### Scenario: Framework installation
- **WHEN** a developer runs `npm install` in `rulesengineeditor.client/`
- **THEN** `@playwright/test` and required browser binaries are available

#### Scenario: Configuration exists
- **WHEN** inspecting `playwright.config.ts`
- **THEN** it defines at least two projects: `setup` (global auth) and `e2e` (functional tests)
- **AND** the `e2e` project declares `dependencies: [{ name: 'setup' }]`
- **AND** the base URL points to `http://localhost:65426` (Vite dev server)

### Requirement: Global authentication setup project prepares reusable auth state
The system SHALL execute a global setup project that authenticates against the backend and persists the resulting JWT/session state for reuse by all functional tests.

#### Scenario: Auth setup execution
- **WHEN** the `setup` project runs
- **THEN** it sends credentials to the backend login endpoint
- **AND** it writes the authenticated storage state to `playwright/.auth/user.json`

#### Scenario: Functional tests reuse auth
- **WHEN** any functional test project starts
- **THEN** it loads `storageState: 'playwright/.auth/user.json'`
- **AND** protected routes are accessible without re-authenticating

### Requirement: Workflow and Scenario CRUD is covered by E2E tests
The system SHALL provide automated tests that validate full Create, Read, Update, and Delete operations for Workflows and their child Scenarios through the UI.

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
