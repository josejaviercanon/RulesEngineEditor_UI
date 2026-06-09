## Why

The agentic development workflow for this project is compromised because the documentation, agent configuration, and actual codebase describe three different systems. docs/UI.Architecture.md and docs/UI.AgentRoles.md describe a ReactFlow visual node editor (TypeScript, drag-drop canvas), while the actual code is a Monaco-based JSON editor (JavaScript, three-pane IDE). The opencode.json agent prompts reference non-existent OpenSpec commands (/openspec-apply, /openspec-review). The frontend API client assumes a backend on port 5000 with no /api prefix, while the backend actually runs on port 7119 with /api/Rules paths. If AI agents read these docs and configs, they will design and implement against a fictional architecture, wasting cycles and producing broken code.

## What Changes

- Fix opencode.json: Correct stale command references (/openspec-apply -> /openspec-apply-change, /openspec-review -> /openspec-verify-change). Add mandatory pre-flight instructions for architect and builder agents to read AGENTS.md before acting.
- Rewrite docs/UI.Architecture.md: Replace ReactFlow/TypeScript fiction with the actual Phase 1.0 architecture: Monaco JSON editors, useReducer state, three-pane layout, assertion table, and localStorage fallback.
- Rewrite docs/UI.AgentRoles.md: Update agent responsibilities to match the JSON-editor reality (schema validation, Monaco integration, API client patterns) instead of canvas rendering and node editing.
- Rewrite docs/UI.DebugGuide.md: Replace ReactFlow-specific debugging with actual issues (Monaco editor loading, API proxy mismatches, JSON parse errors, localStorage mock drift).
- Update AGENTS.md: Add the real backend contract (https://localhost:7119/api/), document the Passkey auth roadmap, and clarify the Phase 1.0 vs future Phase 2 boundary.
- Fix API client references: Update vite.config.js proxy and apiClient.js comments to reference the correct backend port and path prefix, without implementing auth yet.

## Capabilities

### New Capabilities
- agent-config-ground-truth: Establishes correct OpenSpec command references and mandatory pre-flight reading for all agents. Ensures agents operate against real commands, not hallucinated ones.
- documentation-integrity: Defines a documentation standard where all .md files in docs/ must match the running code. Creates a template for keeping architecture docs, agent roles, and debug guides in sync with implementation.

### Modified Capabilities

## Impact

- Files modified: opencode.json, docs/UI.Architecture.md, docs/UI.AgentRoles.md, docs/UI.DebugGuide.md, AGENTS.md (root), src/services/apiClient.js (comments only), vite.config.js (comments only).
- No runtime behavior changes: This is a documentation and configuration reconciliation. No user-facing UI changes.
- Agent workflow impact: After this change, architect agents will design against the Monaco JSON editor. builder agents will use correct OpenSpec commands. reviewer agents will verify against the actual system.
- Risk if not done: Every future agentic sprint will start with 1-2 rounds of confusion and rework as agents discover the doc/code mismatch.
