## Context

The RulesEngineEditor frontend is a Phase 1.0 developer dashboard built as a Monaco-based JSON editor (React 19, Vite 8, Tailwind v4, JavaScript/JSX). It provides three panes for editing Rules JSON, Facts/Settings JSON, and viewing execution results, plus an assertion table for dry-run validation. The backend is an ASP.NET Core 10 Web API running on https://localhost:7119 with OpenAPI-documented endpoints under /api/Rules.

However, the repository contains documentation and configuration that describe a completely different system:
- docs/UI.Architecture.md describes a ReactFlow drag-drop canvas with TypeScript
- docs/UI.AgentRoles.md assigns responsibilities for node rendering and schema export
- docs/UI.DebugGuide.md troubleshoots ReactFlow node alignment issues
- opencode.json references non-existent OpenSpec commands
- AGENTS.md does not document the real backend port or API prefix

This creates a ground-truth crisis for agentic development. AI agents reading these files will design and implement against a fictional architecture.

## Goals / Non-Goals

**Goals:**
- Establish a single source of truth for the current architecture (Phase 1.0 Monaco JSON editor)
- Fix agent configuration so all OpenSpec command references are valid
- Mandate that every agent reads AGENTS.md before acting
- Update API contract references to match the real backend (port 7119, /api prefix)
- Create a maintainable documentation structure that prevents future drift

**Non-Goals:**
- No runtime code changes (no UI behavior changes, no new features)
- No auth implementation (Passkey/FIDO2 is a future proposal)
- No migration to TypeScript or ReactFlow (those are future phases)
- No test framework introduction

## Decisions

### Decision 1: Rewrite docs from scratch rather than incrementally patch
**Rationale**: The existing docs describe a system that does not exist. Incremental patching would leave confusing remnants (e.g., "ReactFlow" mentioned in passing). A clean rewrite is faster and clearer.
**Alternative considered**: Marking old docs as [DEPRECATED] and adding new sections. Rejected because agents might still read deprecated sections and act on them.

### Decision 2: Keep AGENTS.md as the primary agent contract, docs/ as secondary
**Rationale**: AGENTS.md is already the file agents are instructed to read. It should contain the most critical constraints (tech stack, commands to avoid, backend contract). The docs/ folder provides deeper context.
**Alternative considered**: Moving everything into AGENTS.md. Rejected because it would become too long and lose structure.

### Decision 3: Add backend contract to AGENTS.md but not implement auth yet
**Rationale**: The backend URL and API prefix are critical for any agent working on API integration. However, auth is explicitly out of scope for this change. We document the contract and note that auth is a future proposal.

### Decision 4: Use comments in apiClient.js and vite.config.js rather than changing proxy logic
**Rationale**: The actual proxy behavior might still be correct for the developer's local setup (they may have configured port 5000 forwarding). We add clarifying comments that document the real backend without breaking existing dev workflows.

### Decision 5: opencode.json fixes are additive, not structural
**Rationale**: The 4-agent model (explorer, architect, builder, reviewer) is sound. We only fix the prompt text and command references. We do not change models, permissions, or add new agents.

## Risks / Trade-offs

- **[Risk] Agents may still hallucinate ReactFlow if they have prior context** → Mitigation: The rewritten docs explicitly state "No ReactFlow" and "No TypeScript" in the first paragraph.
- **[Risk] Future code changes will cause docs to drift again** → Mitigation: AGENTS.md will include a "Documentation Integrity" section stating that any agent modifying code must update relevant docs if the change affects architecture, API contracts, or agent responsibilities.
- **[Risk] The backend port/path might change again** → Mitigation: AGENTS.md will reference the OpenAPI spec file (Api/v1.yaml) as the canonical contract, making the URL one level of indirection rather than hardcoded truth.
- **[Trade-off] Clean doc rewrite loses historical context** → Accepted. Git history preserves the old docs. The CHANGELOG.md can note this reconciliation.
