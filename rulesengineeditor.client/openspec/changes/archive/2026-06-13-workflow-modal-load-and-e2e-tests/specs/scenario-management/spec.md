## MODIFIED Requirements

### Requirement: User can list scenarios for a workflow
The system SHALL display test scenarios linked to the current workflow. Scenarios SHALL only be fetched and displayed after a workflow is explicitly loaded via the modal or template creation flow.

#### Scenario: Scenarios loaded after workflow selection
- **WHEN** a workflow is loaded via the modal (`currentWorkflowId` is set)
- **THEN** the system fetches scenarios from `GET /api/Rules/scenarios?workflowId={id}`
- **AND** displays each scenario's name in the Sidebar under the workflow

#### Scenario: No scenarios on startup
- **WHEN** the app loads and no workflow is selected
- **THEN** the system SHALL NOT fetch scenarios
- **AND** the scenario list shows "No scenarios for this workflow."

#### Scenario: Scenarios cleared when no workflow is active
- **WHEN** the user has no workflow loaded (`currentWorkflowId` is null)
- **THEN** the scenario list is empty
- **AND** no scenario fetch is triggered

### Requirement: System clears scenario state when a new workflow is created
The system SHALL remove any loaded scenario state when the user successfully creates a new workflow.

#### Scenario: Create new workflow clears scenario state
- **WHEN** user creates a new workflow via the modal "Create New Workflow" option
- **THEN** the system dispatches `CLEAR_SCENARIO`
- **AND** `currentScenarioId` is set to null
- **AND** `currentFacts` is reset to empty JSON `{}`
- **AND** the assertion table is emptied
- **AND** the scenario list in the Sidebar shows "No scenarios for this workflow."
