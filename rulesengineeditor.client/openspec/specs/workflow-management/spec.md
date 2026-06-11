# Workflow Management

## Purpose

Management of rule workflows through the UI, including listing, loading, creating, updating, and deleting workflows with backend and localStorage fallback support.

## Requirements

### Requirement: User can list workflows
The system SHALL display a list of available workflows in the Sidebar.

#### Scenario: Workflows loaded from backend
- **WHEN** the Sidebar mounts
- **THEN** the system fetches workflows from `GET /api/Rules`
- **AND** displays each workflow's name and version

#### Scenario: Workflows loaded from localStorage fallback
- **WHEN** the backend is unreachable
- **THEN** the system reads workflows from `localStorage` key `mockWorkflows`
- **AND** displays them in the Sidebar

### Requirement: User can load a workflow into the editor
The system SHALL load a workflow's JSON content into the Rules editor when selected.

#### Scenario: Load workflow from backend
- **WHEN** user clicks a workflow in the Sidebar
- **THEN** the system fetches the workflow by ID
- **AND** sets `currentRules` to the workflow's JSON content
- **AND** sets `currentWorkflowId` to the loaded workflow's ID

#### Scenario: Load workflow from localStorage
- **WHEN** the backend is unreachable
- **THEN** the system reads the workflow from `localStorage`
- **AND** sets `currentRules` to the stored JSON content

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

### Requirement: User can update an existing workflow
The system SHALL update the workflow associated with `currentWorkflowId`.

#### Scenario: Update workflow on backend
- **WHEN** user clicks "Save Workflow" and `currentWorkflowId` is set
- **THEN** the system sends `PUT /api/Rules/{id}` with updated `{ WorkflowName, JsonContent, Status }`
- **AND** refreshes the Sidebar list

#### Scenario: Update workflow in localStorage
- **WHEN** the backend is unreachable
- **THEN** the system updates the matching workflow in `localStorage`
- **AND** refreshes the Sidebar list

### Requirement: User can delete a workflow
The system SHALL remove a workflow from the system.

#### Scenario: Delete workflow from backend
- **WHEN** user clicks the delete action on a workflow
- **THEN** the system sends `DELETE /api/Rules/{id}`
- **AND** removes the workflow from the Sidebar list
- **AND** clears `currentWorkflowId` if it was the active workflow

#### Scenario: Delete workflow from localStorage
- **WHEN** the backend is unreachable
- **THEN** the system removes the workflow from `localStorage`
- **AND** updates the Sidebar list
