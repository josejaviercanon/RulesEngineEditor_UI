## Context

The RulesEngine Editor is a single-page React app (no router) with zero authentication. All users currently have unrestricted access to rule editing, dry-run evaluation, and scenario management. The backend (ASP.NET Core) has ASP.NET Core Identity available but the frontend never authenticates.

The app uses `axios` with a Vite proxy for API calls and falls back to localStorage when the backend is unreachable. State is managed via a custom `useReducer` hook. No routing library exists — the entire app lives on one view.

Phase 1.0 explicitly deferred auth; this change implements the documented auth strategy: Passkey (FIDO2) + ASP.NET Core Identity.

The backend exposes ASP.NET Core Identity API endpoints (`MapIdentityApi` pattern from .NET 8+). The actual endpoints are:
- `POST /login` — returns `AccessTokenResponse` with `accessToken`, `refreshToken`, `expiresIn`
- `POST /register` — creates account, returns `AccessTokenResponse`
- `GET /manage/info` — returns `InfoResponse` with `email`, `isEmailConfirmed`
- `POST /refresh` — takes `RefreshRequest` with `refreshToken`, returns new `AccessTokenResponse`
- `POST /logout` — server-side logout, invalidates session
- `POST /api/passkey/login-options` — WebAuthn challenge for login (unauthenticated)
- `POST /api/passkey/login-verify` — WebAuthn assertion verification (unauthenticated)
- `POST /api/passkey/register-options` — WebAuthn challenge for registration (**requires auth + Administrator role**)
- `POST /api/passkey/register-verify` — WebAuthn credential verification (**requires auth + Administrator role**)

**Passkey registration is admin-only**: The backend requires authentication and the Administrator role for passkey registration endpoints. This means passkey registration cannot happen during initial user registration — it must be a post-login, admin-only feature.

## Goals / Non-Goals

**Goals:**
- Add a login page with email/password authentication backed by ASP.NET Core Identity
- Add a registration page for new users via email/password
- Integrate Passkey (FIDO2/WebAuthn) as a primary authentication mechanism alongside password
- Provide a development-only auto-login for `admin@localhost.local` / `Admin@123456` (Administrator role) on localhost
- Protect the main editor behind authentication — unauthenticated users see the login page
- Persist auth tokens (JWT access token + refresh token) in memory
- Attach Bearer token to all API requests made by `apiClient.js`
- Implement token refresh when the access token expires

**Non-Goals:**
- Role-based UI (admin vs user differentiation beyond the dev auto-login) — future work
- OAuth 2.0 / social login providers (Google, Microsoft, GitHub) — not in scope
- Password reset flow — not in scope; registration + login is the v1 auth surface
- Two-factor authentication (beyond WebAuthn/FIDO2 itself) — not in scope
- Offline auth or persistent sessions across browser restarts — tokens live only in memory for Phase 1.0 auth
- Email confirmation flow — backend has `/confirmEmail` but not in scope for v1

## Decisions

### 1. React Router adoption — `react-router-dom` v7

- **Decision**: Introduce `react-router-dom` v7 for client-side routing.
- **Rationale**: The app needs distinct pages (`/login`, `/register`, `/`) with protected navigation. Currently there is zero routing — everything renders inline. A router is the standard React approach for multi-page SPAs. `react-router-dom` is the de-facto standard and `v7` aligns with React 19.
- **Alternatives considered**: 
  - **In-component conditional rendering** (no router) — rejected because it doesn't scale and breaks URL-based navigation, browser back/forward buttons, and deep-linking.
  - **TanStack Router** — more modern but adds learning curve and is unnecessary for this simple 3-route app.

### 2. Auth state via React Context (no global state library)

- **Decision**: Use React Context + `useReducer` for auth state (`AuthContext`), consistent with the existing `useRulesReducer` pattern.
- **Rationale**: Auth is a cross-cutting concern read by many components but written only from login/register/logout actions. Context is sufficient — no need for Redux/Zustand when there are only 3 auth states (loading, authenticated, unauthenticated).
- **Alternatives considered**:
  - **Zustand** — overkill for 3-state auth with simple actions.
  - **Redux** — heavy and inconsistent with the codebase's current approach.

### 3. JWT token in localStorage/sessionStorage + interceptor

- **Decision**: Store the JWT access token and refresh token in `localStorage` (or `sessionStorage` if "Remember me" is not selected), per backend recommendation. Attach via `axios` interceptor.
- **Rationale**: The backend JSON explicitly recommends `localStorage` or `sessionStorage` for token storage. While memory-only is more secure against XSS, the backend team's recommendation takes precedence for consistency. React's JSX escaping and CSP headers mitigate XSS risks. The backend's `MapIdentityApi` returns both `accessToken` and `refreshToken` in the `AccessTokenResponse`.
- **Trade-off**: Tokens persist across page refreshes and browser restarts (if localStorage), which improves UX but increases XSS exposure. This aligns with the backend's intended flow.
- **Alternatives considered**:
  - **Memory-only** — more secure against XSS but loses auth on page refresh. Rejected to align with backend recommendation.
  - **httpOnly cookie only** — The backend supports `useCookies=true` query param on `/login`, but the default behavior returns Bearer tokens. We'll use Bearer tokens for consistency with the existing axios-based API client.

### 4. Token refresh on 401

- **Decision**: When an API call returns 401, attempt to refresh the token using `POST /refresh` with the stored `refreshToken`. If refresh succeeds, retry the original request. If refresh fails, clear auth state and redirect to `/login`.
- **Rationale**: The backend explicitly provides a `/refresh` endpoint. This gives users a seamless experience without requiring re-login every time the access token expires (typically 15-60 minutes).
- **Alternatives considered**:
  - **No refresh — force re-login on 401** — simpler but poor UX for a developer tool.
  - **Proactive refresh before expiry** — more complex; reactive refresh on 401 is sufficient for Phase 1.0.

### 5. WebAuthn via `@simplewebauthn/browser`

- **Decision**: Use `@simplewebauthn/browser` library for the FIDO2/WebAuthn client-side operations.
- **Rationale**: This library handles the browser's `navigator.credentials.create()` and `navigator.credentials.get()` with proper serialization. The backend endpoints (`/api/passkey/*`) follow the standard WebAuthn challenge-response pattern.
- **Alternatives considered**:
  - **Raw WebAuthn API** — more control but significantly more boilerplate for encoding/decoding ArrayBuffers, CBOR, etc.
  - **Azure AD B2C / external IdP** — out of scope per the AGENTS.md requirement for Passkey + ASP.NET Core Identity.

### 6. Dev auto-login as a development-mode feature flag

- **Decision**: The auto-login behavior is gated behind `import.meta.env.DEV` (Vite's dev-mode flag). In production builds, it has zero effect. A loading splash briefly shows while the auto-login API call completes, then transitions directly to the editor.
- **Rationale**: Clean separation — the auto-login code is minimal, lives in `AuthContext`, and is entirely stripped from production bundles through Vite's tree-shaking of dead code.

### 7. New `authClient.js` service separate from `apiClient.js`

- **Decision**: Create `src/services/authClient.js` for all auth-related API calls. The existing `apiClient.js` imports a token-retrieval function from `authClient.js` and attaches it via interceptor.
- **Rationale**: Separation of concerns — auth API (login/register/info/refresh) is conceptually distinct from rules/scenarios API. The interceptor in `apiClient.js` avoids circular dependencies by importing the token getter function.
- **Alternatives considered**:
  - **Inline in apiClient.js** — mixes auth and rules logic in one file.
  - **Dedicated axios instance for auth** — unnecessary; auth and rules share the same base URL and proxy.

### 8. Server-side logout with client-side fallback

- **Decision**: Logout first calls `POST /logout` to invalidate the server-side session, then clears access token and refresh token from storage, resets auth state, and redirects to `/login`. If the server call fails (network error, etc.), the client still clears local tokens to ensure the user is logged out.
- **Rationale**: The backend now exposes a `POST /logout` endpoint. Calling it ensures the server invalidates the session server-side. The client-side cleanup is a fallback guarantee.
- **Alternatives considered**:
  - **Client-side only** — would leave server sessions active. Rejected since a logout endpoint now exists.
  - **Wait for server response before clearing client tokens** — if the server is unreachable, the user remains logged in locally. Rejected in favor of the "clear regardless" approach.

## Risks / Trade-offs

- **[XSS via injected scripts]** → Mitigation: Memory-only JWT storage limits exposure. All user inputs (email, during registration) are submitted as HTTP body only — never rendered as HTML. React's JSX escaping provides additional protection.
- **[Auto-login leaks to production if misconfigured]** → Mitigation: Gated behind `import.meta.env.DEV`. Production builds will never include the auto-login code due to Vite's dead-code elimination. ESLint rules can also flag any usage outside DEV checks.
- **[WebAuthn browser compatibility]** → Mitigation: Passkey login falls back gracefully to email/password. The login form always shows both options. Users on unsupported browsers (very rare in 2026) can still authenticate via password.
- **[Backend auth endpoints don't exist yet]** → Mitigation: The `authClient.js` will have a fallback simulation mode (like `apiClient.js`) for local development without the backend running.
- **[XSS via localStorage token theft]** → Mitigation: React's JSX escaping prevents most XSS vectors. Consider implementing CSP headers. The backend recommendation of localStorage/sessionStorage is accepted with this risk acknowledged.
- **[Page refresh retains auth state]** → Tokens persist in localStorage across refreshes, improving UX. Users should be educated to log out on shared devices.
- **[No role information from backend]** → The `GET /manage/info` endpoint returns `email` and `isEmailConfirmed` but no `roles`. The "Administrator role" for dev auto-login is a hardcoded UI label, not verified from the backend. This is acceptable for Phase 1.0 since role-based UI is explicitly a non-goal.
