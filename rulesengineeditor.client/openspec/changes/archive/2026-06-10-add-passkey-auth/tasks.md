## 1. Setup Dependencies and Routing

- [x] 1.1 Install `react-router-dom` and `@simplewebauthn/browser` npm packages
- [x] 1.2 Update `vite.config.js` to proxy auth endpoints to `http://localhost:5064`:
  - `/login`, `/register`, `/refresh`, `/manage`, `/logout`, `/api/passkey`
- [x] 1.3 Wrap `main.jsx` with `<BrowserRouter>` from react-router-dom
- [x] 1.4 Create `src/context/` directory structure for auth

## 2. Auth API Service (`authClient.js`)

- [x] 2.1 Create `src/services/authClient.js` with functions:
  - `login(email, password)` → `POST /login`
  - `register(email, password)` → `POST /register`
  - `getCurrentUser()` → `GET /manage/info`
  - `refreshToken(refreshToken)` → `POST /refresh`
  - `logout()` → `POST /logout`
  - `getAccessToken()`, `setAccessToken(token)`, `clearTokens()`
  - `getRefreshToken()`, `setRefreshToken(token)`
- [x] 2.2 Implement token storage in `localStorage` (or `sessionStorage` if "Remember me" is unchecked), per backend recommendation
- [x] 2.3 Add WebAuthn functions:
  - `getPasskeyLoginOptions()` → `POST /api/passkey/login-options`
  - `verifyPasskeyLogin(credential)` → `POST /api/passkey/login-verify`
  - `getPasskeyRegisterOptions()` → `POST /api/passkey/register-options`
  - `verifyPasskeyRegister(credential)` → `POST /api/passkey/register-verify`
- [x] 2.4 Add fallback simulation mode for auth endpoints when backend is unreachable (like `apiClient.js`)

## 3. Auth Context and Hook (`AuthContext.jsx`)

- [x] 3.1 Create `src/context/AuthContext.jsx` with `createContext`, `AuthProvider` component, and `useAuth` hook
- [x] 3.2 Implement auth state: `user`, `isAuthenticated`, `isLoading` using `useReducer`
- [x] 3.3 Implement `login(email, password)` action — calls `authClient.login`, stores tokens, sets user
- [x] 3.4 Implement `loginWithPasskey()` action — WebAuthn assertion flow using `authClient.getPasskeyLoginOptions` and `authClient.verifyPasskeyLogin`
- [x] 3.4a Implement `registerPasskey()` action (admin-only) — WebAuthn credential creation flow using `authClient.getPasskeyRegisterOptions` and `authClient.verifyPasskeyRegister`
- [x] 3.5 Implement `register(email, password)` action — calls `authClient.register`, stores tokens, sets user
- [x] 3.6 Implement `logout()` action — calls `POST /logout` to invalidate server session, then clears tokens from storage, resets state, redirects to `/login`
- [x] 3.7 Implement dev auto-login: if `import.meta.env.DEV`, try auto-login with `admin@localhost.local` / `Admin@123456` on initial mount
- [x] 3.8 Implement initial session check on mount — if not dev auto-login, call `GET /manage/info` to check for an existing session

## 4. API Client Integration (Interceptor + Token Refresh)

- [x] 4.1 Add an axios request interceptor in `apiClient.js` that reads the access token from `authClient.getAccessToken()` and attaches `Authorization: Bearer <token>` header
- [x] 4.2 Add an axios response interceptor that catches 401 responses:
  - Attempt to refresh using `authClient.refreshToken()` with stored refresh token
  - If refresh succeeds, retry the original request with new access token
  - If refresh fails, clear auth state and redirect to `/login`

## 5. Login Page Component

- [x] 5.1 Create `src/components/LoginPage.jsx` with email/password form using Tailwind styling matching the app's dark theme
- [x] 5.2 Add form validation: required fields, email format check (client-side)
- [x] 5.3 Implement form submission: call `login()` from `useAuth()`, show loading state, display backend errors inline
- [x] 5.4 Add "Sign in with Passkey" button alongside the email/password form, hidden if WebAuthn not supported
- [x] 5.5 Implement Passkey login flow: call `loginWithPasskey()` from `useAuth()`, handle cancellation gracefully
- [x] 5.6 Add "Don't have an account? Create one" link navigating to `/register`
- [x] 5.7 Show a brief loading spinner/skeleton while auth state initializes (before redirect to editor)
- [x] 5.8 Add input validation error display (red border, error text) matching app theme

## 6. Register Page Component

- [x] 6.1 Create `src/components/RegisterPage.jsx` with email, password, confirm password form using Tailwind
- [x] 6.2 Add client-side validation: email format, password length (6+), password confirmation match
- [x] 6.3 Implement form submission: call `register()` from `useAuth()`, show loading state, display backend errors inline
- [x] 6.4 Add "Already have an account? Sign in" link navigating to `/login`
- [x] 6.5 Redirect to `/` on successful registration (handled by auth context auto-login)

## 7. Protected Routes and App Integration

- [x] 7.1 Create a `ProtectedRoute` wrapper component that checks `isAuthenticated` and redirects to `/login` if false
- [x] 7.2 Refactor `App.jsx` to use React Router: define routes for `/login`, `/register`, and `/` (editor)
- [x] 7.3 Move the current editor layout into the `/` route wrapped with `ProtectedRoute`
- [x] 7.4 Wrap the entire app tree with `<AuthProvider>` in `main.jsx` (or `App.jsx` if preferred)
- [x] 7.5 Add a user menu / sign-out button in the editor toolbar (top-right area of App.jsx)
- [x] 7.6 Display current user email and "Admin" badge in the toolbar when dev auto-login is active
- [x] 7.7 Add admin-only "Register Passkey" button in user menu (visible only to users with Administrator role)

## 8. Test and Verify

- [x] 8.0 Start Backend server with command /server-backend and wait for start.
- [x] 8.1 Run `npm run dev` and verify auto-login works on localhost (loads editor directly, shows admin badge)
- [x] 8.2 Verify login page renders at `/login` when not in dev mode (or after logout)
- [x] 8.3 Verify registration form validates client-side (empty fields, mismatched passwords, invalid email)
- [x] 8.4 Verify protected route redirects unauthenticated users to `/login`
- [x] 8.5 Verify logout calls server endpoint, clears tokens from storage, and redirects to `/login`
- [x] 8.6 Run `npm run build` and verify no dev-only code is included in production bundle
- [x] 8.7 Run `npm run lint` to ensure no linting errors from new code
- [x] 8.8 Verify token refresh works: simulate expired token by waiting or manually invalidating, confirm 401 triggers refresh and request
- [x] 8.8a Verify admin-only passkey registration: confirm "Register Passkey" is hidden for non-admin users and visible for admin users
- [x] 8.9 Stop Backend server with command /server-backend

### Backend Testing Results

**Working Endpoints:**
- `POST /login` ✓ - Returns accessToken, refreshToken, expiresIn
- `GET /manage/info` ✓ - Returns email, isEmailConfirmed
- `POST /refresh` ✓ - Returns new accessToken and refreshToken
- `POST /api/passkey/login-options` ✓ - Returns challenge, rpId, timeout

**Backend Limitations Discovered:**
- `POST /logout` - Returns 404 (endpoint not implemented in backend yet)
- `POST /api/passkey/register-options` - Returns 500 (backend DbContext not configured for IdentityUserPasskey - requires `IdentityOptions.Stores.SchemaVersion` set to Version3 or higher)

**Frontend Handling:**
- Logout gracefully handles 404 by clearing local tokens regardless
- Passkey registration UI is admin-only and hidden for non-admin users
- Frontend code is complete and ready for when backend passkey support is enabled  
