## Context

The RulesEngineEditor frontend (`rulesengineeditor.client/`) is a React 19 + Vite application that edits JSON-based workflow rules and test scenarios. The backend is an ASP.NET Core API with EF Core. The frontend already contains complete UI and API client code for Workflow and Scenario CRUD, but the backend is missing most endpoints (documented in `backend-crud-instructions.json`). The frontend also lacks explicit state lifecycle behavior: when a user creates a new workflow, previously loaded scenario state should be cleared; when switching workflows, the scenario list should reload. Existing Playwright e2e tests cover basic CRUD but do not validate the workflow-scenario binding lifecycle.

## Goals / Non-Goals

**Goals:**
- Implement all missing backend CRUD endpoints for both Workflow Definitions and Workflow Test Scenarios.
- Update the OpenAPI spec (`Api/v1.yaml`) to accurately reflect the complete API surface.
- Harden frontend state management so that scenario state is automatically cleaned up when a new workflow is created, and scenarios reload when the selected workflow changes.
- Expand Playwright e2e tests to cover the full workflow-scenario lifecycle: select workflow → load scenarios → CRUD scenarios → switch workflow → state cleanup.

**Non-Goals:**
- No visual redesign of the Sidebar or editor panes — behavior changes only.
- No new npm dependencies or test frameworks.
- No changes to the dry-run evaluation logic or rule engine semantics.
- No authentication implementation (auth is a future phase).

## Decisions

### Decision: Implement backend endpoints using existing ASP.NET Core MVC patterns
**Rationale**: The backend already has a `RulesController` and `RulesRepository`. Adding missing CRUD actions follows the established pattern and minimizes architectural risk. The repository already exposes `GetAllWorkflowsAsync`, `GetWorkflowByIdAsync`, and `SaveScenarioAsync`; we extend it with `SaveWorkflowAsync`, `UpdateWorkflowAsync`, `DeleteWorkflowAsync`, `GetScenariosByWorkflowIdAsync`, `GetScenarioByIdAsync`, `UpdateScenarioAsync`, and `DeleteScenarioAsync`.

**Alternatives considered**: 
- Minimal API approach — rejected because the existing codebase uses Controller + Repository pattern; mixing patterns adds inconsistency.
- GraphQL — rejected as overkill for simple CRUD and inconsistent with existing REST surface.

### Decision: Keep frontend API client (`apiClient.js`) unchanged
**Rationale**: The frontend already has all the axios methods (`getWorkflow`, `saveWorkflow`, `updateWorkflow`, `deleteWorkflow`, `getScenarios`, `getScenario`, `saveScenario`, `updateScenario`, `deleteScenario`). Once the backend implements the matching endpoints, the frontend will work without modification. This reduces risk and scope.

**Alternatives considered**:
- Refactor API client to a new library — rejected as unnecessary since axios methods already match the desired contract.

### Decision: Use existing `useReducer` actions for lifecycle cleanup rather than introducing new state management
**Rationale**: The reducer already has `CLEAR_SCENARIO` and `SET_WORKFLOW` actions. The `Sidebar.jsx` workflow creation handler (`handleSaveNewWorkflow`) can simply dispatch `CLEAR_SCENARIO` after a successful save. This is the minimal change.

**Alternatives considered**:
- Introduce a new `WORKFLOW_CREATED` action — rejected because `CLEAR_SCENARIO` already achieves the desired state reset.
- Move scenario loading entirely into the reducer — rejected because the Sidebar already handles side effects via `useEffect` on `currentWorkflowId`, which is a clean pattern.

### Decision: Expand existing `tests/rules-engine-crud.spec.ts` rather than creating a new spec file
**Rationale**: The existing spec already covers workflow and scenario CRUD. Adding lifecycle tests (workflow selection loads scenarios, workflow change reloads, new workflow clears state) keeps related e2e logic together and reuses page object helpers.

**Alternatives considered**:
- Create `tests/workflow-scenario-lifecycle.spec.ts` — rejected because the existing spec file is small enough to absorb the new cases without becoming unwieldy.

### Decision: Update `Api/v1.yaml` inline rather than generating from code
**Rationale**: The OpenAPI spec is currently hand-maintained. Adding the missing endpoint definitions manually ensures the spec remains the contract of record and can be reviewed independently.

**Alternatives considered**:
- Use Swashbuckle or NSwag to auto-generate — rejected because the project does not currently use those tools; adding them is out of scope.

## Risks / Trade-offs

- **[Risk] Backend endpoints may not be fully implemented by the time frontend changes are ready** → **Mitigation**: The frontend API client has robust `localStorage` fallback for every endpoint. The app will continue to function in offline/mock mode until the backend is deployed.
- **[Risk] E2E tests may be flaky if backend is not running** → **Mitigation**: Playwright tests are configured to run against the live backend. The test setup should verify backend health before executing CRUD tests, or skip with a clear message. The existing `setup` project handles auth; we can add a health-check step.
- **[Risk] OpenAPI spec drift after this change** → **Mitigation**: Add a CI check (future proposal) that validates the spec against the backend controller actions. For now, manual review of `Api/v1.yaml` during implementation is required.
- **[Risk] `Sidebar.jsx` is already 412 lines and handles both workflow and scenario logic** → **Mitigation**: This change does not add new UI components or significantly increase line count. The lifecycle changes are 2-3 dispatch calls. A future refactoring proposal can extract sub-components if needed.

## Migration Plan

1. **Backend first**: Implement repository methods, then controller actions, then verify with `curl` or Swagger/Scalar.
2. **OpenAPI update**: Add new endpoint schemas to `Api/v1.yaml` and validate with a YAML linter.
3. **Frontend lifecycle**: Update `Sidebar.jsx` save handlers and `useEffect` hooks; verify with manual UI testing.
4. **E2E tests**: Expand Playwright spec; run against local dev server + backend.
5. **Rollout**: No database migration needed — the entities (`WorkflowDefinitions`, `WorkflowTestScenarios`) already exist. The new endpoints simply expose existing tables.

## Open Questions

- Should the backend `DELETE /api/Rules/{id}` enforce cascade deletion of child scenarios, or should the frontend delete scenarios first? **Recommendation**: Backend should cascade-delete scenarios to maintain referential integrity, or block deletion if scenarios exist. Document the chosen behavior in the API spec.
- Should `PUT /api/Rules/scenarios/{id}` allow changing the `WorkflowDefinitionId` (moving a scenario to another workflow)? **Recommendation**: No — scenarios are bound to a workflow at creation time. Moving scenarios is a future feature.
