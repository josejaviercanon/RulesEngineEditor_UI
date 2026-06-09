## Why

The current documentation crisis (docs describing ReactFlow while code is Monaco JSON editor) happened because aspirational architecture was written as if it were current state. When Phase 2 (visual workflow editor) is eventually implemented, the same drift could happen in reverse: agents might read the current Monaco docs and think the system is still JSON-only, or the Phase 2 docs might overwrite Phase 1 context that is still relevant for maintenance. We need a documentation versioning strategy that keeps both current ground truth and future aspirations clearly separated.

## What Changes

- Create docs/roadmap/ directory for aspirational and future-phase documentation
- Write docs/roadmap/Phase2-VisualEditor.md describing the ReactFlow visual editor vision
- Establish a documentation versioning convention: current state lives in docs/*.md, future state lives in docs/roadmap/*.md
- Add a header convention to all docs files indicating their phase/status (CURRENT, ASPIRATIONAL, DEPRECATED)
- Update AGENTS.md to instruct agents to check docs/roadmap/ for future context but never implement from it without explicit user direction
- No code changes - this is purely documentation structure

## Capabilities

### New Capabilities
- documentation-versioning: Establishes a clear separation between current-state docs and aspirational roadmap docs. Prevents agents from confusing Phase 1 reality with Phase 2 vision.

### Modified Capabilities

## Impact

- New directory: docs/roadmap/
- New file: docs/roadmap/Phase2-VisualEditor.md
- Modified: AGENTS.md (adds docs/roadmap/ guidance)
- No runtime impact
- All future agentic development will have clear boundaries between "implement now" and "consider for future"
