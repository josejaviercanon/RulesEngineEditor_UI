## ADDED Requirements

### Requirement: Agent prompts reference valid OpenSpec commands
All agent prompts in opencode.json SHALL reference OpenSpec commands and skills that actually exist in the system.

#### Scenario: Builder agent uses correct apply command
- **WHEN** the builder agent prompt references starting implementation
- **THEN** it SHALL reference /openspec-apply-change, not /openspec-apply

#### Scenario: Reviewer agent uses correct verify command
- **WHEN** the reviewer agent prompt references verifying implementation
- **THEN** it SHALL reference /openspec-verify-change, not /openspec-review

### Requirement: Architect and builder agents read AGENTS.md before acting
The architect and builder agents SHALL be instructed to read AGENTS.md as a mandatory pre-flight step before designing or implementing.

#### Scenario: Architect starts a new change
- **WHEN** the architect agent begins writing a proposal or design
- **THEN** it SHALL have read AGENTS.md to understand the tech stack, constraints, and backend contract

#### Scenario: Builder starts implementation
- **WHEN** the builder agent begins implementing tasks
- **THEN** it SHALL have read AGENTS.md to understand commands to avoid (e.g., no tailwind.config.js, no TypeScript)

### Requirement: Explorer agent prompt remains accurate
The explorer agent prompt SHALL remain focused on analysis without writing code, using /opsx:explore for deep codebase understanding.

#### Scenario: Explorer analyzes codebase
- **WHEN** the explorer agent is invoked
- **THEN** it SHALL output structured insights for the architect without modifying any files
