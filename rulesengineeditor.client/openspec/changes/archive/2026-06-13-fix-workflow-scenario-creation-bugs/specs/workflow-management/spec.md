## MODIFIED Requirements

### Requirement: User can save a new workflow
The system SHALL save the current editor content as a new workflow.

#### Scenario: Save new workflow to backend
- **WHEN** user clicks "Save as New Workflow"
- **THEN** the system sends `POST /api/Rules` with `{ WorkflowName, JsonContent, Status }`
- **AND** on success, adds the workflow to the Sidebar list
- **AND** sets `currentWorkflowId` to the returned ID

#### Scenario: Save new workflow to localStorage
- **WHEN** the backend is unreachable
- **THEN** the system stores the workflow in `localStorage` with a generated ID
- **AND** adds it to the Sidebar list

#### Scenario: Create new workflow from modal auto-persists to backend
- **WHEN** user clicks "Create New Workflow" in the workflow modal
- **AND** enters a workflow name in the inline input field
- **THEN** the system SHALL immediately send `POST /api/Rules` with the default template JSON and the entered name
- **AND** on success, set `currentWorkflowId` to the returned ID
- **AND** add the workflow to the Sidebar list
- **AND** close the modal
- **AND** display a success confirmation to the user

#### Scenario: Create new workflow from modal falls back to localStorage
- **WHEN** user clicks "Create New Workflow" in the workflow modal
- **AND** the backend is unreachable
- **THEN** the system SHALL store the workflow in `localStorage` with a generated ID
- **AND** set `currentWorkflowId` to the generated ID
- **AND** add the workflow to the Sidebar list
- **AND** close the modal

#### Scenario: Create new workflow from modal fails
- **WHEN** user clicks "Create New Workflow" in the workflow modal
- **AND** the save operation fails (both backend and localStorage)
- **THEN** the system SHALL display an error message to the user
- **AND** keep the modal open
- **AND** NOT set `currentWorkflowId`

#### Scenario: Create new workflow button is disabled during save
- **WHEN** user clicks "Create New Workflow" and the save operation is in progress
- **THEN** the "Create New Workflow" button SHALL be disabled
- **AND** a loading indicator SHALL be visible
- **AND** subsequent clicks SHALL NOT trigger additional save operations

## ADDED Requirements

### Requirement: System displays error when workflow selection returns no data
The system SHALL display a visible error message when selecting a workflow from the modal returns null or falsy data from the backend.

#### Scenario: Workflow selection returns null data
- **WHEN** user clicks a workflow in the workflow modal
- **AND** the `getWorkflow(id)` API call returns null or falsy data
- **THEN** the system SHALL display an error message in the modal
- **AND** SHALL NOT close the modal
- **AND** SHALL NOT update `currentWorkflowId` or `currentRules`

#### Scenario: Workflow selection API call throws an exception
- **WHEN** user clicks a workflow in the workflow modal
- **AND** the `getWorkflow(id)` API call throws an exception
- **THEN** the system SHALL display an error message in the modal including the error details
- **AND** SHALL NOT close the modal
