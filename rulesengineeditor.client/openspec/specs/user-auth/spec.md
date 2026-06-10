# User Authentication

## Purpose

Provide user authentication for the RulesEngine Editor via ASP.NET Core Identity (email/password) and Passkey (FIDO2/WebAuthn). Supports login, logout, session management, token refresh, protected route access, and admin-only passkey registration.

## Requirements

### Requirement: User can log in with email and password
The system SHALL provide a login page at `/login` with an email and password form. On successful authentication, the system SHALL store the JWT access token and refresh token in `localStorage` (or `sessionStorage`) and redirect the user to the main editor page (`/`). On failure, the system SHALL display a clear error message without redirecting. The login form SHALL support both keyboard tab navigation and screen reader announcements.

#### Scenario: Successful login with valid credentials
- **WHEN** the user navigates to `/login`, enters a registered email and correct password, and clicks "Sign In"
- **THEN** the system SHALL authenticate via `POST /login`, store the `accessToken` and `refreshToken`, and redirect to `/`

#### Scenario: Failed login with invalid credentials
- **WHEN** the user enters an email that is not registered or an incorrect password
- **THEN** the system SHALL show an error message "Invalid email or password" and remain on `/login`

#### Scenario: Login form validation
- **WHEN** the user submits the login form with an empty email or password field
- **THEN** the system SHALL show inline validation errors and NOT submit the form

### Requirement: User can log in with Passkey (FIDO2 / WebAuthn)
The system SHALL provide a "Sign in with Passkey" option on the login page. When selected, the system SHALL request a WebAuthn assertion from the browser (via `navigator.credentials.get`), send it to `POST /api/passkey/login-verify`, and on success log the user in. The Passkey option SHALL be presented alongside email/password, not as a replacement. On browsers that do not support WebAuthn, the button SHALL be hidden.

#### Scenario: Successful Passkey login
- **WHEN** the user clicks "Sign in with Passkey", the browser shows the platform authenticator prompt, and the user successfully authenticates
- **THEN** the system SHALL call `POST /api/passkey/login-options` to get a challenge, then `POST /api/passkey/login-verify` to verify the assertion, log the user in, and redirect to `/`

#### Scenario: Passkey login cancelled by user
- **WHEN** the user clicks "Sign in with Passkey" but cancels the authenticator prompt
- **THEN** the system SHALL show a message "Passkey authentication cancelled" and remain on `/login`

### Requirement: User can log out
The system SHALL provide a logout action accessible from the main editor UI. On logout, the system SHALL call `POST /logout` to invalidate the server-side session, then clear the JWT access token and refresh token from storage, reset the auth state, and redirect to `/login`.

#### Scenario: Successful logout
- **WHEN** the authenticated user clicks the "Sign Out" button in the editor toolbar
- **THEN** the system SHALL call `POST /logout`, clear the auth tokens from storage, redirect to `/login`, and require re-authentication to access `/`

#### Scenario: Logout with server error
- **WHEN** the user clicks "Sign Out" but the server returns an error (e.g., network failure)
- **THEN** the system SHALL still clear the local auth tokens and redirect to `/login` to ensure the client is logged out regardless of server state

### Requirement: Admin user can register a Passkey (FIDO2 / WebAuthn)
The system SHALL provide a "Register Passkey" option accessible only to authenticated users with the Administrator role. When selected, the system SHALL call `POST /api/passkey/register-options` (requires authentication and Administrator role) to get a challenge, use the browser's `navigator.credentials.create()` to create a credential, and send it to `POST /api/passkey/register-verify` for verification. The option SHALL be hidden for non-admin users.

#### Scenario: Successful Passkey registration by admin
- **WHEN** an authenticated admin user clicks "Register Passkey" and successfully completes the browser authenticator prompt
- **THEN** the system SHALL verify the credential with the backend and show a success message

#### Scenario: Passkey registration cancelled by admin
- **WHEN** an admin user clicks "Register Passkey" but cancels the authenticator prompt
- **THEN** the system SHALL show a message "Passkey registration cancelled" and remain on the current page

#### Scenario: Non-admin user cannot see Passkey registration
- **WHEN** a user without the Administrator role is authenticated
- **THEN** the system SHALL NOT display the "Register Passkey" option in the UI

### Requirement: Authenticated API requests
All API requests made by `apiClient.js` SHALL include an `Authorization: Bearer <accessToken>` header when a JWT access token is available. Tokens SHALL be stored in `localStorage` or `sessionStorage` per backend recommendation. If the backend returns a 401 response, the system SHALL attempt to refresh the token using `POST /refresh` with the stored `refreshToken`. If refresh succeeds, the system SHALL retry the original request. If refresh fails, the system SHALL clear the auth state and redirect to `/login`.

#### Scenario: API request with valid token
- **WHEN** the user is authenticated and the app calls any API endpoint (e.g., `GET /rules`)
- **THEN** the `Authorization: Bearer <accessToken>` header SHALL be attached automatically

#### Scenario: API request returns 401 and refresh succeeds
- **WHEN** the access token is expired and an API call returns 401
- **THEN** the system SHALL call `POST /refresh` with the stored `refreshToken`, receive a new `AccessTokenResponse`, retry the original request with the new token, and the user SHALL NOT be interrupted

#### Scenario: API request returns 401 and refresh fails
- **WHEN** the access token is expired and the refresh token is also invalid or expired
- **THEN** the system SHALL clear the auth state and redirect the user to `/login`

### Requirement: Protected routes
The main editor (`/`) SHALL be a protected route. Unauthenticated users attempting to access `/` SHALL be redirected to `/login`. The login and register pages SHALL be public (no authentication required).

#### Scenario: Unauthenticated user tries to access editor
- **WHEN** a user who is not authenticated navigates to `/`
- **THEN** the system SHALL redirect to `/login`

#### Scenario: Authenticated user accesses editor
- **WHEN** an authenticated user navigates to `/`
- **THEN** the system SHALL render the main editor layout (Sidebar, RulesEditor, FactsEditor, ResultsViewer)

### Requirement: Auth state context
The system SHALL provide a React context (`AuthContext`) that exposes the following to all descendant components: `user` (object with `email`, `isEmailConfirmed`, `roles`, or null), `isAuthenticated` (boolean), `isLoading` (boolean), `login(email, password)` (async), `loginWithPasskey()` (async), `registerPasskey()` (async, admin-only), `logout()` (async), and `register(email, password)` (async). Components SHALL use the `useAuth()` hook to access this context.

#### Scenario: Auth context exposes user state
- **WHEN** any component calls `useAuth()`
- **THEN** it SHALL receive the current auth state and action methods

#### Scenario: Auth context on page load
- **WHEN** the app loads for the first time
- **THEN** the auth context SHALL be in the `isLoading` state, call `GET /manage/info` to check for an existing session, and transition to `isAuthenticated: true` or `isAuthenticated: false`
