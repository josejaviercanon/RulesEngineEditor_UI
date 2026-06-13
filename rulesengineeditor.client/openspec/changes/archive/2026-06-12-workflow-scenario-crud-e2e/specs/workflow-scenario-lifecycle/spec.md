# Workflow Scenario Lifecycle

## Purpose

Define the frontend state management and UI behavior for binding Workflow Test Scenarios to the currently selected Workflow, including automatic loading when a workflow is selected and cleanup when a new workflow is created.

## ADDED Requirements

### Requirement: Scenario list auto-reloads when workflow selection changes
The system SHALL fetch and display scenarios for the newly selected workflow whenever `currentWorkflowId` changes.

#### Scenario: Select a workflow loads its scenarios
- **WHEN** user clicks a workflow in the Sidebar
- **THEN** the system dispatches `SET_WORKFLOW` with the workflow ID and rules JSON
- **AND** the Sidebar `useEffect` on `currentWorkflowId` triggers `rulesApi.getScenarios(workflowId)`
- **AND** the scenario list updates to show only scenarios for that workflow

#### Scenario: Change from one workflow to another
- **WHEN** user clicks a different workflow while another is already loaded
- **THEN** the system dispatches `SET_WORKFLOW` with the new workflow ID
- **AND** the scenario list is replaced with scenarios from the new workflow
- **AND** any previously loaded scenario state (`currentScenarioId`, `currentFacts`, `activeScenario`, `assertions`) is cleared via `CLEAR_SCENARIO`

### Requirement: Creating a new workflow clears loaded scenario state
The system SHALL reset all scenario-related state when a user successfully creates a new workflow.

#### Scenario: Save as new workflow clears scenarios
- **WHEN** user clicks "Save as New Workflow" and provides a name
- **THEN** the system calls `rulesApi.saveWorkflow()`
- **AND** on success, dispatches `SET_WORKFLOW` with the new workflow ID
- **AND** dispatches `CLEAR_SCENARIO` to remove any previously loaded scenario facts, assertions, and scenario ID
- **AND** the scenario list in the Sidebar becomes empty

### Requirement: Workflow deletion clears active workflow and scenario state
The system SHALL clear workflow and scenario state when the active workflow is deleted.

#### Scenario: Delete active workflow
- **WHEN** user deletes the currently loaded workflow
- **THEN** the system dispatches `CLEAR_WORKFLOW`
- **AND** dispatches `CLEAR_SCENARIO`
- **AND** the Rules Editor, Facts Editor, and Results Viewer return to default/empty state
