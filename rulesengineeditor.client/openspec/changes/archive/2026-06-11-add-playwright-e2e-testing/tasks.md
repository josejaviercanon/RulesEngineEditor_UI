## 1. Playwright Installation & Configuration

- [x] 1.1 Install `@playwright/test` as a dev dependency in `rulesengineeditor.client/package.json`.
- [x] 1.2 Run `npx playwright install` to download Chromium (and optionally Firefox/WebKit) binaries.
- [x] 1.3 Create `playwright.config.ts` at `rulesengineeditor.client/playwright.config.ts` with:
  - Base URL `http://localhost:65426`
  - `projects: [{ name: 'setup', testMatch: '**/*.setup.ts' }, { name: 'e2e', dependencies: [{ name: 'setup' }] }]`
  - `use: { trace: 'on', screenshot: 'only-on-failure' }`
  - `reporter: [['html', { open: 'on-failure' }], ['list']]`
- [x] 1.4 Add `test-results/` and `playwright/.auth/` to `.gitignore`.
- [x] 1.5 Add `.vscode/settings.json` entries to align the Playwright extension with the local project (e.g., `playwright.env`, default profile headed mode).

## 2. Global Authentication Setup

- [x] 2.1 Create `tests/auth.setup.ts` that:
  - Navigates to the login page (or dev auto-login if available).
  - Submits credentials to the backend (`/login` or `/api/passkey`).
  - Waits for a protected route indicator (e.g., sidebar visible).
  - Writes `storageState` to `playwright/.auth/user.json`.
- [x] 2.2 Verify the `e2e` project in `playwright.config.ts` references `storageState: 'playwright/.auth/user.json'`.
- [x] 2.3 Run `npx playwright test --project=setup` to confirm auth state file is generated.

## 3. Add data-testid Selectors to React Components

- [x] 3.1 Add `data-testid` props to `Sidebar.jsx`:
  - `new-workflow-btn`, `delete-workflow-btn`, `workflow-item-<id>` pattern on list items.
- [x] 3.2 Add `data-testid` props to `RulesEditorPane.jsx`:
  - `rules-editor-pane`, `save-workflow-btn`.
- [x] 3.3 Add `data-testid` props to `FactsEditorPane.jsx`:
  - `facts-editor-pane`, `new-scenario-btn`, `save-scenario-btn`, `delete-scenario-btn`.
- [x] 3.4 Add `data-testid` props to `ResultsViewerPane.jsx`:
  - `results-viewer-pane`, `run-dryrun-btn`.
- [x] 3.5 Add `data-testid` props to `AssertionTable.jsx`:
  - `assertion-table`, `add-assertion-btn`.
- [x] 3.6 Run `npm run lint` to ensure no JSX prop syntax errors were introduced.

## 4. Workflow & Scenario CRUD Tests

- [x] 4.1 Create `tests/rules-engine-crud.spec.ts`.
- [x] 4.2 Implement test: **Create a new workflow** — click `new-workflow-btn`, assert workflow appears in sidebar, assert `rules-editor-pane` is visible.
- [x] 4.3 Implement test: **Update workflow rules** — type valid JSON into Monaco (via `data-testid` container and `page.fill` or `page.evaluate`), click `save-workflow-btn`, intercept or poll backend to confirm update persisted.
- [x] 4.4 Implement test: **Delete a workflow** — select workflow, click `delete-workflow-btn`, confirm deletion, assert item removed from sidebar and backend GET no longer returns it.
- [x] 4.5 Implement test: **Scenario CRUD inside a workflow** — open workflow, click `new-scenario-btn`, fill facts in `facts-editor-pane`, click `save-scenario-btn`, assert scenario appears; then click `delete-scenario-btn` and assert removal.
- [x] 4.6 Run the CRUD spec in headed mode via VS Code Test Explorer and verify all assertions pass.

## 5. Dry-Run Execution Tests

- [x] 5.1 Create `tests/rules-engine-dryrun.spec.ts`.
- [x] 5.2 Implement test: **Trigger dry-run** — open a workflow with a scenario, click `run-dryrun-btn`, wait for `results-viewer-pane` to populate, assert network response status is 200.
- [x] 5.3 Implement test: **Verify dry-run results schema** — assert the JSON rendered in `results-viewer-pane` contains expected keys (`isSuccess`, `results`, etc.) matching the backend contract.
- [x] 5.4 Implement test: **Dry-run failure handling** — introduce invalid rule JSON, click `run-dryrun-btn`, assert error message is displayed in the UI and no uncaught exceptions appear in the browser console.
- [x] 5.5 Run the dry-run spec in headed mode and confirm backend payloads are correct via Browser DevTools inside Playwright.

## 6. QA Validation & Reporting

- [x] 6.1 Run the full suite (`npx playwright test`) and confirm all tests pass against the live backend.
- [x] 6.2 Intentionally break one test to verify the HTML report opens automatically on failure.
- [x] 6.3 Open a trace file from `test-results/` in the VS Code Playwright extension and confirm UI interactions are recorded.
- [x] 6.4 Verify no console errors or uncaught exceptions appear in the VS Code debug console during test execution.
- [x] 6.5 Update `docs/UI.DebugGuide.md` with a "Running E2E Tests" section describing how to start the backend, run tests, and inspect traces.
