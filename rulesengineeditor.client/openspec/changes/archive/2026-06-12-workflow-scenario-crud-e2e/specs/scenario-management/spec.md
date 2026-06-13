# Scenario Management

## Purpose

Management of test scenarios within workflows, including listing, loading, creating, updating, and deleting scenarios through the UI with backend and localStorage fallback support.

## MODIFIED Requirements

### Requirement: User can list scenarios for a workflow
The system SHALL display test scenarios linked to the current workflow.

#### Scenario: Scenarios loaded from backend
- **WHEN** a workflow is loaded (`currentWorkflowId` is set)
- **THEN** the system fetches scenarios from `GET /api/Rules/scenarios?workflowId={id}`
- **AND** displays each scenario's name in the Sidebar under the workflow

#### Scenario: Scenarios loaded from localStorage
- **WHEN** the backend is unreachable
- **THEN** the system reads scenarios from `localStorage` key `mockScenarios`
- **AND** filters by `WorkflowDefinitionId` matching `currentWorkflowId`

#### Scenario: Scenarios cleared when workflow changes
- **WHEN** the user selects a different workflow
- **THEN** the system dispatches `CLEAR_SCENARIO`
- **AND** fetches scenarios for the newly selected workflow
- **AND** the previous workflow's scenarios are no longer displayed

### Requirement: User can load a scenario into the editor
The system SHALL populate the Facts editor and assertions when a scenario is selected.

#### Scenario: Load scenario from backend
- **WHEN** user clicks a scenario in the Sidebar
- **THEN** the system fetches the scenario by ID
- **AND** sets `currentFacts` to `mockInputJson`
- **AND** sets `currentScenarioId` to the loaded scenario's ID
- **AND** if `expectedOutputJson` is present, populates the assertion table with path assertions derived from the expected output

#### Scenario: Load scenario from localStorage
- **WHEN** the backend is unreachable
- **THEN** the system reads the scenario from `localStorage`
- **AND** populates `currentFacts` and assertions as above

### Requirement: User can create a new scenario
The system SHALL save the current facts and optional expected output as a new scenario.

#### Scenario: Create scenario on backend
- **WHEN** user clicks "Save Scenario"
- **THEN** the system sends `POST /api/Rules/scenarios` with `{ WorkflowDefinitionId, ScenarioName, MockInputJson, ExpectedOutputJson }`
- **AND** on success, adds the scenario to the Sidebar list
- **AND** sets `currentScenarioId` to the returned ID

#### Scenario: Create scenario in localStorage
- **WHEN** the backend is unreachable
- **THEN** the system stores the scenario in `localStorage` with a generated ID
- **AND** adds it to the Sidebar list

### Requirement: User can update an existing scenario
The system SHALL update the scenario associated with `currentScenarioId`.

#### Scenario: Update scenario on backend
- **WHEN** user clicks "Update Scenario" and `currentScenarioId` is set
- **THEN** the system sends `PUT /api/Rules/scenarios/{id}` with updated `{ ScenarioName, MockInputJson, ExpectedOutputJson }`
- **AND** refreshes the Sidebar list

#### Scenario: Update scenario in localStorage
- **WHEN** the backend is unreachable
- **THEN** the system updates the matching scenario in `localStorage`
- **AND** refreshes the Sidebar list

### Requirement: User can delete a scenario
The system SHALL remove a scenario from the system.

#### Scenario: Delete scenario from backend
- **WHEN** user clicks the delete action on a scenario
- **THEN** the system sends `DELETE /api/Rules/scenarios/{id}`
- **AND** removes the scenario from the Sidebar list
- **AND** clears `currentScenarioId` if it was the active scenario

#### Scenario: Delete scenario from localStorage
- **WHEN** the backend is unreachable
- **THEN** the system removes the scenario from `localStorage`
- **AND** updates the Sidebar list

## ADDED Requirements

### Requirement: System clears scenario state when a new workflow is created
The system SHALL remove any loaded scenario state when the user successfully creates a new workflow.

#### Scenario: Save as new workflow clears scenario state
- **WHEN** user clicks "Save as New Workflow" and the save succeeds
- **THEN** the system dispatches `CLEAR_SCENARIO`
- **AND** `currentScenarioId` is set to null
- **AND** `currentFacts` is reset to default empty JSON
- **AND** the assertion table is emptied
- **AND** the scenario list in the Sidebar is cleared until the new workflow is re-selected

### Requirement: System clears scenario state when active workflow is deleted
The system SHALL remove any loaded scenario state when the currently active workflow is deleted.

#### Scenario: Delete active workflow clears scenario state
- **WHEN** user deletes the workflow that is currently loaded (`currentWorkflowId`)
- **THEN** the system dispatches `CLEAR_WORKFLOW`
- **AND** dispatches `CLEAR_SCENARIO`
- **AND** the Rules Editor, Facts Editor, and assertion table return to default state
