# Scenario CRUD E2E

## Purpose

Define end-to-end Playwright test requirements for the complete Workflow Test Scenarios lifecycle, including workflow selection, scenario loading, full CRUD operations, and state cleanup.

## ADDED Requirements

### Requirement: E2E tests cover workflow selection and scenario loading
The system SHALL provide Playwright tests that validate scenarios load correctly when a workflow is selected or changed.

#### Scenario: Selecting a workflow displays its scenarios
- **WHEN** the test creates two workflows each with one scenario
- **AND** the user clicks the first workflow in the Sidebar
- **THEN** the scenario list shows only the first workflow's scenario
- **AND** the scenario name is visible

#### Scenario: Changing workflow reloads scenario list
- **WHEN** the user clicks the second workflow in the Sidebar
- **THEN** the first workflow's scenarios disappear from the list
- **AND** the second workflow's scenarios appear

### Requirement: E2E tests cover new workflow creation and scenario cleanup
The system SHALL provide Playwright tests that validate scenario state is cleared when a new workflow is created.

#### Scenario: Create new workflow clears previous scenario state
- **WHEN** the user has an existing workflow loaded with a scenario selected
- **AND** the user clicks "Save as New Workflow" and confirms
- **THEN** the new workflow appears in the list
- **AND** the scenario list is empty
- **AND** the Facts Editor does not contain the previous scenario's mock input
- **AND** the assertion table is empty

### Requirement: E2E tests cover full scenario CRUD with assertion validation
The system SHALL provide Playwright tests that create, read, update, and delete scenarios through the UI, validating that facts and expected output are correctly loaded.

#### Scenario: Create scenario and verify facts load
- **WHEN** the user opens an existing workflow
- **AND** clicks "Save Scenario" and provides a name and expected output JSON
- **THEN** the scenario appears in the Sidebar under the workflow
- **AND** clicking the scenario loads its `mockInputJson` into the Facts Editor
- **AND** the assertion table is populated with paths from `expectedOutputJson`

#### Scenario: Update scenario facts
- **WHEN** the user loads an existing scenario
- **AND** modifies the facts JSON in the Facts Editor
- **AND** clicks "Update Scenario"
- **THEN** the backend reflects the updated `mockInputJson`
- **AND** reloading the scenario shows the updated facts

#### Scenario: Delete scenario removes it from UI and backend
- **WHEN** the user clicks the delete action on a scenario
- **AND** confirms the deletion
- **THEN** the scenario disappears from the Sidebar
- **AND** the backend no longer returns it on `GET /api/Rules/scenarios?workflowId={id}`
- **AND** the Facts Editor and assertion table are cleared if the deleted scenario was active

### Requirement: E2E tests use stable selectors for scenario lifecycle
The system SHALL annotate scenario list items and action buttons with `data-testid` attributes so tests can locate them without relying on text content or DOM order.

#### Scenario: Scenario list selectors
- **WHEN** inspecting the Sidebar scenario list
- **THEN** each scenario item has `data-testid="scenario-item-<id>"` or a stable pattern
- **AND** the "Save Scenario" button has `data-testid="new-scenario-btn"`
- **AND** the "Update Scenario" button has `data-testid="update-scenario-btn"`
- **AND** the "Delete Scenario" action has `data-testid="delete-scenario-btn"`
