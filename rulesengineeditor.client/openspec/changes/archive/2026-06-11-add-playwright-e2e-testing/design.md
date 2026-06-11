## Context

The RulesEngineEditor frontend (`rulesengineeditor.client`) is a React 19 + Vite 8 application with no existing test framework. All validation is currently manual. The backend exposes REST APIs at `http://localhost:5064` (HTTP) and `https://localhost:7119` (HTTPS) with OpenAPI documentation. Authentication is not yet implemented in Phase 1.0, but the testing strategy must be forward-compatible with the planned Passkey (FIDO2) + ASP.NET Core Identity auth.

## Goals / Non-Goals

**Goals:**
- Establish a Playwright-based E2E testing suite that runs locally against the Vite dev server and live backend.
- Provide stable, semantic selectors via `data-testid` attributes on key UI components.
- Cover Workflow CRUD, Scenario CRUD, and dry-run execution with backend verification.
- Enable headed debugging through the VS Code Playwright extension.
- Produce local HTML reports and trace files for rapid failure diagnosis.

**Non-Goals:**
- CI/CD pipeline integration (GitHub Actions, Azure DevOps) — out of scope for this change.
- Visual regression testing baseline management beyond local `--update-snapshots`.
- Cross-browser matrix testing beyond Chromium (Firefox/WebKit can be added later).
- Unit or integration tests for React hooks or services — this is strictly E2E UI testing.
- Mocking the backend — tests MUST hit the real local backend to validate end-to-end correctness.

## Decisions

**1. Playwright over Cypress / Selenium**
- **Rationale**: Playwright has native VS Code extension support, superior trace viewer, and handles modern React/Vite dev server reloading more reliably. It also supports project dependencies (global setup) natively.
- **Alternative considered**: Cypress — heavier bundle, slower in headed mode for this use case.

**2. Global auth setup project (`setup`)**
- **Rationale**: Playwright’s project dependency model lets us run a `tests/auth.setup.ts` script once to authenticate and write `playwright/.auth/user.json`. All functional tests reuse this storage state, avoiding per-test login overhead.
- **Alternative considered**: Per-test login — slower and flakier.

**3. `data-testid` selectors instead of CSS/XPath**
- **Rationale**: Tailwind v4 utility classes are dynamic and prone to refactoring. `data-testid` provides stable, semantic hooks that survive restyling.
- **Trade-off**: Minor clutter in JSX props; acceptable for testability.

**4. Headed execution as default for local dev**
- **Rationale**: The VS Code Playwright extension shines in headed mode with step-through debugging. Headless can be toggled via CLI or CI later.
- **Trade-off**: Slightly slower execution; acceptable for local QA.

**5. Test files co-located under `tests/` at repo root (client folder)**
- **Rationale**: Keeps test code separate from `src/` production code, matching Playwright convention and keeping the Vite build untouched.

## Risks / Trade-offs

- **[Risk]** Backend may not be running when tests start → tests fail immediately.
  - **Mitigation**: Add a `globalSetup` or `setup` project health-check that probes `http://localhost:5064/health` (or a known endpoint) and fails fast with a clear message.
- **[Risk]** `data-testid` props leak into production bundle.
  - **Mitigation**: React 19 does not strip them, but they are harmless DOM attributes. If bundle size becomes a concern, a Babel plugin or Vite plugin could strip them at build time — not needed now.
- **[Risk]** Flaky tests due to Vite HMR or async Monaco Editor initialization.
  - **Mitigation**: Use Playwright’s `waitFor` and `toBeVisible` with generous timeouts for Monaco mount; avoid fixed `page.waitForTimeout`.
- **[Risk]** Future Passkey auth will break JWT-based setup.
  - **Mitigation**: The `auth.setup.ts` is isolated; when Passkey lands, we replace the login flow in that single file while keeping test specs unchanged.

## Migration Plan

1. Install `@playwright/test` and run `npx playwright install` to download browser binaries.
2. Add `playwright.config.ts` with `setup` project dependency.
3. Add `data-testid` attributes to React components (minimal, targeted).
4. Write `tests/auth.setup.ts`, `tests/rules-engine-crud.spec.ts`, `tests/rules-engine-dryrun.spec.ts`.
5. Run `npx playwright test --ui` or use VS Code extension to validate.
6. Update `.gitignore` and `docs/UI.DebugGuide.md` with testing notes.

## Open Questions

- Should we add a `healthcheck` endpoint wrapper in `playwright.config.ts` or rely on test-level retries?
- Do we need a `test` npm script in `package.json` (e.g., `"test:e2e": "playwright test"`) now or in a follow-up?
