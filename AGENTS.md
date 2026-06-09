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
- Proxies `/rules` and `/scenarios` to `http://localhost:5000`.
- If the backend is unreachable, the app falls back to **localStorage mock data** and a **local simulation** for dry-run evaluation (see `src/services/apiClient.js`).

## Tailwind v4 Quirk

- Uses `@import "tailwindcss"` in `src/index.css`.
- **No `tailwind.config.js`** — theming is done via `@theme` block in `src/index.css`.
- Custom colors: `slate-950` through `slate-200`, `lime-400/500/600`.

## ESLint Flat Config

- `eslint.config.js` lints `**/*.{js,jsx}` and ignores `dist/`.
- Extends `@eslint/js/recommended`, `react-hooks/flat/recommended`, `react-refresh/vite`.

## Architecture Notes

- **Entry:** `src/main.jsx` → `src/App.jsx`
- **State:** Custom `useReducer` hook in `src/hooks/useRulesReducer.js` (not Redux/Zustand).
- **Editors:** Three-pane layout — Rules (JSON), Facts/Settings (JSON), Results (tree or raw JSON).
- **Schema validation:** Monaco JSON schemas for Rules and Settings are defined in `src/services/schema.js`.
- **Assertions:** Bottom panel lets users assert paths against dry-run results; simple string comparison.

## OpenCode Config

- `rulesengineeditor.client/opencode.json` defines custom agents: `explorer`, `architect`, `builder`, `reviewer`.
- When editing OpenCode agents/skills, use the `customize-opencode` skill.

## What to Avoid

- Do not add a `tailwind.config.js` — Tailwind v4 uses CSS-based config here.
- Do not assume tests exist; `npm run lint` is the only automated check.
- Do not run `npm` commands from repo root; they will fail (no `package.json` at root).
