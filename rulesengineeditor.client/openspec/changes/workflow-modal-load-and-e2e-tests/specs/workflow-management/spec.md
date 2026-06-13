## MODIFIED Requirements

### Requirement: User can list workflows
The system SHALL NOT display a list of workflows in the Sidebar on startup. Workflows SHALL only be listed inside the workflow selection modal when triggered by the "New" button.

#### Scenario: No workflows on startup
- **WHEN** the Sidebar mounts
- **THEN** the system SHALL NOT fetch workflows from `GET /api/Rules`
- **AND** the workflow list area in the Sidebar is empty
- **AND** a hint text "Click New to load or create a workflow" is displayed

#### Scenario: Workflows loaded in modal on demand
- **WHEN** user clicks the "New" button
- **THEN** the system fetches workflows from `GET /api/Rules` inside the modal
- **AND** displays each workflow's name and version in the modal list

### Requirement: User can save a new workflow
The system SHALL save the current editor content as a new workflow. The "Save" button SHALL be enabled only when `currentRules` contains valid JSON and `currentWorkflowId` is null.

#### Scenario: Save new workflow to backend
- **WHEN** user clicks "Save Workflow" (selector: `[data-testid="save-workflow-btn"]`) and `currentWorkflowId` is null
- **THEN** the system prompts for a workflow name via `window.prompt()`
- **AND** sends `POST /api/Rules` with `{ WorkflowName, JsonContent: currentRules, Status: 'Draft' }`
- **AND** on success, sets `currentWorkflowId` to the returned ID
- **AND** displays a success indicator
- **AND** the workflow now appears in the modal list on next open

#### Scenario: Save new workflow to localStorage
- **WHEN** the backend is unreachable
- **THEN** the system stores the workflow in `localStorage` with a generated ID
- **AND** sets `currentWorkflowId` to the generated ID

### Requirement: User can update an existing workflow
The system SHALL update the workflow associated with `currentWorkflowId`.

#### Scenario: Update workflow on backend
- **WHEN** user clicks "Save Workflow" and `currentWorkflowId` is set
- **THEN** the system sends `PUT /api/Rules/{id}` with updated `{ WorkflowName, JsonContent, Status }`
- **AND** displays a success indicator

#### Scenario: Update workflow in localStorage
- **WHEN** the backend is unreachable
- **THEN** the system updates the matching workflow in `localStorage`

### Requirement: User can delete a workflow
The system SHALL remove a workflow from the system.

#### Scenario: Delete workflow from backend
- **WHEN** user clicks the delete action on a workflow in the modal
- **THEN** the system sends `DELETE /api/Rules/{id}`
- **AND** removes the workflow from the modal list
- **AND** clears `currentWorkflowId` and editors if it was the active workflow

#### Scenario: Delete workflow from localStorage
- **WHEN** the backend is unreachable
- **THEN** the system removes the workflow from `localStorage`
- **AND** updates the modal list
