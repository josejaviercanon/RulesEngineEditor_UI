## MODIFIED Requirements

### Requirement: System updates assertions after each dry-run
The system SHALL re-evaluate all assertions whenever a new dry-run result is available, and SHALL correctly populate the "Actual Value" column for each assertion path.

#### Scenario: Re-evaluate on new dry-run
- **WHEN** user runs a new dry-run
- **THEN** the system re-evaluates all assertions (manual + scenario-derived) against the new `testResult`
- **AND** updates pass/fail indicators in real time
- **AND** the "Actual Value" column displays the resolved value from the result tree for each assertion path

#### Scenario: Actual value resolves nested paths correctly
- **WHEN** an assertion path is `[0].IsSuccess` or `ruleResultTree[0].isSuccess`
- **THEN** the system resolves the value from the `testResult` object traversing array indices and property names
- **AND** handles both PascalCase (`IsSuccess`) and camelCase (`isSuccess`) property names
- **AND** displays the resolved value as a string in the "Actual Value" column

#### Scenario: Actual value shows undefined for invalid paths
- **WHEN** an assertion path does not exist in the `testResult` object
- **THEN** the "Actual Value" column displays "undefined"
- **AND** the assertion status shows as failed (red X)

#### Scenario: Actual value clears when no test result exists
- **WHEN** no dry-run has been executed (`testResult` is null)
- **THEN** the "Actual Value" column displays "-" for all assertions
- **AND** the status shows as not evaluated (gray circle)
