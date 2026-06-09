## Context

The RulesEngineEditor UI is currently in Phase 1.0: a Monaco-based JSON editor for Microsoft.RulesEngine workflows. The original project vision included a Phase 2.0 visual workflow editor using ReactFlow, but this was never implemented. The old documentation describing this vision was mixed with current-state docs, causing agents to hallucinate a ReactFlow architecture that does not exist.

After the doc reconciliation change, current-state docs will accurately describe Phase 1.0. However, the Phase 2.0 vision should not be lost - it represents genuine product intent. The challenge is preserving this vision without allowing it to pollute current agentic development.

## Goals / Non-Goals

**Goals:**
- Create a clear separation between current-state documentation and aspirational roadmap documentation
- Preserve the Phase 2.0 visual editor vision in a discoverable but non-ambiguous location
- Establish a documentation header convention that makes document status immediately obvious to agents
- Update AGENTS.md to guide agents on when to read roadmap docs vs current docs

**Non-Goals:**
- No implementation of ReactFlow or visual editor features
- No changes to existing code
- No commitment to Phase 2.0 timeline

## Decisions

### Decision 1: docs/roadmap/ directory for all aspirational documentation
**Rationale**: A dedicated directory creates a physical boundary. Agents scanning docs/ will see current-state files; they must explicitly enter roadmap/ to find future plans.
**Alternative considered**: Prefixing filenames (e.g., ROADMAP-VisualEditor.md). Rejected because it mixes aspirational and current files in the same directory, making it easier for agents to accidentally read the wrong doc.

### Decision 2: Mandatory header banner on all docs files
**Rationale**: Even with directory separation, an agent might open a file without noticing the path. A header banner at the top of every doc file makes the status unmissable.
**Format**:
```markdown
> **STATUS: CURRENT** | This document describes the running system as of Phase 1.0
```
or
```markdown
> **STATUS: ASPIRATIONAL** | This document describes a future vision, not current implementation
```

### Decision 3: AGENTS.md instructs agents to ignore roadmap/ unless explicitly directed
**Rationale**: The primary agent contract (AGENTS.md) should be the gatekeeper. Agents reading AGENTS.md will learn that docs/roadmap/ contains "future ideas only - do not implement without explicit user direction."

### Decision 4: Phase 2.0 doc should describe the transition from Phase 1.0
**Rationale**: A standalone Phase 2.0 doc would read like the old docs - a system description with no context. Instead, the Phase 2.0 doc should explicitly reference Phase 1.0 components and explain how they evolve. This makes the relationship clear and prevents agents from thinking Phase 2.0 replaces everything.

## Risks / Trade-offs

- **[Risk] Agents might still implement from roadmap docs if they ignore instructions** → Mitigation: The ASPIRATIONAL header banner is visually unmistakable. AGENTS.md explicitly warns against it.
- **[Risk] Roadmap docs become stale as the product vision evolves** → Mitigation: The doc includes a "Last Updated" date and a note that it reflects vision as of [date]. Future vision changes should update the doc or create a new roadmap file.
- **[Trade-off] Maintaining two sets of docs increases overhead** → Accepted. The cost of occasional roadmap updates is far less than the cost of agents building the wrong architecture.
