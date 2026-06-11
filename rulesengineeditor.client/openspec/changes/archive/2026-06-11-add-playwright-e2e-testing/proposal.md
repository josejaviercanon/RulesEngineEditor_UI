## Why

The RulesEngineEditor frontend currently has no automated UI or end-to-end test coverage. Manual verification of workflow CRUD, scenario management, and dry-run execution against the live backend is time-consuming and error-prone. We need a robust Playwright-based E2E testing framework that runs locally against the dev server and backend to guarantee correctness before every release.

## What Changes

- Add Playwright as a dev dependency with a `playwright.config.ts` configured for local development.
- Create a global authentication setup project (`tests/auth.setup.ts`) that logs in via the backend and writes a reusable JWT state to `playwright/.auth/user.json`.
- Implement `tests/rules-engine-crud.spec.ts` covering full Workflow and Scenario CRUD operations.
- Implement `tests/rules-engine-dryrun.spec.ts` covering scenario execution, dry-run simulation, and live backend verification.
- Add `data-testid` attributes to key React components so selectors are stable and semantic.
- Configure `.vscode/settings.json` to align the Playwright extension with OpenCode workspace evaluation.
- Add `test-results/` and `playwright/.auth/` to `.gitignore`.

## Capabilities

### New Capabilities
- `playwright-e2e-testing`: End-to-end UI testing framework using Playwright against the local React frontend and backend API. Covers authentication, workflow/scenario CRUD, and dry-run execution validation.

### Modified Capabilities
- *(none — this change introduces testing infrastructure without altering existing product requirements)*

## Impact

- **Dependencies**: New dev dependency `@playwright/test` and optionally `@types/node`.
- **Frontend source**: Minor additions of `data-testid` props to `Sidebar`, `RulesEditorPane`, `FactsEditorPane`, `ResultsViewerPane`, and `AssertionTable` components.
- **Backend**: Requires the local backend (`http://localhost:5064` or `https://localhost:7119`) to be running during test execution.
- **CI/CD**: Future integration can run `npx playwright test` in CI; not in scope for this proposal.
- **Developer workflow**: VS Code Playwright extension recommended for headed debugging.
