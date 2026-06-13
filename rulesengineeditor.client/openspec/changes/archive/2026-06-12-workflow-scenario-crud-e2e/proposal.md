## Why

The frontend already implements full CRUD UI for Workflow Test Scenarios and calls backend endpoints, but the backend is missing most of the required CRUD endpoints (only `POST /api/Rules/scenarios` exists). Additionally, the frontend lacks explicit lifecycle behavior for workflow-scenario binding: when a user selects or changes a workflow, scenarios must load automatically; when a user creates a new workflow, any previously loaded scenarios must be cleared. Finally, the existing Playwright e2e tests do not comprehensively cover the full workflow-scenario lifecycle (select workflow → load scenarios → CRUD scenarios → change workflow → clean state). This change closes the backend gap, hardens the frontend lifecycle, and delivers complete e2e coverage.

## What Changes

- **Backend**: Implement missing CRUD endpoints for Workflow Test Scenarios:
  - `GET /api/Rules/scenarios?workflowId={id}` — list scenarios by workflow
  - `GET /api/Rules/scenarios/{id}` — get single scenario
  - `PUT /api/Rules/scenarios/{id}` — update scenario
  - `DELETE /api/Rules/scenarios/{id}` — delete scenario
- **Backend**: Implement missing Workflow CRUD endpoints:
  - `GET /api/Rules/{id}` — get single workflow
  - `POST /api/Rules` — create workflow
  - `PUT /api/Rules/{id}` — update workflow
  - `DELETE /api/Rules/{id}` — delete workflow
- **Backend**: Update `Api/v1.yaml` OpenAPI spec to document all new endpoints and their request/response schemas.
- **Frontend**: Harden workflow-scenario lifecycle in `Sidebar.jsx` and `useRulesReducer.js`:
  - On `SET_WORKFLOW` (select or change workflow), automatically fetch and display scenarios for that workflow.
  - On creating a new workflow (after `saveWorkflow` success), dispatch `CLEAR_SCENARIO` to clean up any previously loaded scenario state.
- **E2E Tests**: Expand Playwright tests to cover:
  - Selecting a workflow loads its scenarios in the sidebar.
  - Changing from one workflow to another reloads the scenario list.
  - Creating a new workflow clears the scenario list and any loaded scenario editor state.
  - Full scenario CRUD (create, read, update, delete) against the selected workflow.
  - Assertions that verify scenario facts and expected output are correctly loaded into the editor.

## Capabilities

### New Capabilities
- `backend-scenario-crud`: Backend CRUD endpoints for Workflow Test Scenarios (GET list by workflow, GET by id, PUT, DELETE) plus OpenAPI spec updates.
- `backend-workflow-crud`: Backend CRUD endpoints for Workflow Definitions (GET by id, POST, PUT, DELETE) plus OpenAPI spec updates.
- `workflow-scenario-lifecycle`: Frontend state management and UI behavior for binding scenarios to workflow selection, including auto-load and clean-up on new workflow creation.
- `scenario-crud-e2e`: Playwright end-to-end tests covering the complete workflow-scenario lifecycle and scenario CRUD operations.

### Modified Capabilities
- `scenario-management`: Requirement change — scenario list must auto-reload when workflow selection changes, and scenario state must be cleared when a new workflow is created.
- `playwright-e2e-testing`: Requirement change — expand existing e2e suite to include workflow-scenario lifecycle tests and full scenario CRUD coverage.

## Impact

- **Backend API**: New endpoints in `RulesController.cs`; new repository methods in `IRulesRepository.cs` / `RulesRepository.cs`; `Api/v1.yaml` expanded.
- **Frontend State**: `useRulesReducer.js` may need new or refined actions for lifecycle clean-up; `Sidebar.jsx` workflow save handlers updated.
- **Frontend UI**: No new components — behavior changes in existing `Sidebar.jsx`.
- **E2E Tests**: `tests/rules-engine-crud.spec.ts` expanded; may add new spec file for lifecycle tests.
- **Dependencies**: No new npm packages; backend requires existing EF Core / ASP.NET Core infrastructure.
