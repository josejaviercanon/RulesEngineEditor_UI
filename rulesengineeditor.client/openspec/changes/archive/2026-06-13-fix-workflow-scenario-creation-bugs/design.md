## Context

The RulesEngineEditor is a React 19 + Vite application with a custom `useReducer`-based state store (`useRulesReducer.js`). Workflow and scenario CRUD is handled through `apiClient.js` (axios with localStorage fallback). The `WorkflowModal.jsx` component provides a popup for listing, loading, and creating workflows. The `Sidebar.jsx` component hosts buttons for workflow save/load and scenario create/load/delete.

Currently, the "Create New Workflow" flow in the modal is a two-step process that is invisible to the user:
1. Click "Create New" → loads a JSON template into the editor with `currentWorkflowId: null`
2. User must separately click "Save" in the Sidebar to persist the workflow

This design assumption — that users understand they need to save after creating — causes Bug 1. Bug 2 is caused by a silent no-op when `getWorkflow()` returns falsy data in the modal's selection handler, and by the `currentWorkflowId: null` state left over from Bug 1's flow.

Constraints:
- No TypeScript, no test framework (only ESLint for verification)
- Backend API is unchanged — `POST /api/Rules` and `GET /api/Rules/{id}` already work
- Must maintain localStorage fallback for offline mode

## Goals / Non-Goals

**Goals:**
- "Create New Workflow" in the modal produces a persisted workflow with a real ID before the modal closes
- Loading a workflow from the modal always sets `currentWorkflowId` or shows a clear error
- Scenario creation surfaces meaningful error messages when the API call fails
- First-time users can complete the full create-workflow → create-scenario flow without confusion

**Non-Goals:**
- Replacing `window.prompt` with a proper modal form (future UX improvement, out of scope)
- Adding toast notification library (will use `alert()` for now to stay consistent with existing patterns)
- Changing the backend API contract
- Adding a test framework (noted for future, not this change)

## Decisions

### Decision 1: Replace `LOAD_DEFAULT_TEMPLATE` with async `CREATE_WORKFLOW` action

**Choice**: Create a new async action `CREATE_WORKFLOW` that calls `rulesApi.saveWorkflow()` first, then dispatches state updates with the real ID. The old `LOAD_DEFAULT_TEMPLATE` action is retained for offline fallback only.

**Rationale**: The root cause of Bug 1 is that the template is loaded locally without persistence. By making creation inherently async and persistence-first, we eliminate the gap between "created" and "saved." The old action is kept as a fallback for when the backend is unreachable, preserving offline functionality.

**Alternative considered**: Keep `LOAD_DEFAULT_TEMPLATE` but auto-trigger a save in `Sidebar.handleCreateWorkflow`. Rejected because it splits the creation logic across two files and makes the flow harder to reason about.

### Decision 2: Add explicit error state to `WorkflowModal` selection handler

**Choice**: In `WorkflowModal.handleSelectWorkflow`, add an `else` branch to the `if (res.data)` check that sets a local error state and displays it in the modal. Do not close the modal on failure.

**Rationale**: Silent no-ops are the core UX problem. A visible error message in the modal is the minimum viable fix. The modal staying open allows the user to retry or cancel.

**Alternative considered**: Throw an error and let a global error boundary catch it. Rejected as over-engineered for this scope — the error is local to the modal interaction.

### Decision 3: Propagate API error details in scenario creation

**Choice**: In `Sidebar.handleNewScenario`, capture the error object in the catch block, log it to `console.error`, and include `error.response?.data` details in the alert message.

**Rationale**: The current `catch { alert('Failed to save scenario.') }` discards all diagnostic information. Including the response data helps users understand validation errors (e.g., missing fields) and helps developers debug API issues.

**Alternative considered**: Build a full error notification system. Rejected — out of scope for a bug fix.

### Decision 4: Keep `window.prompt` for name input

**Choice**: Do not replace `window.prompt` with a custom modal form in this change.

**Rationale**: Replacing `window.prompt` would touch many components and is a separate UX improvement. The current bugs are about persistence and error handling, not about the input mechanism.

## Risks / Trade-offs

- **[Auto-save on create may fail silently if backend is down]** → Mitigation: The localStorage fallback in `apiClient.js` already handles this. If both backend and localStorage fail, the catch block will show an error alert.
- **[Alert fatigue from multiple alerts]** → Mitigation: The scenario creation guard alert is only shown when `currentWorkflowId` is null, which should no longer happen after Bug 1 is fixed. The error alert on scenario save failure only fires on actual API errors.
- **[Existing Playwright tests expect separate save step]** → Mitigation: Tests will be updated as part of this change to reflect the new auto-persist behavior. The test file is in `tests/rules-engine-crud.spec.ts`.
- **[Race condition: user clicks "Create New" multiple times before API responds]** → Mitigation: Add a simple `isCreating` loading state to the modal that disables the button during the API call.
