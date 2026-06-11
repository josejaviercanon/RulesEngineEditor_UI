## ADDED Requirements

### Requirement: User can toggle online evaluation mode
The system SHALL provide a toggle to switch between backend evaluation and local simulation.

#### Scenario: Enable online mode
- **WHEN** user toggles "Online Mode" to ON
- **THEN** the system sets `onlineMode` to `true`
- **AND** subsequent dry-run evaluations call the backend API first

#### Scenario: Disable online mode
- **WHEN** user toggles "Online Mode" to OFF
- **THEN** the system sets `onlineMode` to `false`
- **AND** subsequent dry-run evaluations use local simulation

### Requirement: System executes dry-run against backend when online
The system SHALL send the current rules, facts, and settings to the backend for real evaluation.

#### Scenario: Successful backend dry-run
- **WHEN** user clicks "Dry Run" and `onlineMode` is `true`
- **THEN** the system sends `POST /api/Rules/dry-run` with `{ rulesJson, factsJson, settingsJson }`
- **AND** the backend returns `EvaluationResult` with `isSuccess`, `ruleResultTree`, and optional `errorMessage`
- **AND** the system displays the result tree in the Results Viewer
- **AND** the system displays `errorMessage` prominently if present
- **AND** sets `isMockMode` to `false`

#### Scenario: Backend dry-run with compilation error
- **WHEN** the backend returns an `errorMessage` (e.g., invalid rule expression)
- **THEN** the system displays the error message in the Results Viewer
- **AND** does not render a result tree

#### Scenario: Backend unreachable falls back to simulation
- **WHEN** the backend dry-run request fails
- **THEN** the system falls back to local `simulateEvaluation()`
- **AND** sets `isMockMode` to `true`
- **AND** shows a "Sandbox Mode" indicator

### Requirement: System displays backend evaluation results accurately
The system SHALL render the backend's `ruleResultTree` with per-rule success/failure status.

#### Scenario: Render success tree
- **WHEN** the backend returns `ruleResultTree` with nodes where `isSuccess` is `true`
- **THEN** the Results Viewer displays each node with a green success indicator

#### Scenario: Render failure tree
- **WHEN** the backend returns `ruleResultTree` with nodes where `isSuccess` is `false`
- **THEN** the Results Viewer displays each node with a red failure indicator
- **AND** displays any `exceptionMessage` on the failed node

### Requirement: System supports custom types in dry-run
The system SHALL allow users to specify custom types for the backend dry-run.

#### Scenario: Dry-run with custom types
- **WHEN** user provides custom type assemblies in the Settings editor
- **THEN** the system includes `customTypes` array in the `DryRunRequest`
- **AND** the backend uses those types during evaluation
