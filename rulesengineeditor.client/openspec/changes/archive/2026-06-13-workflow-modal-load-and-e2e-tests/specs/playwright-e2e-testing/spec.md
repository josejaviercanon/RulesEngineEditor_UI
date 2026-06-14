## ADDED Requirements

### Requirement: E2E tests cover modal-based workflow loading
The system SHALL provide automated tests that validate the modal workflow selection flow, including opening the modal, selecting a workflow, and creating a new workflow from the default template.

#### Scenario: Open modal and view workflow list
- **WHEN** the test navigates to the app and clicks `[data-testid="new-workflow-btn"]`
- **THEN** the modal dialog is visible
- **AND** the modal contains workflow items or a "No workflows found" message
- **AND** the "Create New Workflow" button is visible
- **AND** the "Cancel" button is visible

#### Scenario: Select workflow from modal loads it into editor
- **WHEN** the test seeds a workflow via backend API
- **AND** clicks `[data-testid="new-workflow-btn"]`
- **AND** clicks the workflow item in the modal
- **THEN** the modal closes
- **AND** the Rules Editor contains the workflow's JSON content
- **AND** the scenario list in the Sidebar shows the workflow's scenarios

#### Scenario: Create new workflow from modal loads default template
- **WHEN** the test clicks `[data-testid="new-workflow-btn"]`
- **AND** clicks "Create New Workflow" in the modal
- **AND** enters a name in the prompt and confirms
- **THEN** the modal closes
- **AND** the Rules Editor contains the default template JSON
- **AND** the template includes a workflow with `WorkflowName` matching the entered name
- **AND** the scenario list shows "No scenarios for this workflow."

#### Scenario: Cancel modal returns to empty state
- **WHEN** the test clicks `[data-testid="new-workflow-btn"]`
- **AND** clicks "Cancel" in the modal
- **THEN** the modal closes
- **AND** the editors remain empty
- **AND** no workflow is loaded

### Requirement: E2E tests verify assertion field updates after dry-run
The system SHALL provide automated tests that verify the AssertionTable correctly updates actual values after a dry-run execution.

#### Scenario: Assertion actual values populate after dry-run
- **WHEN** the test loads a workflow with a scenario
- **AND** the scenario has expected output assertions
- **AND** clicks `[data-testid="run-dryrun-btn"]`
- **THEN** the "Actual Value" column in the assertion table is populated with values from the result
- **AND** each assertion shows a pass (green) or fail (red) status

#### Scenario: Assertion re-evaluates on subsequent dry-run
- **WHEN** the test modifies the facts JSON
- **AND** runs a second dry-run
- **THEN** the "Actual Value" column updates with new values
- **AND** pass/fail statuses reflect the new result

### Requirement: E2E tests cover full CRUD validation for Workflows
The system SHALL provide automated tests that validate all Create, Read, Update, Delete operations for Workflows with proper validation.

#### Scenario: Create workflow validates required fields
- **WHEN** the test attempts to save a workflow with empty Rules JSON
- **THEN** the system displays a validation error
- **AND** the workflow is not saved

#### Scenario: Create workflow with valid JSON succeeds
- **WHEN** the test creates a workflow with valid Rules JSON via the modal
- **AND** saves it
- **THEN** the backend returns a `201` response
- **AND** the workflow appears in the modal list on next open

#### Scenario: Update workflow persists changes
- **WHEN** the test loads a workflow
- **AND** modifies the Rules JSON
- **AND** saves the workflow
- **THEN** the backend receives a `PUT` request with updated content
- **AND** reloading the workflow shows the updated JSON

#### Scenario: Delete workflow removes it permanently
- **WHEN** the test creates a workflow
- **AND** deletes it via the modal
- **THEN** the backend returns `204 No Content`
- **AND** the workflow no longer appears in the modal list
- **AND** the editors are cleared

### Requirement: E2E tests cover full CRUD validation for Scenarios
The system SHALL provide automated tests that validate all Create, Read, Update, Delete operations for Scenarios within a workflow.

#### Scenario: Create scenario with facts and expected output
- **WHEN** the test loads a workflow
- **AND** creates a scenario with facts JSON and expected output JSON
- **THEN** the backend returns a `201` response
- **AND** the scenario appears in the Sidebar scenario list

#### Scenario: Load scenario populates facts and assertions
- **WHEN** the test clicks a scenario in the Sidebar
- **THEN** the Facts Editor is populated with the scenario's `mockInputJson`
- **AND** the assertion table is populated with assertions derived from `expectedOutputJson`

#### Scenario: Update scenario persists changes
- **WHEN** the test modifies the facts JSON for a loaded scenario
- **AND** updates the scenario
- **THEN** the backend receives a `PUT` request with updated content
- **AND** reloading the scenario shows the updated facts

#### Scenario: Delete scenario removes it and clears state
- **WHEN** the test deletes a loaded scenario
- **THEN** the backend returns `204 No Content`
- **AND** the scenario disappears from the Sidebar
- **AND** the Facts Editor returns to empty state
- **AND** the assertion table is cleared

#### Scenario: Create scenario validates workflow association
- **WHEN** the test attempts to create a scenario without a loaded workflow
- **THEN** the system displays an error or the scenario is associated with the current `currentWorkflowId`
- **AND** the scenario is not orphaned
