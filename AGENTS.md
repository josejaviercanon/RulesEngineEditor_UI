# AGENTS.md — RulesEngineEditor Frontend

Compact guidance for OpenCode sessions working in this repo.

## Repo Layout

- **Root is a container.** The actual React app lives inside `rulesengineeditor.client/`.
- All `npm` / `vite` / `eslint` commands must run from `rulesengineeditor.client/`.
- `rulesengineeditor.client/.opencode/` contains repo-local OpenCode skills and `opencode.json` agent definitions. It is git-ignored internally (its own `.gitignore` excludes `node_modules package.json package-lock.json bun.lock .gitignore`).

## Tech Stack

- React 19 + Vite 8 + Tailwind CSS v4
- Monaco Editor (`@monaco-editor/react`) for JSON editing
- ESLint 10 with flat config (`eslint.config.js`)
- **No TypeScript** — all source is `.jsx` / `.js`
- **No test framework** — no tests exist yet

## Developer Commands

Run from `rulesengineeditor.client/`:

```bash
npm install   # install deps
npm run dev   # vite dev server on port 65426
npm run build # vite build → dist/
npm run lint  # eslint . (only verification step)
npm run preview # vite preview
```

## Dev Server & Backend

- Vite config hardcodes `port: 65426`.
- Proxies `/rules` and `/scenarios` to `http://localhost:5000` for local dev convenience.
- **Real backend URL**: `https://localhost:7119/api/`
- **OpenAPI Documentation**: `https://localhost:7119/scalar/` (Scalar UI for API exploration)
- **Backend OpenAPI Spec**: `Api/v1.yaml` in the client project
- If the backend is unreachable, the app falls back to **localStorage mock data** and a **local simulation** for dry-run evaluation (see `src/services/apiClient.js`).
- **Auth**: Not implemented in Phase 1.0. Authentication method will be "Passkey (FIDO2) + ASP.NET Core Identity" — scheduled as a future proposal.

## Tailwind v4 Quirk

- Uses `@import "tailwindcss"` in `src/index.css`.
- **No `tailwind.config.js`** — theming is done via `@theme` block in `src/index.css`.
- Custom colors: `slate-950` through `slate-200`, `lime-400/500/600`.

## ESLint Flat Config

- `eslint.config.js` lints `**/*.{js,jsx}` and ignores `dist/`.
- Extends `@eslint/js/recommended`, `react-hooks/flat/recommended`, `react-refresh/vite`.

## Architecture Notes

- **Entry:** `src/main.jsx` → `src/App.jsx`
- **State:** Custom `useReducer` hook in `src/hooks/useRulesReducer.js` (not Redux/Zustand). State stores raw JSON strings.
- **Layout:** Sidebar (`src/components/Sidebar.jsx`) + three-pane main area:
  - **Rules Editor** (`src/components/RulesEditorPane.jsx`) — Monaco Editor for Rules JSON
  - **Facts/Settings Editor** (`src/components/FactsEditorPane.jsx`) — Tabbed Monaco Editor for Facts and ReSettings JSON
  - **Results Viewer** (`src/components/ResultsViewerPane.jsx`) — Tree view or raw JSON of execution results
- **Assertions:** Bottom panel (`src/components/AssertionTable.jsx`) lets users assert paths against dry-run results; simple string comparison.
- **Schema validation:** Monaco JSON schemas for Rules and Settings are defined in `src/services/schema.js`.
- **API Client:** `src/services/apiClient.js` — axios with localStorage fallback and naive simulation.
- **Phase 1.0 (Current)**: JSON-first editor. Phase 2.0 (Future): Visual workflow editor — see `docs/roadmap/Phase2-VisualEditor.md` for aspirational design.

## OpenCode Config

- `rulesengineeditor.client/opencode.json` defines custom agents: `explorer`, `architect`, `builder`, `reviewer`.
- When editing OpenCode agents/skills, use the `customize-opencode` skill.

## Documentation Structure

- **Current state** lives in `docs/*.md` — these describe the running system and are ground truth for implementation.
- **Aspirational / future state** lives in `docs/roadmap/*.md` — these describe product vision and future phases.
- **Never implement from `docs/roadmap/` without explicit user direction.**
- All documentation files have a status banner at the top indicating `CURRENT` or `ASPIRATIONAL`.

## Documentation Integrity

Any agent modifying code that affects **architecture**, **API contracts**, or **agent responsibilities** MUST update the corresponding documentation file:
- Architecture changes → update `docs/UI.Architecture.md`
- API contract changes → update `AGENTS.md` (Dev Server & Backend section) and `docs/UI.DebugGuide.md`
- Agent responsibility changes → update `docs/UI.AgentRoles.md`
- New failure modes → update `docs/UI.DebugGuide.md`

## What to Avoid

- Do not add a `tailwind.config.js` — Tailwind v4 uses CSS-based config here.
- Do not assume tests exist; `npm run lint` is the only automated check.
- Do not run `npm` commands from repo root; they will fail (no `package.json` at root).
