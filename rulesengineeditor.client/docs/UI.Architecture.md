# UI Architecture – RulesEngine JSON Editor (Phase 1.0)

> **STATUS: CURRENT** | This document describes the running system as of Phase 1.0

## Purpose

Provide a developer-facing dashboard to create, save, and dry-run RulesEngine JSON workflows. The UI interacts with the Stateless .NET Evaluation Service via REST API. The editor uses Monaco Editor for JSON editing with schema validation.

**Technologies**: React 19, Vite 8, Tailwind CSS v4, Monaco Editor, JavaScript/JSX (no TypeScript).

---

## Project Structure

```
rulesengineeditor.client/
├── package.json
├── vite.config.js
├── eslint.config.js
├── public/
├── Api/
│   └── v1.yaml              # OpenAPI spec for backend contract
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx           # Workflow/scenario list + save + dry-run trigger
│   │   ├── RulesEditorPane.jsx   # Monaco Editor for Rules JSON
│   │   ├── FactsEditorPane.jsx   # Monaco Editor for Facts + Settings JSON
│   │   ├── ResultsViewerPane.jsx # Tree view or raw JSON of execution results
│   │   └── AssertionTable.jsx    # Expected value assertions against results
│   ├── services/
│   │   ├── apiClient.js          # Axios client with localStorage fallback
│   │   └── schema.js             # Monaco JSON schemas for Rules and Settings
│   ├── hooks/
│   │   └── useRulesReducer.js    # Custom useReducer for JSON string state
│   ├── index.css                 # Tailwind v4 theme (no tailwind.config.js)
│   ├── main.jsx                  # Entry point
│   └── App.jsx                   # Root layout (three-pane + sidebar)
└── docs/
    ├── UI.Architecture.md
    ├── UI.AgentRoles.md
    └── UI.DebugGuide.md
```

---

## Core Components

### Sidebar (`src/components/Sidebar.jsx`)
- Left panel displaying saved workflows and test scenarios
- Save current rules as a workflow
- Trigger dry-run evaluation
- Loads data from backend (with localStorage fallback)

### RulesEditorPane (`src/components/RulesEditorPane.jsx`)
- Monaco Editor for editing Microsoft.RulesEngine workflow JSON
- JSON schema validation via `src/services/schema.js`
- Displays validation errors inline

### FactsEditorPane (`src/components/FactsEditorPane.jsx`)
- Tabbed Monaco Editor for:
  - **Mock Facts (JSON)**: Input data for dry-run evaluation
  - **Settings (JSON)**: ReSettings configuration (ValidationMode, EnableScopedParams, etc.)
- JSON schema validation for Settings tab

### ResultsViewerPane (`src/components/ResultsViewerPane.jsx`)
- Displays dry-run execution results
- Two view modes:
  - **Tree View**: Collapsible tree showing RuleResultTree with success/failure indicators
  - **Raw JSON**: Monaco Editor in read-only mode
- Shows "Sandbox Mode" badge when running local simulation

### AssertionTable (`src/components/AssertionTable.jsx`)
- Bottom panel for asserting expected values against results
- Path-based value extraction (e.g., `[0].IsSuccess`)
- Simple string comparison for pass/fail
- Add/remove assertions dynamically

---

## State Management

### useRulesReducer (`src/hooks/useRulesReducer.js`)
- Custom `useReducer` hook (not Redux/Zustand)
- State is **string-based JSON** for all editor content:
  - `currentRules`: Rules JSON string
  - `currentFacts`: Facts JSON string
  - `currentSettings`: Settings JSON string
- Actions: SET_RULES, SET_FACTS, SET_SETTINGS, SET_TEST_RESULT, ADD/REMOVE/UPDATE_ASSERTION, SET_ACTIVE_SCENARIO

---

## Services

### apiClient.js (`src/services/apiClient.js`)
- Axios client with base URL `/`
- Proxied by Vite dev server to backend
- **Endpoints**:
  - `POST /rules/dry-run` – Execute rules with facts and settings
  - `GET /rules` – List saved workflows
  - `POST /rules` – Save workflow
  - `GET /scenarios` – List test scenarios
  - `POST /scenarios` – Save scenario
- **Fallback behavior**: If backend is unreachable, falls back to:
  - `localStorage` for persistence (mockWorkflows, mockScenarios)
  - Naive local simulation for dry-run (always returns IsSuccess: true)

### schema.js (`src/services/schema.js`)
- JSON Schema definitions for Monaco Editor validation:
  - `rulesEngineWorkflowSchema`: Microsoft.RulesEngine workflow array schema
  - `rulesEngineSettingsSchema`: ReSettings configuration schema

---

## Integration Points

### Backend API
- **Base URL**: `https://localhost:7119/api/`
- **OpenAPI Docs**: `https://localhost:7119/scalar/`
- **Key Endpoints**:
  - `GET /api/Rules` → List workflow summaries
  - `POST /api/Rules/dry-run` → Dry-run evaluation
  - `POST /api/Rules/scenarios` → Save test scenario
- **Vite Proxy**: Dev server proxies requests to the backend HTTP profile at `http://localhost:5064` for local development convenience. Proxied paths include `/rules`, `/scenarios`, `/login`, `/register`, `/refresh`, `/manage`, `/api/passkey`.

### Schema Compliance
- JSON export validated against RulesEngine schema before sending
- Monaco Editor provides real-time JSON validation with error highlighting

---

## Testing Strategy

- **No test framework currently exists**
- `npm run lint` (ESLint) is the only automated verification step
- Manual testing via dry-run with assertion table

---

## Debugging Guide
- Run `npm run dev` for local development (port 65426)
- Use Chrome DevTools + React Developer Tools
- Check `vite.config.js` proxy settings if API calls fail
- Validate JSON output manually with backend `/api/Rules/dry-run` endpoint
- See `docs/UI.DebugGuide.md` for detailed troubleshooting

---

## Human-in-the-Loop
- Developers review schema export logic before merging
- Manual debugging of Monaco Editor integration and API connectivity
- Approve agent-generated UI changes via pull requests
- **Auth (Passkey/FIDO2) is a future proposal** – not implemented in Phase 1.0

---

## Phase Boundary

**Phase 1.0 (Current)**: JSON-first editor with Monaco, string-based state, localStorage fallback.

**Phase 2.0 (Future)**: Visual workflow editor (see `docs/roadmap/Phase2-VisualEditor.md` for aspirational design). Not yet scheduled.
