# Debug Guide – RulesEngine JSON Editor

> **STATUS: CURRENT** | This document describes the running system as of Phase 1.0

## Common Issues

### 1. Monaco Editor Loading Errors
- **Symptom**: Editor shows blank area or "Loading..." indefinitely.
- **Fix**: Check network tab for Monaco loader script failures. Ensure `@monaco-editor/react` is installed. Verify no CSP blocking script loading. Try clearing `node_modules/.vite` cache and restarting dev server.

### 2. API Call Failures
- **Symptom**: Dry-run returns no results or "Sandbox Mode" badge appears immediately.
- **Fix**: 
  - Verify the backend is running on one of the profiles:
    - **HTTP profile**: `http://localhost:5064` (run with `http` launch profile)
    - **HTTPS profile**: `https://localhost:7119` (run with `https` launch profile)
  - Check OpenAPI docs at `https://localhost:7119/scalar/` for endpoint availability
  - Verify `vite.config.js` proxy settings (proxies to `http://localhost:5064` — matches the HTTP profile)
  - Check browser console for CORS or network errors
  - If backend is unreachable, app falls back to localStorage mock data and naive simulation

### 3. JSON Parse Errors in State
- **Symptom**: UI crashes or shows blank after editing JSON.
- **Fix**: 
  - Check `useRulesReducer.js` – state stores raw JSON strings
  - `App.jsx` parses settings with `JSON.parse` inside `try/catch` in `useMemo`
  - Ensure components handle parse failures gracefully
  - Validate JSON in Monaco Editor before dispatching state updates

### 4. Schema Validation Mismatches
- **Symptom**: Monaco shows validation errors for valid RulesEngine JSON.
- **Fix**: 
  - Review `src/services/schema.js` against actual backend OpenAPI spec (`Api/v1.yaml`)
  - Check that schema URIs match `fileMatch` patterns in Monaco config
  - Note: `workflow-schema.json` in repo root may differ from `schema.js` – ensure consistency

### 5. localStorage Mock Data Drift
- **Symptom**: Saved workflows/scenarios don't match backend data.
- **Fix**: 
  - Clear `localStorage` keys: `mockWorkflows`, `mockScenarios`
  - Remember: localStorage fallback only activates when backend is unreachable
  - Mock simulation in `apiClient.js` always returns `IsSuccess: true` – do not rely on it for real validation

### 6. Theme Mismatches
- **Symptom**: Monaco Editor looks out of place with dark theme.
- **Fix**: 
  - Check `src/index.css` for Monaco-specific overrides (`.monaco-editor` background transparency)
  - Ensure `theme="vs-dark"` is set on all Editor instances
  - Tailwind v4 colors are defined in `index.css` `@theme` block, not `tailwind.config.js`

### 7. Workflow Modal Issues
- **Symptom**: Modal doesn't open, shows empty list, or fails to load workflows.
- **Fix**: 
  - Verify the "New" button (`[data-testid="new-workflow-btn"]`) triggers `setIsModalOpen(true)` in Sidebar
  - Check that `WorkflowModal.jsx` fetches workflows via `rulesApi.getWorkflows()` on mount
  - If the modal shows "Failed to load workflows", check backend connectivity (see Issue #2)
  - If the modal shows "No workflows found", this is expected for a fresh install — use "Create New Workflow"
  - Verify `data-testid` attributes are present: `workflow-modal`, `workflow-modal-list`, `workflow-modal-create-btn`, `workflow-modal-cancel-btn`

### 8. Empty Editors on Startup
- **Symptom**: App starts with empty editors and no workflow list visible.
- **Fix**: 
  - This is the **expected behavior** — the app no longer auto-loads workflows or sample data
  - Click the "New" button (Plus icon) in the Sidebar to open the workflow selection modal
  - Select an existing workflow or click "Create New Workflow" to load a default template
  - The hint text "Click New to load or create a workflow" confirms the empty state is intentional

### 9. Assertion Actual Values Not Updating After Dry-Run
- **Symptom**: After running a dry-run, the "Actual Value" column in the assertion table shows "-" or "undefined".
- **Fix**: 
  - Verify `testResult` is not null in React DevTools (should be populated after dry-run)
  - Check that assertion paths are valid — e.g., `[0].IsSuccess` resolves against `testResult.ruleResultTree[0].isSuccess`
  - The `evaluatePath()` function auto-unwraps `ruleResultTree`/`RuleResultTree` when paths start with `[N]`
  - It also tries both PascalCase and camelCase property names — verify the path key exists in the result
  - If using Online Mode, ensure the backend returns a valid `EvaluationResult` with `ruleResultTree`

---

## Debugging Steps

1. Run `npm run dev` and open Chrome DevTools
2. Use React Developer Tools to inspect component state (especially string-based JSON state)
3. Check Network tab for API call failures and response payloads
4. Validate JSON output manually with backend `POST /api/Rules/dry-run` endpoint
5. Check Application tab > Local Storage for mock data drift
6. Review Monaco Editor console for schema validation errors

---

## Running E2E Tests

The project uses Playwright for end-to-end UI testing against the local dev server and live backend.

### Prerequisites
1. Ensure the backend is running (HTTP profile: `http://localhost:5064` or HTTPS: `https://localhost:7119`)
2. Install dependencies: `npm install` (already includes `@playwright/test`)
3. Install browser binaries: `npx playwright install chromium`

### Test Commands
- **Run all tests**: `npx playwright test`
- **Run in headed mode (visual debugging)**: `npx playwright test --headed`
- **Run with UI mode**: `npx playwright test --ui`
- **Run specific project**: `npx playwright test --project=e2e`
- **Run setup only (auth)**: `npx playwright test --project=setup`

### Auth Setup
- The `setup` project (`tests/auth.setup.ts`) logs in with dev credentials (`admin@localhost.local` / `Admin@123456`)
- It writes the authenticated storage state to `playwright/.auth/user.json`
- All `e2e` tests reuse this state via `storageState` in `playwright.config.ts`

### Inspecting Failures
- HTML report opens automatically on failure (configured in `playwright.config.ts`)
- Trace files are saved to `test-results/` — open them with:
  - VS Code Playwright extension
  - `npx playwright show-trace test-results/<trace-file>.zip`
- Screenshots are captured automatically on failure

### Test Structure
- `tests/auth.setup.ts` — Global authentication setup
- `tests/rules-engine-crud.spec.ts` — Workflow & Scenario CRUD tests
- `tests/rules-engine-dryrun.spec.ts` — Dry-run execution & results validation

### Selectors
- Tests use `data-testid` attributes for stable element locating
- Key selectors: `rules-editor-pane`, `facts-editor-pane`, `results-viewer-pane`, `run-dryrun-btn`, `new-workflow-btn`, `save-workflow-btn`, `delete-workflow-btn`, `new-scenario-btn`, `update-scenario-btn`, `delete-scenario-btn`
- Modal selectors: `workflow-modal`, `workflow-modal-list`, `workflow-modal-item-{id}`, `workflow-modal-create-btn`, `workflow-modal-cancel-btn`
- Assertion selectors: `assertion-table`, `add-assertion-btn`, `assertion-actual-{id}`
- Empty state: `workflow-list-empty`

---

## Human Intervention

- Developers manually adjust Monaco Editor configuration and themes
- Review schema definitions in `schema.js` before committing
- Validate API call patterns against backend OpenAPI spec
- Approve agent-generated UI changes via pull requests
