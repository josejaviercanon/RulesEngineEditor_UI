## Context

The RulesEngineEditor is a React 19 + Vite application that provides a JSON-first editor for Microsoft RulesEngine workflows. Currently, the editor operates primarily in local sandbox mode: workflows and scenarios are stored in localStorage, dry-run evaluation uses a naive local simulation that always returns success, and the Sidebar lists workflows/scenarios as read-only items with no click-to-load functionality.

The backend exposes a real RulesEngine evaluation endpoint (`POST /api/Rules/dry-run`) and supports saving workflows (`POST /api/Rules`) and scenarios (`POST /api/Rules/scenarios`). However, the frontend does not leverage these capabilities for true online testing or persistent CRUD operations. The existing `useReducer` state holds only raw JSON strings with no concept of "current workflow" or "current scenario."

This design bridges the frontend and backend by introducing entity tracking, backend-first evaluation, and full CRUD for workflows and scenarios while maintaining graceful localStorage fallback when the backend is unreachable.

## Goals / Non-Goals

**Goals:**
- Enable users to run dry-run evaluations against the real backend API and see actual validation results (success/failure per rule, error messages).
- Allow users to load a workflow from the backend into the Rules editor, save the current editor content as a new workflow, update an existing workflow, and delete workflows.
- Allow users to create, load, save, and delete test scenarios linked to a workflow. Loading a scenario populates the Facts editor with `mockInputJson` and the assertion area with `expectedOutputJson`.
- Automatically compare dry-run results against a loaded scenario's expected output to produce pass/fail assertions.
- Maintain localStorage fallback for all operations when the backend is unavailable (sandbox mode).

**Non-Goals:**
- Backend API changes (e.g., adding missing PUT/DELETE endpoints) are out of scope for this frontend change. The frontend will attempt backend calls and fall back to localStorage if endpoints return 404/405.
- Visual workflow editor (drag-and-drop nodes) — this is Phase 2.0 per the roadmap.
- Authentication/authorization UI changes — auth is handled separately.
- Real-time collaboration or versioning of workflows.

## Decisions

### 1. State Shape Extension
**Decision:** Add `currentWorkflowId`, `currentScenarioId`, and `onlineMode` to the existing `useRulesReducer` state rather than introducing a new state library.
**Rationale:** The existing reducer is lightweight and sufficient. Adding three fields keeps the mental model simple and avoids introducing Redux/Zustand complexity for a single feature. The reducer already handles raw JSON strings; adding entity IDs is a minimal extension.
**Alternative considered:** Zustand store — rejected because the existing architecture works well with `useReducer` and the team wants to avoid new dependencies.

### 2. API Client Expansion Pattern
**Decision:** Add missing CRUD methods (`getWorkflow`, `updateWorkflow`, `deleteWorkflow`, `getScenario`, `updateScenario`, `deleteScenario`) to the existing `apiClient.js` using the same try/catch + localStorage fallback pattern already established.
**Rationale:** Consistency with existing code. The backend may not yet support all endpoints; the fallback ensures the UI remains functional during backend development.
**Alternative considered:** GraphQL or React Query — rejected to keep the stack simple and consistent with the existing axios-based approach.

### 3. Online vs Sandbox Mode Toggle
**Decision:** Add a global `onlineMode` boolean toggle in the Sidebar (or top bar). When `onlineMode` is true, dry-run calls the backend first; when false, it uses local simulation. All CRUD operations attempt the backend first regardless of mode, but the toggle controls evaluation behavior.
**Rationale:** Users may want to test locally while still saving to the backend. Separating "evaluation mode" from "persistence mode" gives flexibility.
**Alternative considered:** Per-operation toggles — rejected as too granular and confusing.

### 4. Scenario-Driven Assertions
**Decision:** When a scenario with `expectedOutputJson` is loaded, parse the expected output and auto-populate the assertion table. After a dry-run, compare the actual result tree against the expected output using the existing path-based evaluator.
**Rationale:** Reuses the existing `AssertionTable` component and `evaluatePath` logic. The expected output JSON structure naturally maps to path assertions.
**Alternative considered:** Dedicated scenario comparison panel — rejected to avoid new UI complexity; the assertion table is the right place for pass/fail indicators.

### 5. Workflow Loading Strategy
**Decision:** When a workflow is clicked in the Sidebar, fetch its full JSON content and replace `currentRules` in the editor. Track the loaded workflow ID so subsequent "Save" operations can PATCH/PUT instead of POST.
**Rationale:** The editor is JSON-first; loading a workflow means loading its `JsonContent` into the Monaco editor. Tracking the ID enables update-vs-create discrimination.
**Alternative considered:** Merge workflow JSON with editor state — rejected because the editor owns the canonical JSON and merging is error-prone.

### 6. Error Handling for Backend Dry-Run
**Decision:** The backend `EvaluationResult` returns `isSuccess` (overall), `ruleResultTree` (nested results), and `errorMessage` (compilation/execution errors). The ResultsViewerPane will display `errorMessage` prominently when present, and render the tree with color-coded success/failure nodes.
**Rationale:** Compilation errors (e.g., invalid rule expressions) are common and must be surfaced clearly. The existing tree renderer can be enhanced with node-level status colors.

## Risks / Trade-offs

- **[Risk] Backend endpoints missing (GET/PUT/DELETE for workflows and scenarios)** → **Mitigation:** The API client will attempt backend calls and fall back to localStorage on any error (404, 405, 500). The UI will show a "Sandbox Mode" indicator when fallback is active. Once backend endpoints are added, the frontend will automatically use them without code changes.
- **[Risk] Proxy path mismatch between Vite dev server and backend** → **Mitigation:** The API client uses relative paths (`/rules`, `/scenarios`) which are proxied by Vite. If the backend requires `/api` prefix, the Vite proxy config or API client baseURL can be adjusted. This is a configuration issue, not an architectural one.
- **[Risk] Large workflow JSON causing performance issues in Monaco** → **Mitigation:** This is an existing risk, not introduced by this change. The editor already handles large JSON. No new data volumes are introduced.
- **[Risk] Concurrent edits to same workflow/scenario** → **Mitigation:** Out of scope. No real-time collaboration is planned. Users may overwrite each other's changes; this is acceptable for a single-user editor.
- **[Trade-off] localStorage fallback may diverge from backend state** → Users working offline will have local data that may conflict with backend data when they reconnect. This is acceptable for a development tool; we do not attempt automatic sync.

## Migration Plan

No migration needed. This is a feature addition. Existing localStorage data remains compatible. The new state fields (`currentWorkflowId`, `currentScenarioId`, `onlineMode`) will default to `null`/`false` and not affect existing behavior.

## Open Questions

1. Does the backend HTTP profile (`http://localhost:5064`) serve the same paths as the HTTPS profile (`https://localhost:7119/api/Rules`), or is there a path prefix difference? This affects the Vite proxy and API client configuration.
2. What is the exact request/response shape for `PUT /api/Rules/{id}` and `PUT /api/Rules/scenarios/{id}`? The OpenAPI spec does not document these, so the frontend will assume standard REST patterns until the backend contract is finalized.
3. Should the assertion table support deep JSON diff (object comparison) in addition to the existing string-based path evaluation? The current `evaluatePath` returns strings; comparing complex objects may require a diff utility.
