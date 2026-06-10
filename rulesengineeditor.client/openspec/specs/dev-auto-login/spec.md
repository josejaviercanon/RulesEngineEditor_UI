# Dev Auto-Login

## Purpose

Provide a development-only convenience feature that automatically authenticates as a pre-seeded admin user when running in development mode, bypassing the login page for faster development iteration.

## Requirements

### Requirement: Dev environment auto-login
When the application runs in development mode (`npm run dev` on `localhost:65426`), the system SHALL automatically authenticate as a pre-seeded admin user without requiring the user to visit the login page. The auto-login SHALL use credentials: email `admin@localhost.local`, password `Admin@123456`, with the Administrator role. This behavior SHALL be gated behind `import.meta.env.DEV` and SHALL have zero effect in production builds.

#### Scenario: Dev mode loads editor directly
- **WHEN** the application starts in development mode and the user navigates to any path
- **THEN** the system SHALL automatically call `POST /login` with the admin credentials, store the `accessToken` and `refreshToken` in `localStorage`, and show the editor UI without requiring manual login

#### Scenario: Dev auto-login show brief loading state
- **WHEN** the application is in dev mode and the auto-login API call is in progress
- **THEN** the system SHALL show a brief loading indicator before transitioning to the editor

#### Scenario: Dev auto-login fails gracefully
- **WHEN** the application is in dev mode but the auto-login API call fails (e.g., backend not running, seed user not created)
- **THEN** the system SHALL log a warning to the console and fall back to the login page so the user can sign in manually

### Requirement: Production exclusion
The auto-login code SHALL be entirely excluded from production builds. No auto-login logic, credentials, or behavior SHALL be present in the built output.

#### Scenario: Production build ignores auto-login
- **WHEN** a production build is created with `npm run build`
- **THEN** the bundled JavaScript SHALL NOT contain the auto-login credentials, API call, or any related code paths due to Vite's dead-code elimination of the `import.meta.env.DEV` branch

### Requirement: Dev auto-login is visible in UI
When auto-login is active, the editor toolbar SHALL display a visible indicator showing the auto-logged-in admin user identity (email and "Admin" role badge) for awareness.

#### Scenario: Dev mode shows admin badge
- **WHEN** the user is auto-logged-in as admin in dev mode
- **THEN** the editor toolbar SHALL show "admin@localhost.local" and an "Admin" badge
