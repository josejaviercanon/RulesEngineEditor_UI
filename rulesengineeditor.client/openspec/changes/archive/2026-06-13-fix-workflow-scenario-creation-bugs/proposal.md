## Why

Two critical UX bugs prevent core workflows from functioning on fresh installations. Clicking "Create New Workflow" in the modal loads a template locally but never persists it — `currentWorkflowId` remains `null`, the workflow list stays empty, and the user receives no feedback, creating the impression the button is broken. Separately, loading an existing workflow from the modal can silently fail when the backend response is falsy, and even when it succeeds, scenario creation is blocked if the workflow was never saved (Bug 1 flow). These bugs make the application unusable for first-time users.

## What Changes

- **Auto-persist on "Create New Workflow"**: The modal's "Create New" button will immediately call `POST /api/Rules` (or localStorage fallback) to save the workflow, receive a real `WorkflowDefinitionId`, and set `currentWorkflowId` — instead of loading a local-only template with a `null` ID.
- **Error handling for workflow selection in modal**: When `getWorkflow(id)` returns null/falsy data, the modal will display an error message instead of silently doing nothing.
- **Error handling for scenario creation**: The `handleNewScenario` function will surface API error details (not just a generic alert) and log errors to the console for debugging.
- **User feedback on workflow creation**: A success message or toast will confirm that the workflow was created and saved, replacing the current silent modal close.
- **Guard clarity**: The scenario creation guard (`!state.currentWorkflowId`) will provide a more descriptive message distinguishing between "no workflow loaded" and "workflow not yet saved."

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `workflow-management`: The "Save new workflow" requirement must be triggered automatically as part of the "Create New" modal flow — the workflow must be persisted and assigned a real ID before the modal closes, not as a separate manual save step.
- `scenario-management`: The "Create scenario" requirement must include proper error propagation from the API call (not silently discarding the error object) and must guarantee that `currentWorkflowId` is reliably set after loading a workflow from the modal.

## Impact

- **Components**: `WorkflowModal.jsx` (create handler, select handler), `Sidebar.jsx` (create workflow handler, new scenario handler), `useRulesReducer.js` (`LOAD_DEFAULT_TEMPLATE` action).
- **Services**: `apiClient.js` — no API contract changes, but callers must handle responses more robustly.
- **State**: The `LOAD_DEFAULT_TEMPLATE` reducer case will be replaced or augmented with a `CREATE_AND_SAVE_WORKFLOW` async flow that persists before updating state.
- **Tests**: Existing Playwright E2E tests (`rules-engine-crud.spec.ts`) that expect a separate save step after "Create New" will need updating to reflect the new auto-persist behavior.
- **APIs**: No backend changes required — the existing `POST /api/Rules` endpoint is sufficient.
