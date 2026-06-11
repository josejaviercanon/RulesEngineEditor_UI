## 1. State Management & Foundation

- [x] 1.1 Extend `useRulesReducer.js` state shape: add `currentWorkflowId`, `currentScenarioId`, `onlineMode` fields with default values (`null`, `null`, `false`)
- [x] 1.2 Add reducer actions: `SET_WORKFLOW`, `SET_SCENARIO`, `CLEAR_WORKFLOW`, `CLEAR_SCENARIO`, `SET_ONLINE_MODE`
- [x] 1.3 Update `App.jsx` to pass new state fields and dispatchers to child components
- [x] 1.4 Add `onlineMode` toggle UI in `Sidebar.jsx` (toggle switch with "Online Mode" / "Sandbox Mode" label)

## 2. API Client Expansion

- [x] 2.1 Add `getWorkflow(id)` to `apiClient.js` with backend call (`GET /rules/{id}`) and localStorage fallback
- [x] 2.2 Add `updateWorkflow(id, data)` to `apiClient.js` with backend call (`PUT /rules/{id}`) and localStorage fallback
- [x] 2.3 Add `deleteWorkflow(id)` to `apiClient.js` with backend call (`DELETE /rules/{id}`) and localStorage fallback
- [x] 2.4 Add `getScenario(id)` to `apiClient.js` with backend call (`GET /scenarios/{id}`) and localStorage fallback
- [x] 2.5 Add `updateScenario(id, data)` to `apiClient.js` with backend call (`PUT /scenarios/{id}`) and localStorage fallback
- [x] 2.6 Add `deleteScenario(id)` to `apiClient.js` with backend call (`DELETE /scenarios/{id}`) and localStorage fallback
- [x] 2.7 Update `dryRun()` in `apiClient.js` to accept `useBackend` flag; when true, call backend first and fall back to simulation on failure
- [x] 2.8 Update `dryRun()` request shape to include optional `customTypes` array from settings

## 3. Workflow CRUD UI

- [x] 3.1 Wire Sidebar workflow list items with `onClick` to load workflow JSON into Rules editor via `getWorkflow(id)`
- [x] 3.2 Add "Save as New Workflow" button in Sidebar that opens a modal/prompt for workflow name, then calls `saveWorkflow()`
- [x] 3.3 Add "Save Workflow" (update) button in Sidebar that calls `updateWorkflow(currentWorkflowId, data)` when `currentWorkflowId` is set
- [x] 3.4 Add delete action (context menu or inline button) on each workflow item in Sidebar that calls `deleteWorkflow(id)`
- [x] 3.5 Update Sidebar workflow list to refresh after save/update/delete operations
- [x] 3.6 Show visual indicator on the currently loaded workflow in Sidebar (highlight or badge)

## 4. Scenario CRUD UI

- [x] 4.1 Wire Sidebar scenario list items with `onClick` to load scenario into Facts editor and assertions via `getScenario(id)`
- [x] 4.2 Fix the dead "New Scenario" (+) button in Sidebar to open a modal for scenario name, then call `saveScenario()` with current facts and optional expected output
- [x] 4.3 Add "Update Scenario" button that calls `updateScenario(currentScenarioId, data)` when `currentScenarioId` is set
- [x] 4.4 Add delete action on each scenario item in Sidebar that calls `deleteScenario(id)`
- [x] 4.5 Update Sidebar scenario list to refresh after save/update/delete operations
- [x] 4.6 Show visual indicator on the currently loaded scenario in Sidebar
- [x] 4.7 Filter scenario list by `currentWorkflowId` (only show scenarios for the loaded workflow)

## 5. Backend Dry-Run Integration

- [x] 5.1 Update `App.jsx` `handleDryRun()` to read `onlineMode` from state and pass `useBackend` flag to `rulesApi.dryRun()`
- [x] 5.2 Update `ResultsViewerPane.jsx` to display `errorMessage` from backend when present (prominent error banner)
- [x] 5.3 Update `ResultsViewerPane.jsx` tree renderer to show per-node `isSuccess` status with color coding (green for true, red for false)
- [x] 5.4 Update `ResultsViewerPane.jsx` to display `exceptionMessage` on failed nodes
- [x] 5.5 Update `ResultsViewerPane.jsx` to show overall `isSuccess` status at the top of results
- [x] 5.6 Ensure "Sandbox Mode" banner is shown when `isMockMode` is true

## 6. Scenario Validation

- [x] 6.1 Create utility function `generateAssertionsFromExpectedOutput(expectedOutputJson)` that parses JSON and produces path assertions
- [x] 6.2 Update scenario load flow: after loading a scenario with `expectedOutputJson`, auto-populate assertion table via `ADD_ASSERTION` dispatch
- [x] 6.3 Update `AssertionTable.jsx` to show scenario-derived assertions distinctly (e.g., label "Auto" vs "Manual")
- [x] 6.4 Add overall scenario validation banner in `AssertionTable.jsx` or `ResultsViewerPane.jsx`: "Scenario Passed" (green) or "Scenario Failed" (red) based on assertion results
- [x] 6.5 Ensure assertions are re-evaluated automatically whenever `testResult` changes

## 7. Settings & Custom Types

- [x] 7.1 Update `schema.js` or settings editor to support `customTypes` array input
- [x] 7.2 Ensure `customTypes` from settings are included in the dry-run request when `onlineMode` is true

## 8. Testing & Verification

- [x] 8.1 Run `npm run lint` to verify no ESLint errors in modified files
- [x] 8.2 Test workflow CRUD with backend unreachable (verify localStorage fallback)
- [x] 8.3 Test scenario CRUD with backend unreachable (verify localStorage fallback)
- [x] 8.4 Test online dry-run toggle (verify backend call when ON, simulation when OFF)
- [x] 8.5 Test scenario loading populates facts and assertions correctly
- [x] 8.6 Test assertion re-evaluation after dry-run
- [x] 8.7 Verify `npm run build` completes without errors
