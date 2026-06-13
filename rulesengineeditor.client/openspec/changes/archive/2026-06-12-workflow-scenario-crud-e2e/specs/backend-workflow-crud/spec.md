# Backend Workflow CRUD

## Purpose

Define the backend REST API endpoints for Create, Read, Update, and Delete operations on Workflow Definitions, including OpenAPI schema documentation.

## ADDED Requirements

### Requirement: Backend provides get single workflow endpoint
The system SHALL expose `GET /api/Rules/{id}` that returns a single workflow definition by its primary key, including the full `jsonContent`.

#### Scenario: Get existing workflow
- **WHEN** a client sends `GET /api/Rules/123`
- **THEN** the system returns HTTP 200 with the `WorkflowDefinitions` object including `workflowDefinitionId`, `workflowName`, `version`, `jsonContent`, `status`, `createdAt`, and `createdBy`

#### Scenario: Get non-existent workflow
- **WHEN** a client sends `GET /api/Rules/99999`
- **THEN** the system returns HTTP 404

### Requirement: Backend provides create workflow endpoint
The system SHALL expose `POST /api/Rules` that creates a new workflow definition.

#### Scenario: Create workflow
- **WHEN** a client sends `POST /api/Rules` with `{ workflowName, jsonContent, status }`
- **THEN** the system returns HTTP 201 with the created `WorkflowDefinitions` object
- **AND** the database assigns a new `workflowDefinitionId` and `version`

#### Scenario: Create workflow with duplicate name
- **WHEN** a client sends `POST /api/Rules` with a `workflowName` that already exists
- **THEN** the system returns HTTP 409 Conflict

### Requirement: Backend provides update workflow endpoint
The system SHALL expose `PUT /api/Rules/{id}` that updates an existing workflow definition.

#### Scenario: Update existing workflow
- **WHEN** a client sends `PUT /api/Rules/123` with `{ workflowName, jsonContent, status }`
- **THEN** the system returns HTTP 200 with the updated `WorkflowDefinitions` object
- **AND** the database record is updated

#### Scenario: Update non-existent workflow
- **WHEN** a client sends `PUT /api/Rules/99999`
- **THEN** the system returns HTTP 404

### Requirement: Backend provides delete workflow endpoint
The system SHALL expose `DELETE /api/Rules/{id}` that removes a workflow definition from the database.

#### Scenario: Delete existing workflow
- **WHEN** a client sends `DELETE /api/Rules/123`
- **THEN** the system returns HTTP 204
- **AND** the workflow no longer exists in the database
- **AND** all child scenarios are cascade-deleted

#### Scenario: Delete non-existent workflow
- **WHEN** a client sends `DELETE /api/Rules/99999`
- **THEN** the system returns HTTP 404

### Requirement: OpenAPI spec documents all workflow endpoints
The system SHALL include all workflow CRUD endpoints in `Api/v1.yaml` with correct request/response schemas.

#### Scenario: Spec completeness
- **WHEN** inspecting `Api/v1.yaml`
- **THEN** it defines paths for `GET /api/Rules`, `GET /api/Rules/{id}`, `POST /api/Rules`, `PUT /api/Rules/{id}`, and `DELETE /api/Rules/{id}`
- **AND** each path references the `WorkflowDefinitions` and `WorkflowSummaryResponse` schemas
