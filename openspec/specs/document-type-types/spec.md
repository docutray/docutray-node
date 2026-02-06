# document-type-types Specification

## Purpose
TypeScript type definitions for the document types API resource: document type model, validation types, list parameters, and type-guard functions.

## Requirements

### Requirement: DocumentType interface
The SDK SHALL export a `DocumentType` interface with properties: `id` (string), `name` (string), `codeType` (string), `description` (string | null), `isPublic` (boolean), `isDraft` (boolean), `createdAt` (string | null, ISO 8601), `updatedAt` (string | null, ISO 8601), `schema` (Record<string, unknown> | null).

#### Scenario: Public document type
- **WHEN** a document type `{ "id": "dt1", "name": "Invoice", "codeType": "invoice", "isPublic": true, "isDraft": false }` is returned
- **THEN** it SHALL be assignable to `DocumentType`

#### Scenario: Document type with schema
- **WHEN** a document type is retrieved by ID and includes a JSON schema in `schema`
- **THEN** `schema` SHALL be `Record<string, unknown>` containing the JSON schema definition

### Requirement: ValidationErrorInfo interface
The SDK SHALL export a `ValidationErrorInfo` interface with properties: `count` (number), `messages` (string[]).

#### Scenario: Validation errors
- **WHEN** a validation returns `{ "count": 2, "messages": ["field required", "invalid format"] }`
- **THEN** it SHALL be assignable to `ValidationErrorInfo`

### Requirement: ValidationWarningInfo interface
The SDK SHALL export a `ValidationWarningInfo` interface with properties: `count` (number), `messages` (string[]).

#### Scenario: Validation warnings
- **WHEN** a validation returns `{ "count": 1, "messages": ["field deprecated"] }`
- **THEN** it SHALL be assignable to `ValidationWarningInfo`

### Requirement: ValidationResult interface
The SDK SHALL export a `ValidationResult` interface with properties: `errors` (ValidationErrorInfo), `warnings` (ValidationWarningInfo).

#### Scenario: Valid document type
- **WHEN** validation returns `{ "errors": { "count": 0, "messages": [] }, "warnings": { "count": 0, "messages": [] } }`
- **THEN** it SHALL be assignable to `ValidationResult` with zero errors and warnings

### Requirement: Validation type-guard functions
The SDK SHALL export functions `isValidationValid(result: ValidationResult): boolean` (returns true when `errors.count === 0`) and `hasValidationWarnings(result: ValidationResult): boolean` (returns true when `warnings.count > 0`).

#### Scenario: Check validation is valid
- **WHEN** `isValidationValid` is called with a result where `errors.count` is `0`
- **THEN** it SHALL return `true`

#### Scenario: Check validation has warnings
- **WHEN** `hasValidationWarnings` is called with a result where `warnings.count` is `3`
- **THEN** it SHALL return `true`

### Requirement: DocumentTypesListParams interface
The SDK SHALL export a `DocumentTypesListParams` interface with optional properties: `page` (number), `limit` (number), `search` (string).

#### Scenario: List with search filter
- **WHEN** params include `{ search: "invoice", page: 1, limit: 20 }`
- **THEN** they SHALL be assignable to `DocumentTypesListParams`

#### Scenario: List with defaults
- **WHEN** an empty object `{}` is provided
- **THEN** it SHALL be assignable to `DocumentTypesListParams` (all fields optional)
