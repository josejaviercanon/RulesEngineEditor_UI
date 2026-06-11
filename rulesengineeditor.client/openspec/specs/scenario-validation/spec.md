# Scenario Validation

## Purpose

Automatic validation of dry-run results against scenario expected output, including assertion generation, pass/fail evaluation, and real-time re-evaluation.

## Requirements

### Requirement: System auto-populates assertions from scenario expected output
The system SHALL derive path-based assertions from a loaded scenario's `expectedOutputJson`.

#### Scenario: Load scenario with expected output
- **WHEN** a scenario with `expectedOutputJson` is loaded
- **THEN** the system parses the expected output JSON
- **AND** generates path assertions for each leaf value (e.g., `[0].IsSuccess` → `true`)
- **AND** populates the assertion table with these assertions

#### Scenario: Load scenario without expected output
- **WHEN** a scenario without `expectedOutputJson` is loaded
- **THEN** the assertion table remains empty or retains manually added assertions

### Requirement: System validates dry-run results against scenario expectations
The system SHALL compare the actual dry-run result tree against the loaded scenario's expected output.

#### Scenario: All assertions pass
- **WHEN** a dry-run completes and the result tree matches all expected output paths
- **THEN** the assertion table shows all assertions as passed (green)
- **AND** displays an overall "Scenario Passed" indicator

#### Scenario: Some assertions fail
- **WHEN** a dry-run completes and some result tree values differ from expected output
- **THEN** the assertion table shows failed assertions as red with actual vs expected values
- **AND** displays an overall "Scenario Failed" indicator

#### Scenario: No scenario loaded
- **WHEN** no scenario is loaded (`currentScenarioId` is null)
- **THEN** the assertion table shows only manually added assertions
- **AND** no automatic validation occurs

### Requirement: System updates assertions after each dry-run
The system SHALL re-evaluate all assertions whenever a new dry-run result is available.

#### Scenario: Re-evaluate on new dry-run
- **WHEN** user runs a new dry-run
- **THEN** the system re-evaluates all assertions (manual + scenario-derived) against the new `testResult`
- **AND** updates pass/fail indicators in real time
