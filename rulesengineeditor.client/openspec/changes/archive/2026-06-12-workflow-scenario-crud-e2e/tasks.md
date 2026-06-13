## 1. Backend Repository Layer

- [x] 1.1 Add `SaveWorkflowAsync` method to `IRulesRepository.cs` and `RulesRepository.cs`
- [x] 1.2 Add `UpdateWorkflowAsync` method to `IRulesRepository.cs` and `RulesRepository.cs`
- [x] 1.3 Add `DeleteWorkflowAsync` method to `IRulesRepository.cs` and `RulesRepository.cs`
- [x] 1.4 Add `GetScenariosByWorkflowIdAsync` method to `IRulesRepository.cs` and `RulesRepository.cs`
- [x] 1.5 Add `GetScenarioByIdAsync` method to `IRulesRepository.cs` and `RulesRepository.cs`
- [x] 1.6 Add `UpdateScenarioAsync` method to `IRulesRepository.cs` and `RulesRepository.cs`
- [x] 1.7 Add `DeleteScenarioAsync` method to `IRulesRepository.cs` and `RulesRepository.cs`
- [x] 1.8 Configure cascade delete for `WorkflowDefinitions` → `WorkflowTestScenarios` in EF Core (or handle in repository)

## 2. Backend Controller Layer

- [x] 2.1 Implement `GET /api/Rules/{id}` action in `RulesController.cs`
- [x] 2.2 Implement `POST /api/Rules` action in `RulesController.cs`
- [x] 2.3 Implement `PUT /api/Rules/{id}` action in `RulesController.cs`
- [x] 2.4 Implement `DELETE /api/Rules/{id}` action in `RulesController.cs`
- [x] 2.5 Implement `GET /api/Rules/scenarios?workflowId={id}` action in `RulesController.cs`
- [x] 2.6 Implement `GET /api/Rules/scenarios/{id}` action in `RulesController.cs`
- [x] 2.7 Implement `PUT /api/Rules/scenarios/{id}` action in `RulesController.cs`
- [x] 2.8 Implement `DELETE /api/Rules/scenarios/{id}` action in `RulesController.cs`
- [x] 2.9 Verify all new endpoints return correct HTTP status codes (200, 201, 204, 404, 409)

## 3. OpenAPI Specification

- [x] 3.1 Add `GET /api/Rules/{id}` path and response schema to `Api/v1.yaml`
- [x] 3.2 Add `POST /api/Rules` path, request body, and response schema to `Api/v1.yaml`
- [x] 3.3 Add `PUT /api/Rules/{id}` path, request body, and response schema to `Api/v1.yaml`
- [x] 3.4 Add `DELETE /api/Rules/{id}` path to `Api/v1.yaml`
- [x] 3.5 Add `GET /api/Rules/scenarios` path with `workflowId` query param to `Api/v1.yaml`
- [x] 3.6 Add `GET /api/Rules/scenarios/{id}` path and response schema to `Api/v1.yaml`
- [x] 3.7 Add `PUT /api/Rules/scenarios/{id}` path, request body, and response schema to `Api/v1.yaml`
- [x] 3.8 Add `DELETE /api/Rules/scenarios/{id}` path to `Api/v1.yaml`
- [x] 3.9 Validate `Api/v1.yaml` with a YAML linter and verify schema consistency

## 4. Frontend Workflow-Scenario Lifecycle

- [x] 4.1 Update `handleSaveNewWorkflow` in `Sidebar.jsx` to dispatch `CLEAR_SCENARIO` after successful save
- [x] 4.2 Update `handleLoadWorkflow` in `Sidebar.jsx` to dispatch `CLEAR_SCENARIO` before loading new workflow rules
- [x] 4.3 Verify `useEffect` on `currentWorkflowId` in `Sidebar.jsx` correctly fetches scenarios for the new workflow
- [x] 4.4 Update `handleDeleteWorkflow` in `Sidebar.jsx` to ensure `CLEAR_SCENARIO` is dispatched when the active workflow is deleted
- [x] 4.5 Verify `useRulesReducer.js` handles `CLEAR_SCENARIO` correctly (resets `currentScenarioId`, `currentFacts`, `activeScenario`, `assertions`)

## 5. E2E Test Selectors

- [x] 5.1 Add `data-testid="scenario-item-<id>"` (or stable pattern) to scenario list items in `Sidebar.jsx`
- [x] 5.2 Add `data-testid="new-scenario-btn"` to the "Save Scenario" button in `Sidebar.jsx`
- [x] 5.3 Add `data-testid="update-scenario-btn"` to the "Update Scenario" button in `Sidebar.jsx`
- [x] 5.4 Add `data-testid="delete-scenario-btn"` to the scenario delete action in `Sidebar.jsx`
- [x] 5.5 Verify existing workflow selectors (`new-workflow-btn`, `save-workflow-btn`, `delete-workflow-btn`) are present and stable

## 6. E2E Test Implementation

- [x] 6.1 Add Playwright test: "Selecting a workflow loads its scenarios" to `tests/rules-engine-crud.spec.ts`
- [x] 6.2 Add Playwright test: "Changing workflow reloads scenario list" to `tests/rules-engine-crud.spec.ts`
- [x] 6.3 Add Playwright test: "Creating new workflow clears scenario state" to `tests/rules-engine-crud.spec.ts`
- [x] 6.4 Add Playwright test: "Create scenario and verify facts load" to `tests/rules-engine-crud.spec.ts`
- [x] 6.5 Add Playwright test: "Update scenario facts and expected output" to `tests/rules-engine-crud.spec.ts`
- [x] 6.6 Add Playwright test: "Delete active scenario clears editor state" to `tests/rules-engine-crud.spec.ts`
- [x] 6.7 Add backend health-check or seeding helper in Playwright setup to ensure tests have data
- [x] 6.8 Run full e2e suite (`npx playwright test`) and verify all new tests pass

## 7. Integration Verification

- [x] 7.1 Run backend and verify all new endpoints respond correctly via `curl` or Scalar UI
- [x] 7.2 Run frontend dev server and verify workflow-scenario lifecycle manually
- [x] 7.3 Verify frontend falls back to `localStorage` when backend is unreachable
- [x] 7.4 Run `npm run lint` in `rulesengineeditor.client/` and fix any ESLint errors
- [x] 7.5 Run `npm run build` and verify no build errors
