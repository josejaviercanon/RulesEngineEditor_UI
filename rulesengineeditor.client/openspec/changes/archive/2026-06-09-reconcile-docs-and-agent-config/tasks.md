## 1. Fix Agent Configuration (opencode.json)

- [x] 1.1 Update builder agent prompt: replace /openspec-apply with /openspec-apply-change
- [x] 1.2 Update reviewer agent prompt: replace /openspec-review with /openspec-verify-change and /openspec-explore
- [x] 1.3 Update architect agent prompt: add mandatory pre-flight instruction to read AGENTS.md before designing
- [x] 1.4 Update builder agent prompt: add mandatory pre-flight instruction to read AGENTS.md before implementing
- [x] 1.5 Validate opencode.json syntax with JSON parser

## 2. Rewrite Architecture Documentation

- [x] 2.1 Rewrite docs/UI.Architecture.md to describe Phase 1.0 Monaco JSON editor (not ReactFlow/TypeScript)
- [x] 2.2 Document actual component hierarchy: Sidebar, RulesEditorPane, FactsEditorPane, ResultsViewerPane, AssertionTable
- [x] 2.3 Document actual services: apiClient.js with axios, localStorage fallback, mock simulation
- [x] 2.4 Document actual hooks: useRulesReducer.js with string-based JSON state
- [x] 2.5 Document actual integration points: /api/Rules, /api/Rules/dry-run, /api/Rules/scenarios
- [x] 2.6 Remove all references to ReactFlow, WorkflowCanvas, NodeEditor, SchemaExporter, TypeScript

## 3. Rewrite Agent Roles Documentation

- [x] 3.1 Rewrite docs/UI.AgentRoles.md to match JSON-editor responsibilities
- [x] 3.2 Define agent responsibilities: Schema validation (Monaco JSON schemas), API integration, Assertion testing
- [x] 3.3 Update human revision points to match actual code review needs
- [x] 3.4 Remove all references to ReactFlow node rendering, canvas editing, TypeScript

## 4. Rewrite Debug Guide

- [x] 4.1 Rewrite docs/UI.DebugGuide.md to address actual failure modes
- [x] 4.2 Document Monaco Editor loading issues and theme mismatches
- [x] 4.3 Document API proxy configuration and backend connectivity
- [x] 4.4 Document JSON parse errors in useReducer state
- [x] 4.5 Document localStorage mock data drift and simulation limitations
- [x] 4.6 Remove all references to ReactFlow node rendering errors

## 5. Update Root AGENTS.md

- [x] 5.1 Add real backend contract section: https://localhost:7119, /api/Rules paths
- [x] 5.2 Add OpenAPI documentation URL: https://localhost:7119/scalar/
- [x] 5.3 Add Passkey/FIDO2 auth roadmap note (future proposal, not current)
- [x] 5.4 Add Phase 1.0 vs Phase 2 boundary clarification
- [x] 5.5 Add Documentation Integrity clause: agents must update docs when changing architecture/API/agent responsibilities
- [x] 5.6 Update Architecture Notes section to match actual component names and file paths

## 6. Add API Contract Comments to Code

- [x] 6.1 Add comment in vite.config.js documenting real backend URL and noting proxy is for local dev convenience
- [x] 6.2 Add comment in apiClient.js documenting real backend base URL and OpenAPI spec location
- [x] 6.3 Add comment in apiClient.js documenting that auth is not yet implemented

## 7. Verification

- [x] 7.1 Run npm run lint to ensure no syntax errors in modified files
- [x] 7.2 Verify all markdown files render correctly
- [x] 7.3 Cross-check: search for "ReactFlow" in docs/ and ensure zero occurrences
- [x] 7.4 Cross-check: search for "TypeScript" in docs/ and ensure zero occurrences (except as historical note if needed)
- [x] 7.5 Cross-check: verify opencode.json contains only valid OpenSpec command references
