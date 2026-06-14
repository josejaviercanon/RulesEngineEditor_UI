# Workflow Load Modal

## Purpose

Modal-based workflow selection that replaces the auto-loaded sidebar workflow list. Users explicitly choose to load or create a workflow via a modal dialog triggered by the "New" button.

## Requirements

### Requirement: App starts with empty editors
The system SHALL initialize with empty Rules, Facts, and Settings editors. No workflows SHALL be listed in the Sidebar on startup.

#### Scenario: Fresh app load shows empty state
- **WHEN** the app loads and the user is authenticated
- **THEN** the Rules Editor pane displays an empty JSON editor
- **AND** the Facts Editor pane displays an empty JSON editor
- **AND** the Settings Editor pane displays default settings
- **AND** the Sidebar workflow list is empty
- **AND** the Sidebar scenario list shows "No scenarios for this workflow."

### Requirement: "New" button opens workflow selection modal
The system SHALL display a modal dialog when the user clicks the "New" button in the Sidebar, listing available workflows and offering a "Create New" option.

#### Scenario: Modal opens with workflow list
- **WHEN** user clicks the "New" button (selector: `[data-testid="new-workflow-btn"]`)
- **THEN** a modal dialog appears with the title "Select or Create Workflow"
- **AND** the modal fetches and displays all available workflows from `GET /api/Rules`
- **AND** each workflow item shows its name and version
- **AND** a "Create New Workflow" button is visible at the bottom of the modal
- **AND** a "Cancel" button is visible to close the modal

#### Scenario: Modal shows loading state
- **WHEN** the modal is opening and workflows are being fetched
- **THEN** a loading indicator is displayed in the modal body
- **AND** the workflow list is not shown until the fetch completes

#### Scenario: Modal handles empty workflow list
- **WHEN** the modal fetches workflows and the list is empty
- **THEN** the modal displays "No workflows found. Create a new one."
- **AND** the "Create New Workflow" button remains visible

#### Scenario: Modal handles fetch error
- **WHEN** the workflow fetch fails (backend unreachable)
- **THEN** the modal displays an error message "Failed to load workflows."
- **AND** the "Create New Workflow" button remains visible
- **AND** the "Cancel" button allows closing the modal

### Requirement: User can select a workflow from the modal
The system SHALL load the selected workflow's JSON content into the Rules editor and fetch its scenarios.

#### Scenario: Select existing workflow from modal
- **WHEN** user clicks a workflow item in the modal list
- **THEN** the system fetches the workflow by ID via `GET /api/Rules/{id}`
- **AND** sets `currentRules` to the workflow's JSON content
- **AND** sets `currentWorkflowId` to the loaded workflow's ID
- **AND** fetches scenarios for the workflow via `GET /api/Rules/scenarios?workflowId={id}`
- **AND** displays the scenarios in the Sidebar
- **AND** closes the modal

#### Scenario: Select workflow from localStorage fallback
- **WHEN** the backend is unreachable and user clicks a workflow in the modal
- **THEN** the system reads the workflow from `localStorage`
- **AND** sets `currentRules` to the stored JSON content
- **AND** fetches scenarios from `localStorage` filtered by workflow ID
- **AND** closes the modal

### Requirement: User can create a new workflow from the modal
The system SHALL load a default simple Rules JSON template when the user chooses to create a new workflow.

#### Scenario: Create new workflow with default template
- **WHEN** user clicks "Create New Workflow" in the modal
- **THEN** the system prompts for a workflow name via `window.prompt()`
- **AND** if the user provides a name and confirms, the system loads a default Rules JSON template into the editor
- **AND** the template contains a single workflow with one rule: `[{ "WorkflowName": "<name>", "Rules": [{ "RuleName": "DefaultRule", "SuccessEvent": "10", "ErrorMessage": "One or more conditions failed.", "ErrorType": "Error", "RuleExpressionType": "LambdaExpression", "Expression": "input1 == true" }] }]`
- **AND** sets `currentWorkflowId` to null (not yet saved)
- **AND** clears the scenario list
- **AND** closes the modal
- **AND** the user can then click "Save" to persist the workflow

#### Scenario: Cancel name prompt returns to modal
- **WHEN** user clicks "Create New Workflow" and cancels the name prompt
- **THEN** the modal remains open
- **AND** no workflow is created
- **AND** editors remain unchanged

### Requirement: Modal can be dismissed
The system SHALL allow the user to close the modal without taking any action.

#### Scenario: Cancel closes modal
- **WHEN** user clicks "Cancel" in the modal
- **THEN** the modal closes
- **AND** editors remain in their current state
- **AND** no workflows are loaded

#### Scenario: Backdrop click closes modal
- **WHEN** user clicks outside the modal dialog (on the backdrop)
- **THEN** the modal closes
- **AND** editors remain in their current state

#### Scenario: Escape key closes modal
- **WHEN** user presses the Escape key while the modal is open
- **THEN** the modal closes
- **AND** editors remain in their current state
