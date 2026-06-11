## ADDED Requirements

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
