## ADDED Requirements

### Requirement: Aspirational documentation is physically separated from current documentation
All future-phase and aspirational documentation SHALL reside in docs/roadmap/ directory. Current-state documentation SHALL reside in docs/*.md (root of docs/).

#### Scenario: Agent searches for architecture docs
- **WHEN** an agent looks for system architecture information
- **THEN** it SHALL find the current architecture in docs/UI.Architecture.md
- **AND** it SHALL find aspirational architecture in docs/roadmap/Phase2-VisualEditor.md
- **AND** the two documents SHALL be in different directories

### Requirement: All documentation files have a status header banner
Every .md file in docs/ and docs/roadmap/ SHALL begin with a status banner indicating whether the document describes current state or aspirational future state.

#### Scenario: Agent opens current-state doc
- **WHEN** an agent opens docs/UI.Architecture.md
- **THEN** the first line SHALL be a banner reading: STATUS: CURRENT | This document describes the running system as of Phase 1.0

#### Scenario: Agent opens aspirational doc
- **WHEN** an agent opens docs/roadmap/Phase2-VisualEditor.md
- **THEN** the first line SHALL be a banner reading: STATUS: ASPIRATIONAL | This document describes a future vision, not current implementation. Do not implement without explicit user direction.

### Requirement: AGENTS.md guides agents on documentation usage
The AGENTS.md file SHALL include a section instructing agents on how to use the documentation structure.

#### Scenario: Agent reads AGENTS.md for guidance
- **WHEN** an agent reads the Documentation Structure section of AGENTS.md
- **THEN** it SHALL see instructions to treat docs/*.md as ground truth for current implementation
- **AND** it SHALL see instructions to treat docs/roadmap/*.md as future ideas only
- **AND** it SHALL see a warning: Never implement from docs/roadmap/ without explicit user direction

### Requirement: Phase 2.0 roadmap document references Phase 1.0 components
The docs/roadmap/Phase2-VisualEditor.md document SHALL explicitly reference existing Phase 1.0 components and explain how they would evolve, rather than describing a standalone system.

#### Scenario: Agent reads Phase 2.0 roadmap
- **WHEN** an agent reads the Phase 2.0 visual editor roadmap
- **THEN** it SHALL see references to existing components (RulesEditorPane, FactsEditorPane, etc.)
- **AND** it SHALL understand that Phase 2.0 is an evolution, not a replacement
- **AND** it SHALL see a clear transition path from JSON editing to visual editing
