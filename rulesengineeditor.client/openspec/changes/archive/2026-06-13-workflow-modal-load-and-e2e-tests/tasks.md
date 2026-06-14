## 1. Initial State & Reducer Changes

- [x] 1.1 Update `initialState` in `src/hooks/useRulesReducer.js` — set `currentRules` to `'[]'`, `currentFacts` to `'{}'`, and `assertions` to `[]` (remove sample data)
- [x] 1.2 Update `CLEAR_SCENARIO` reducer case to reset `currentFacts` to `'{}'` and `assertions` to `[]` instead of referencing `initialState` values
- [x] 1.3 Add a `LOAD_DEFAULT_TEMPLATE` action type to the reducer that sets `currentRules` to the default template JSON with a given workflow name

## 2. WorkflowModal Component

- [x] 2.1 Create `src/components/WorkflowModal.jsx` — a modal dialog component with backdrop, centered card, title "Select or Create Workflow", workflow list area, "Create New Workflow" button, and "Cancel" button
- [x] 2.2 Implement workflow list fetching inside the modal using `rulesApi.getWorkflows()` with a loading state and error handling
- [x] 2.3 Add workflow item click handler that calls `rulesApi.getWorkflow(id)`, dispatches `SET_WORKFLOW`, fetches scenarios, and closes the modal
- [x] 2.4 Add "Create New Workflow" handler that prompts for a name, dispatches `LOAD_DEFAULT_TEMPLATE` (or `SET_RULES` with template JSON), clears scenarios, and closes the modal
- [x] 2.5 Add backdrop click and Escape key handlers to close the modal without action
- [x] 2.6 Add `data-testid` attributes: `workflow-modal`, `workflow-modal-list`, `workflow-modal-item-{id}`, `workflow-modal-create-btn`, `workflow-modal-cancel-btn`
- [x] 2.7 Style the modal with Tailwind CSS — dark theme matching the app (slate-950 background, lime-400 accents, proper z-index overlay)

## 3. Sidebar Refactor

- [x] 3.1 Remove the auto-load `useEffect` that calls `loadWorkflows()` on mount in `src/components/Sidebar.jsx`
- [x] 3.2 Replace the "New" button (`handleSaveNewWorkflow`) with a handler that opens the `WorkflowModal` — set `isModalOpen` state to `true`
- [x] 3.3 Add `WorkflowModal` import and render it conditionally based on `isModalOpen` state, passing `onClose`, `onSelectWorkflow`, and `onCreateWorkflow` callbacks
- [x] 3.4 Add empty state hint text in the workflow list area: "Click New to load or create a workflow"
- [x] 3.5 Ensure scenarios are only fetched when `state.currentWorkflowId` changes (existing `useEffect` dependency is correct — verify it doesn't fire on mount with null ID)
- [x] 3.6 Add `data-testid="new-workflow-btn"` to the New button
- [x] 3.7 Add `data-testid="workflow-list-empty"` to the empty state hint

## 4. Assertion Table Fix

- [x] 4.1 Audit and improve `evaluatePath()` in `src/components/AssertionTable.jsx` to handle both PascalCase (`IsSuccess`, `RuleResultTree`) and camelCase (`isSuccess`, `ruleResultTree`) property names by trying both casings when a key is not found
- [x] 4.2 Add `data-testid="assertion-actual-{id}"` to each actual value cell for E2E test targeting
- [x] 4.3 Verify that `testResult` prop correctly receives the unwrapped data object (not the `{ isMock, data }` wrapper) — check `App.jsx` `handleDryRun` dispatch

## 5. App.jsx Integration

- [x] 5.1 Verify `EditorLayout` in `src/App.jsx` correctly passes `state` and `dispatch` to `Sidebar` — no changes needed if Sidebar handles modal internally
- [x] 5.2 Ensure `handleDryRun` dispatches `SET_TEST_RESULT` with the correct payload shape so `AssertionTable` receives the unwrapped result data

## 6. Documentation Updates

- [x] 6.1 Update `docs/UI.Architecture.md` — document the new startup behavior (empty editors), the `WorkflowModal` component, and the modal-triggered workflow loading flow
- [x] 6.2 Update `docs/UI.DebugGuide.md` — add a section about the new modal behavior and troubleshooting modal-related issues (fetch failures, empty state)

## 7. E2E Test Updates — Modal & Workflow CRUD

- [x] 7.1 Update `tests/rules-engine-crud.spec.ts` — rewrite all tests to use the modal-based workflow loading flow (click "New" button, interact with modal)
- [x] 7.2 Add test: "open modal and view workflow list" — verifies modal opens, shows workflow items or empty message, has Create New and Cancel buttons
- [x] 7.3 Add test: "select workflow from modal loads it into editor" — seeds a workflow via API, opens modal, clicks workflow, verifies editor content and scenario list
- [x] 7.4 Add test: "create new workflow from modal loads default template" — opens modal, clicks Create New, enters name, verifies template JSON in editor
- [x] 7.5 Add test: "cancel modal returns to empty state" — opens modal, clicks Cancel, verifies editors remain empty
- [x] 7.6 Add test: "create workflow validates required fields" — attempts to save with empty Rules JSON, verifies validation error
- [x] 7.7 Add test: "update workflow persists changes" — loads workflow, modifies JSON, saves, reloads, verifies persistence
- [x] 7.8 Add test: "delete workflow removes it permanently" — creates workflow, deletes via modal, verifies removal from list and editor clear

## 8. E2E Test Updates — Scenario CRUD & Assertion Validation

- [x] 8.1 Add test: "create scenario with facts and expected output" — loads workflow, creates scenario, verifies it appears in Sidebar
- [x] 8.2 Add test: "load scenario populates facts and assertions" — clicks scenario, verifies Facts Editor and assertion table content
- [x] 8.3 Add test: "update scenario persists changes" — modifies facts, updates scenario, reloads, verifies persistence
- [x] 8.4 Add test: "delete scenario removes it and clears state" — deletes scenario, verifies Sidebar update and editor reset
- [x] 8.5 Add test: "assertion actual values populate after dry-run" — loads workflow with scenario, runs dry-run, verifies Actual Value column is populated
- [x] 8.6 Add test: "assertion re-evaluates on subsequent dry-run" — modifies facts, runs second dry-run, verifies Actual Value column updates

## 9. Verification

- [x] 9.1 Run `npm run lint` from `rulesengineeditor.client/` — verify no ESLint errors
- [ ] 9.2 Run `npm run dev` and manually verify: app starts with empty editors, "New" button opens modal, selecting a workflow loads it, creating a new workflow loads the template, dry-run updates assertion actual values
- [ ] 9.3 Run `npx playwright test` — verify all E2E tests pass
