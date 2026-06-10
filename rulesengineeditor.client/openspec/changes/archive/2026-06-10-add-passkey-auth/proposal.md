## Why

The RulesEngine Editor currently has no authentication layer — the app is fully anonymous and unprotected. AGENTS.md identifies Passkey (FIDO2) + ASP.NET Core Identity as the designated auth method, scheduled as a future proposal. With the backend API now requiring authenticated sessions (ASP.NET Core Identity endpoints exist), the UI must implement user authentication to enable multi-user workflows, protect rule data, and align with the documented security roadmap.

## What Changes

- **New Login Page (`/login`)**: Email/password form with Passkey (FIDO2) authentication support; on localhost, auto-logs in as the admin dev user
- **New Register Page (`/register`)**: Email-based user registration form with validation
- **Auth State Management**: React context + hook (`AuthContext`, `useAuth`) providing user identity, login/logout/register actions, token management
- **Protected Routing**: Wrapping the main editor layout so unauthenticated users are redirected to `/login`
- **API Client Update**: `apiClient.js` attaches Bearer token to requests; new auth endpoints (`POST /login`, `POST /register`, `GET /manage/info`, `POST /refresh`, `POST /logout`)
- **Vite Proxy Addition**: `/login`, `/register`, `/refresh`, `/manage`, `/logout`, and `/api/passkey` routes proxied to the backend
- **Auto-Login for Dev**: In development (`localhost:65426`), an auto-login flow signs in as `admin@localhost.local` with password `Admin@123456` and Administrator role
- **Passkey (FIDO2) Support**: Conditional UI for WebAuthn-based login alongside email/password; **admin-only** passkey registration
- **Dependency Additions**: `react-router-dom` for routing

## Capabilities

### New Capabilities

- `user-auth`: User authentication via ASP.NET Core Identity (email/password) and Passkey (FIDO2 / WebAuthn). Provides login, logout, session management, and protected route access.
- `user-registration`: New user registration via email with password, including form validation and confirmation feedback.
- `dev-auto-login`: Development-only convenience auto-login on localhost using pre-seeded admin credentials (`admin@localhost.local` / `Admin@123456`, Administrator role). Bypasses login page entirely in dev mode.

### Modified Capabilities

- *(No existing capabilities are changed — this is the first auth integration)*

## Impact

- **New dependencies**: `react-router-dom` (routing), `@simplewebauthn/browser` (WebAuthn/FIDO2 client)
- **New files**: 
  - `src/context/AuthContext.jsx` — auth state provider and consumer
  - `src/components/LoginPage.jsx` — login form page
  - `src/components/RegisterPage.jsx` — registration form page
  - `src/services/authClient.js` — auth-specific API calls
- **Modified files**:
  - `App.jsx` — wrap with `AuthProvider`, add router, protected route logic
  - `main.jsx` — wrap with `BrowserRouter`
  - `apiClient.js` — add auth interceptor for Bearer token
  - `vite.config.js` — proxy auth endpoints to backend
  - `package.json` — add `react-router-dom`, `@simplewebauthn/browser`
- **Backend contract**: Uses ASP.NET Core Identity API endpoints:
  - `POST /login` — Email/password login (returns `AccessTokenResponse` with `accessToken`, `refreshToken`, `expiresIn`)
  - `POST /register` — Email/password registration
  - `GET /manage/info` — Get current user info (returns `InfoResponse` with `email`, `isEmailConfirmed`)
  - `POST /refresh` — Refresh access token using `refreshToken`
  - `POST /logout` — Server-side logout (invalidates session)
  - `POST /api/passkey/login-options` — Get WebAuthn challenge for login (unauthenticated)
  - `POST /api/passkey/login-verify` — Verify WebAuthn assertion for login (unauthenticated)
  - `POST /api/passkey/register-options` — Get WebAuthn challenge for registration (**requires auth + Administrator role**)
  - `POST /api/passkey/register-verify` — Verify WebAuthn credential for registration (**requires auth + Administrator role**)
  - **Token storage**: `localStorage` or `sessionStorage` per backend recommendation
