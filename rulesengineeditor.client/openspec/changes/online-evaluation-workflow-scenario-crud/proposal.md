## Why

The RulesEngineEditor currently operates primarily in local sandbox mode. Users cannot reliably run rule evaluations against the real backend, manage (load/save) workflows from the server, or manage test scenarios with expected outcomes. This limits the editor's utility for real-world development and testing. We need to bridge the gap between the local JSON editor and the backend API by enabling online evaluation, workflow CRUD, and scenario CRUD so users can author, persist, and validate rules against the actual RulesEngine backend.

## What Changes

- **Online Dry-Run Evaluation**: Add a toggle/mode to execute dry-run evaluations against the backend API (`POST /api/Rules/dry-run`) instead of the local simulation. Surface backend validation results including `isSuccess`, `ruleResultTree`, and `errorMessage`.
- **Workflow CRUD**: Enable loading a workflow from the backend into the Rules editor, saving the current editor content as a new or updated workflow, and deleting workflows. Wire the Sidebar workflow list with click-to-load and context actions.
- **Scenario CRUD**: Enable creating, loading, saving, and deleting test scenarios linked to a workflow. A scenario captures `mockInputJson` (facts) and optional `expectedOutputJson`. Loading a scenario populates the Facts editor and assertions.
- **Scenario-Driven Validation**: When a scenario is loaded, the dry-run automatically uses the scenario's mock input. After evaluation, compare the actual result tree against the scenario's `expectedOutputJson` and display pass/fail in the assertion area.
- **Backend Result Display**: Enhance the Results Viewer to show backend error messages, overall success status, and per-rule success/failure states from the real `EvaluationResult`.

## Capabilities

### New Capabilities
- `workflow-management`: CRUD operations for workflows — list, load into editor, save current editor content as workflow, update existing workflow, delete workflow.
- `scenario-management`: CRUD operations for test scenarios — create, load (populate facts + expected output), save, delete. Scenarios are linked to a workflow.
- `backend-dry-run`: Execute dry-run evaluation against the backend API, handle `EvaluationResult` response with tree and errors, and fall back to local simulation only when backend is unreachable.
- `scenario-validation`: Compare dry-run results against a scenario's `expectedOutputJson` to produce automated assertions.

### Modified Capabilities
<!-- No existing spec-level behavior changes; these are entirely new capabilities. -->

## Impact

- **State Management** (`useRulesReducer.js`): Add `currentWorkflowId`, `currentScenarioId`, and `onlineMode` fields to track loaded entities and evaluation mode.
- **API Client** (`apiClient.js`): Add `getWorkflow(id)`, `updateWorkflow(id, data)`, `deleteWorkflow(id)`, `getScenario(id)`, `updateScenario(id, data)`, `deleteScenario(id)`. Update `dryRun` to accept `useBackend` flag and return structured `EvaluationResult`.
- **Sidebar** (`Sidebar.jsx`): Add click handlers to load workflows/scenarios, context menus or inline buttons for save/update/delete, and an online/sandbox mode indicator.
- **Facts Editor / Results Viewer**: Load scenario facts into editor; display backend errors and scenario validation results.
- **Assertion Table**: Auto-populate assertions from scenario `expectedOutputJson` when a scenario is loaded.
- **Backend API**: Relies on existing endpoints (`GET /api/Rules`, `POST /api/Rules/dry-run`, `POST /api/Rules/scenarios`) and requires missing endpoints to be added on the backend (GET by ID, PUT, DELETE for workflows and scenarios). The frontend will gracefully degrade to localStorage when backend endpoints are unavailable.
