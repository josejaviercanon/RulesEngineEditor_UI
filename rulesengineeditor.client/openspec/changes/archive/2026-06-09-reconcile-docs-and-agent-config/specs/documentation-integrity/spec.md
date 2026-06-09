## ADDED Requirements

### Requirement: Architecture documentation matches running code
The docs/UI.Architecture.md file SHALL describe the actual Phase 1.0 system: Monaco JSON editors, useReducer state management, three-pane layout, and localStorage fallback.

#### Scenario: New developer reads architecture doc
- **WHEN** a developer or agent reads docs/UI.Architecture.md
- **THEN** it SHALL accurately describe the current component hierarchy (Sidebar, RulesEditorPane, FactsEditorPane, ResultsViewerPane, AssertionTable)
- **AND** it SHALL NOT mention ReactFlow, TypeScript, or drag-drop canvas

### Requirement: Agent roles documentation matches actual responsibilities
The docs/UI.AgentRoles.md file SHALL assign responsibilities that match the JSON-editor reality: schema validation, Monaco integration, API client patterns, and JSON state management.

#### Scenario: Agent reads role definitions
- **WHEN** an agent reads docs/UI.AgentRoles.md
- **THEN** it SHALL find responsibilities for JSON editing, API integration, and assertion testing
- **AND** it SHALL NOT find responsibilities for canvas rendering or node editing

### Requirement: Debug guide addresses actual failure modes
The docs/UI.DebugGuide.md file SHALL troubleshoot issues relevant to the Monaco editor and API proxy setup.

#### Scenario: Developer encounters API failure
- **WHEN** a developer reads the debug guide for API issues
- **THEN** it SHALL reference the correct backend port (7119) and OpenAPI documentation URL (https://localhost:7119/scalar/)
- **AND** it SHALL explain the localStorage fallback behavior

#### Scenario: Developer encounters Monaco editor issue
- **WHEN** a developer reads the debug guide for editor issues
- **THEN** it SHALL address Monaco Editor loading, JSON schema validation, and theme matching

### Requirement: AGENTS.md documents real backend contract
The root AGENTS.md file SHALL document the actual backend API contract including the base URL, port, and OpenAPI documentation location.

#### Scenario: Agent reads backend section
- **WHEN** an agent reads the Dev Server and Backend section of AGENTS.md
- **THEN** it SHALL see the correct backend URL (https://localhost:7119)
- **AND** it SHALL see the OpenAPI scalar docs URL (https://localhost:7119/scalar/)
- **AND** it SHALL see a note that auth (Passkey/FIDO2) is a future proposal

### Requirement: Documentation drift prevention
Any future code change that affects architecture, API contracts, or agent responsibilities SHALL require updating the corresponding documentation file.

#### Scenario: Agent modifies API client
- **WHEN** an agent modifies src/services/apiClient.js or vite.config.js
- **THEN** it SHALL update AGENTS.md if the backend contract changes
- **AND** it SHALL update docs/UI.DebugGuide.md if new failure modes are introduced
