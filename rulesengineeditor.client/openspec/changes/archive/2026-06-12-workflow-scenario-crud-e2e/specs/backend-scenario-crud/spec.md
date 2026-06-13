# Backend Scenario CRUD

## Purpose

Define the backend REST API endpoints for Create, Read, Update, and Delete operations on Workflow Test Scenarios, including OpenAPI schema documentation.

## ADDED Requirements

### Requirement: Backend provides list scenarios by workflow endpoint
The system SHALL expose `GET /api/Rules/scenarios?workflowId={id}` that returns all scenarios linked to a given workflow definition.

#### Scenario: List scenarios for existing workflow
- **WHEN** a client sends `GET /api/Rules/scenarios?workflowId=123`
- **THEN** the system returns HTTP 200 with a JSON array of `WorkflowTestScenarios`
- **AND** each item contains `scenarioId`, `scenarioName`, `workflowDefinitionId`, `mockInputJson`, `expectedOutputJson`, and `createdAt`

#### Scenario: List scenarios for non-existent workflow
- **WHEN** a client sends `GET /api/Rules/scenarios?workflowId=99999`
- **THEN** the system returns HTTP 200 with an empty JSON array

### Requirement: Backend provides get single scenario endpoint
The system SHALL expose `GET /api/Rules/scenarios/{id}` that returns a single scenario by its primary key.

#### Scenario: Get existing scenario
- **WHEN** a client sends `GET /api/Rules/scenarios/42`
- **THEN** the system returns HTTP 200 with the `WorkflowTestScenarios` object

#### Scenario: Get non-existent scenario
- **WHEN** a client sends `GET /api/Rules/scenarios/99999`
- **THEN** the system returns HTTP 404

### Requirement: Backend provides update scenario endpoint
The system SHALL expose `PUT /api/Rules/scenarios/{id}` that updates an existing scenario's name, mock input, and expected output.

#### Scenario: Update existing scenario
- **WHEN** a client sends `PUT /api/Rules/scenarios/42` with `{ scenarioName, mockInputJson, expectedOutputJson }`
- **THEN** the system returns HTTP 200 with the updated `WorkflowTestScenarios` object
- **AND** the database record is updated

#### Scenario: Update non-existent scenario
- **WHEN** a client sends `PUT /api/Rules/scenarios/99999`
- **THEN** the system returns HTTP 404

### Requirement: Backend provides delete scenario endpoint
The system SHALL expose `DELETE /api/Rules/scenarios/{id}` that removes a scenario from the database.

#### Scenario: Delete existing scenario
- **WHEN** a client sends `DELETE /api/Rules/scenarios/42`
- **THEN** the system returns HTTP 204
- **AND** the scenario no longer exists in the database

#### Scenario: Delete non-existent scenario
- **WHEN** a client sends `DELETE /api/Rules/scenarios/99999`
- **THEN** the system returns HTTP 404

### Requirement: OpenAPI spec documents all scenario endpoints
The system SHALL include all scenario CRUD endpoints in `Api/v1.yaml` with correct request/response schemas.

#### Scenario: Spec completeness
- **WHEN** inspecting `Api/v1.yaml`
- **THEN** it defines paths for `GET /api/Rules/scenarios`, `GET /api/Rules/scenarios/{id}`, `POST /api/Rules/scenarios`, `PUT /api/Rules/scenarios/{id}`, and `DELETE /api/Rules/scenarios/{id}`
- **AND** each path references the `WorkflowTestScenarios` and `SaveScenarioRequest` schemas
