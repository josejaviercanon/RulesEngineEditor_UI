## MODIFIED Requirements

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

#### Scenario: Create scenario API call fails with details
- **WHEN** user attempts to create a scenario
- **AND** the API call fails with an error response
- **THEN** the system SHALL log the full error object to `console.error`
- **AND** SHALL display an alert including the error response data (e.g., validation messages)
- **AND** SHALL NOT discard the error object silently

#### Scenario: Create scenario with no workflow loaded
- **WHEN** user attempts to create a scenario
- **AND** `currentWorkflowId` is null
- **THEN** the system SHALL display an alert explaining that a workflow must be saved before creating scenarios
- **AND** SHALL NOT prompt for scenario name or expected output
