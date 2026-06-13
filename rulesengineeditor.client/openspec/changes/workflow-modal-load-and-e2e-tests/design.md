## Context

The RulesEngineEditor currently auto-loads all workflows into the Sidebar on mount via a `useEffect` in `Sidebar.jsx`. The editors are pre-populated with sample JSON data from `initialState` in `useRulesReducer.js`. The "New" button uses `window.prompt()` for naming, which is a poor UX. Scenario assertions are supposed to re-evaluate after dry-run but the user has reported they may not update correctly.

The app uses React 19 + Vite 8 + Tailwind CSS v4, with no TypeScript. State is managed via `useReducer` with string-based JSON. The API client (`apiClient.js`) provides full CRUD for workflows and scenarios with localStorage fallback. Playwright E2E tests exist but need updating for the new modal-based workflow loading.

## Goals / Non-Goals

**Goals:**
- Start the app with empty editors — no pre-loaded workflows or sample data
- Replace the auto-loaded workflow list with an on-demand modal triggered by a "New" button
- Load a default simple Rules JSON template when creating a new workflow
- Fetch and display scenarios only after a workflow is explicitly loaded
- Ensure assertion actual-value fields correctly update after each dry-run
- Add comprehensive E2E tests covering all CRUD operations for Workflows and Scenarios

**Non-Goals:**
- Visual workflow editor (Phase 2.0 — out of scope)
- Authentication changes (Passkey/FIDO2 remains as-is)
- Backend API changes (all changes are frontend-only)
- Adding a test framework beyond existing Playwright setup
- Changing the state management approach (useReducer remains)

## Decisions

### Decision 1: Modal vs. Dropdown for Workflow Selection

**Choice**: Modal dialog with workflow list + "Create New" option.

**Rationale**: A modal provides a clear, focused interaction that blocks the main UI until a decision is made. It can display workflow metadata (name, version, status) more richly than a dropdown. It also naturally accommodates the "Create New" action alongside the list.

**Alternatives considered**:
- *Dropdown in Sidebar*: Too cramped, limited metadata display, harder to add "Create New" action cleanly.
- *Separate page/route*: Overkill for a selection step, breaks the single-page editor flow.

### Decision 2: Empty Initial State

**Choice**: Set `currentRules`, `currentFacts`, and `currentSettings` to empty JSON objects (`"{}"`) in `initialState` instead of sample data. Remove the auto-load `useEffect` from `Sidebar.jsx`.

**Rationale**: Empty editors clearly signal to the user that they need to take action (click "New"). Sample data can be confusing — users may not realize it's not connected to a saved workflow.

**Alternatives considered**:
- *Keep sample data but hide workflow list*: Users would still see pre-filled content without context.
- *Show a welcome/landing screen*: Adds complexity; empty editors with a prominent "New" button is simpler.

### Decision 3: Default Template Structure

**Choice**: A minimal Rules JSON template with a single workflow containing one rule:
```json
[{
  "WorkflowName": "NewWorkflow",
  "Rules": [{
    "RuleName": "DefaultRule",
    "SuccessEvent": "10",
    "ErrorMessage": "One or more conditions failed.",
    "ErrorType": "Error",
    "RuleExpressionType": "LambdaExpression",
    "Expression": "input1 == true"
  }]
}]
```

**Rationale**: This matches the schema defined in `src/services/schema.js` and gives users a valid starting point that can be immediately saved and dry-run tested.

### Decision 4: Modal Implementation Approach

**Choice**: Build a simple inline modal component (`WorkflowModal.jsx`) using Tailwind CSS, without adding a third-party modal library.

**Rationale**: The modal is simple (list + buttons), and adding a dependency like `@headlessui/react` or `radix-ui` is unnecessary overhead for this project's scope. Tailwind utility classes provide sufficient styling for overlay, backdrop, and positioning.

### Decision 5: Assertion Field Update Verification

**Choice**: Audit the `evaluatePath()` function in `AssertionTable.jsx` and the `testResult` data flow to ensure actual values are correctly resolved. Add a `data-testid` on each actual-value cell for E2E test verification.

**Rationale**: The current `evaluatePath()` converts paths like `[0].IsSuccess` to dot-separated keys. If the backend returns camelCase (`ruleResultTree` vs `RuleResultTree`), path resolution may fail. The fix is to ensure path evaluation handles both casings and that the `testResult` prop is correctly passed from `App.jsx`.

### Decision 6: E2E Test Strategy

**Choice**: Rewrite existing `rules-engine-crud.spec.ts` to work with the modal-based workflow loading. Add new test scenarios for: modal open/close, workflow selection from modal, default template creation, assertion field updates after dry-run, and comprehensive CRUD validation.

**Rationale**: The existing tests assume workflows are listed in the Sidebar on load. With the modal change, tests must first click "New" to open the modal, then select or create a workflow. The `data-testid` attributes from the existing spec provide stable selectors.

## Risks / Trade-offs

- **[Risk] Modal blocks workflow list visibility** → Users can no longer see all workflows at a glance. **Mitigation**: The modal lists all workflows with names and versions. A "Refresh" button in the modal can re-fetch the list.

- **[Risk] Empty editors may confuse existing users** → Users accustomed to sample data may not know what to do. **Mitigation**: The "New" button is prominently placed in the Sidebar header with clear labeling. Empty state can include a subtle hint text.

- **[Risk] Path evaluation in assertions may still fail for nested structures** → Complex JSON paths may not resolve correctly. **Mitigation**: Add robust path parsing that handles both array indices (`[0]`) and dot notation, with fallback logging for debugging.

- **[Risk] E2E test flakiness with modal animations** → Modal open/close transitions may cause timing issues. **Mitigation**: Use Playwright's `waitForSelector` with appropriate timeouts and avoid relying on animation completion.

- **[Trade-off] No third-party modal library** → Slightly more custom code to maintain, but avoids dependency bloat for a simple use case.
