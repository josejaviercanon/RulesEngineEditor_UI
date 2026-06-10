# Debug Guide – RulesEngine JSON Editor

> **STATUS: CURRENT** | This document describes the running system as of Phase 1.0

## Common Issues

### 1. Monaco Editor Loading Errors
- **Symptom**: Editor shows blank area or "Loading..." indefinitely.
- **Fix**: Check network tab for Monaco loader script failures. Ensure `@monaco-editor/react` is installed. Verify no CSP blocking script loading. Try clearing `node_modules/.vite` cache and restarting dev server.

### 2. API Call Failures
- **Symptom**: Dry-run returns no results or "Sandbox Mode" badge appears immediately.
- **Fix**: 
  - Verify the backend is running on one of the profiles:
    - **HTTP profile**: `http://localhost:5064` (run with `http` launch profile)
    - **HTTPS profile**: `https://localhost:7119` (run with `https` launch profile)
  - Check OpenAPI docs at `https://localhost:7119/scalar/` for endpoint availability
  - Verify `vite.config.js` proxy settings (proxies to `http://localhost:5064` — matches the HTTP profile)
  - Check browser console for CORS or network errors
  - If backend is unreachable, app falls back to localStorage mock data and naive simulation

### 3. JSON Parse Errors in State
- **Symptom**: UI crashes or shows blank after editing JSON.
- **Fix**: 
  - Check `useRulesReducer.js` – state stores raw JSON strings
  - `App.jsx` parses settings with `JSON.parse` inside `try/catch` in `useMemo`
  - Ensure components handle parse failures gracefully
  - Validate JSON in Monaco Editor before dispatching state updates

### 4. Schema Validation Mismatches
- **Symptom**: Monaco shows validation errors for valid RulesEngine JSON.
- **Fix**: 
  - Review `src/services/schema.js` against actual backend OpenAPI spec (`Api/v1.yaml`)
  - Check that schema URIs match `fileMatch` patterns in Monaco config
  - Note: `workflow-schema.json` in repo root may differ from `schema.js` – ensure consistency

### 5. localStorage Mock Data Drift
- **Symptom**: Saved workflows/scenarios don't match backend data.
- **Fix**: 
  - Clear `localStorage` keys: `mockWorkflows`, `mockScenarios`
  - Remember: localStorage fallback only activates when backend is unreachable
  - Mock simulation in `apiClient.js` always returns `IsSuccess: true` – do not rely on it for real validation

### 6. Theme Mismatches
- **Symptom**: Monaco Editor looks out of place with dark theme.
- **Fix**: 
  - Check `src/index.css` for Monaco-specific overrides (`.monaco-editor` background transparency)
  - Ensure `theme="vs-dark"` is set on all Editor instances
  - Tailwind v4 colors are defined in `index.css` `@theme` block, not `tailwind.config.js`

---

## Debugging Steps

1. Run `npm run dev` and open Chrome DevTools
2. Use React Developer Tools to inspect component state (especially string-based JSON state)
3. Check Network tab for API call failures and response payloads
4. Validate JSON output manually with backend `POST /api/Rules/dry-run` endpoint
5. Check Application tab > Local Storage for mock data drift
6. Review Monaco Editor console for schema validation errors

---

## Human Intervention

- Developers manually adjust Monaco Editor configuration and themes
- Review schema definitions in `schema.js` before committing
- Validate API call patterns against backend OpenAPI spec
- Approve agent-generated UI changes via pull requests
