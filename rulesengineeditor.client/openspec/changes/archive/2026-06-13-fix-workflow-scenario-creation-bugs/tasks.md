## 1. Reducer — New async CREATE_WORKFLOW action

- [x] 1.1 In `src/hooks/useRulesReducer.js`, add a new action type `CREATE_WORKFLOW_REQUEST` that sets an `isCreatingWorkflow` flag to `true` in state
- [x] 1.2 Add a `CREATE_WORKFLOW_SUCCESS` action type that sets `currentWorkflowId` to the returned ID, sets `currentRules` to the template JSON, clears scenario state, and sets `isCreatingWorkflow` to `false`
- [x] 1.3 Add a `CREATE_WORKFLOW_FAILURE` action type that sets `isCreatingWorkflow` to `false` and stores an `error` message in state
- [x] 1.4 Initialize `isCreatingWorkflow: false` and `error: null` in the default state

## 2. WorkflowModal — Auto-persist on Create New

- [x] 2.1 In `src/components/WorkflowModal.jsx`, add an inline input field for the workflow name when in creation mode, then call `rulesApi.saveWorkflow()` with the default template and entered name on submit
- [x] 2.2 On successful save, call `onCreateWorkflow` with the returned workflow data (including the real ID) so the parent can dispatch state updates
- [x] 2.3 On save failure, catch the error and display it in the modal via a local error state instead of silently failing
- [x] 2.4 Add an `isCreating` local state to disable the "Create New Workflow" button during the API call and prevent double-clicks
- [x] 2.5 Add an error display area in the modal JSX to show error messages when workflow selection or creation fails

## 3. WorkflowModal — Error handling on workflow selection

- [x] 3.1 In `src/components/WorkflowModal.jsx`, update `handleSelectWorkflow` to add an `else` branch when `res.data` is falsy — set a local error state with a message like "Failed to load workflow: no data returned"
- [x] 3.2 Wrap the `getWorkflow` call in a try/catch that sets the local error state on exception instead of silently swallowing the error
- [x] 3.3 Ensure the modal does NOT close when selection fails (only close on success)

## 4. Sidebar — Wire up async workflow creation flow

- [x] 4.1 In `src/components/Sidebar.jsx`, update `handleCreateWorkflow` to be async: dispatch `CREATE_WORKFLOW_REQUEST`, call the API (via the modal's already-completed save or directly), then dispatch `CREATE_WORKFLOW_SUCCESS` with the returned ID
- [x] 4.2 On success, refresh the workflow list in the Sidebar and show a success alert
- [x] 4.3 On failure, dispatch `CREATE_WORKFLOW_FAILURE` and show the error alert with details
- [x] 4.4 Pass `isCreatingWorkflow` state to `WorkflowModal` as a prop to control the button disabled state

## 5. Sidebar — Improve scenario creation error handling

- [x] 5.1 In `src/components/Sidebar.jsx`, update `handleNewScenario` catch block to capture the error object, log it with `console.error`, and include `error.response?.data` details in the alert message
- [x] 5.2 Update the `!state.currentWorkflowId` guard message to be more descriptive: explain that the workflow must be saved before creating scenarios

## 6. Verification

- [x] 6.1 Run `npm run lint` from `rulesengineeditor.client/` and fix any lint errors introduced by the changes
- [x] 6.2 Run `npm run build` to verify the production build succeeds
- [x] 6.3 Manual verification: on a fresh install (empty tables), open the modal, click "Create New Workflow", enter a name, verify the workflow is persisted and appears in the list
- [x] 6.4 Manual verification: load an existing workflow from the modal, then create a new scenario — verify it saves and appears in the scenario list
