# UI Agent Roles – RulesEngine JSON Editor

> **STATUS: CURRENT** | This document describes the running system as of Phase 1.0

## Overview

The UI project provides a JSON-first editor for Microsoft.RulesEngine workflow definitions. Technologies: React 19, Vite 8, Tailwind CSS v4, Monaco Editor, JavaScript/JSX.

## Agent Responsibilities

- **Schema Validation**: Configure Monaco Editor JSON schemas in `src/services/schema.js` to validate RulesEngine workflow JSON and ReSettings configuration.
- **JSON Editor Integration**: Maintain Monaco Editor instances across RulesEditorPane, FactsEditorPane, and ResultsViewerPane (read-only). Ensure theme consistency with Tailwind v4 dark theme.
- **API Integration**: Maintain `src/services/apiClient.js` for backend communication. Handle axios configuration, error handling, and localStorage fallback patterns.
- **State Management**: Work with `src/hooks/useRulesReducer.js` string-based JSON state. Ensure JSON parse safety when dispatching state updates.
- **Assertion Testing**: Maintain the AssertionTable component for path-based value extraction and simple string comparison against dry-run results.
- **UI Layout**: Maintain the three-pane layout (Rules, Facts/Settings, Results) and sidebar navigation in `src/App.jsx`.

## Human Revision Points

- Review Monaco Editor schema changes for correctness against RulesEngine schema
- Validate API call patterns in `apiClient.js` against backend OpenAPI spec (`Api/v1.yaml`)
- Check JSON parse safety in reducer actions and component logic
- Review assertion path extraction logic for edge cases
- Verify Tailwind v4 CSS-based theming (no tailwind.config.js)

## Debug Guide

- Run `npm run dev` for local debugging (port 65426)
- Use Chrome DevTools for component inspection
- Check `vite.config.js` proxy settings for API calls
- Validate JSON schemas manually against backend responses
- See `docs/UI.DebugGuide.md` for detailed troubleshooting
