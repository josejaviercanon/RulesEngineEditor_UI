# User Registration

## Purpose

Provide new user registration via email and password for the RulesEngine Editor. Includes form validation, automatic post-registration login, and navigation to the login page.

## Requirements

### Requirement: User can register with email and password
The system SHALL provide a registration page at `/register` with an email and password form. On successful registration, the system SHALL authenticate the user automatically (log them in) and redirect to the main editor (`/`). On failure, the system SHALL display a clear error message without redirecting.

#### Scenario: Successful registration with valid data
- **WHEN** the user navigates to `/register`, enters a valid email (e.g., `user@example.com`), enters a password meeting complexity requirements, confirms the password, and clicks "Create Account"
- **THEN** the system SHALL call `POST /register`, store the `accessToken` and `refreshToken`, and redirect to `/`

#### Scenario: Registration with duplicate email
- **WHEN** the user enters an email that is already registered
- **THEN** the system SHALL show an error message "An account with this email already exists" and remain on `/register`

#### Scenario: Registration with weak password
- **WHEN** the user enters a password that does not meet the minimum requirements (less than 6 characters, no uppercase, etc.)
- **THEN** the system SHALL show validation error(s) returned from the backend or client-side validation rules

### Requirement: Registration form validation
The registration form SHALL validate inputs client-side before submitting. The email field SHALL require a valid email format. The password field SHALL require at least 6 characters. A "Confirm Password" field SHALL require an exact match to the password field.

#### Scenario: Mismatched passwords
- **WHEN** the user enters different values in "Password" and "Confirm Password"
- **THEN** the system SHALL show a client-side error "Passwords do not match" and NOT submit the form

#### Scenario: Invalid email format
- **WHEN** the user enters a string that is not a valid email (e.g., `not-an-email`)
- **THEN** the system SHALL show an error "Please enter a valid email address" and NOT submit the form

#### Scenario: Empty required fields
- **WHEN** the user submits the form with any required field empty
- **THEN** the system SHALL show inline validation errors for each empty field and NOT submit the form

### Requirement: Registration page has link to login
The registration page SHALL include a "Already have an account? Sign in" link that navigates to `/login`.

#### Scenario: Navigate from register to login
- **WHEN** the user is on `/register` and clicks the "Sign in" link
- **THEN** the system SHALL navigate to `/login`
