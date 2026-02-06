# identify-types Specification

## Purpose
TypeScript types and type-guard functions for document identification: statuses, results, match models, and input parameters.
## Requirements
### Requirement: IdentificationStatusType union
The SDK SHALL export an `IdentificationStatusType` type as a string union: `"ENQUEUED" | "PROCESSING" | "SUCCESS" | "ERROR"`.

#### Scenario: Valid identification status
- **WHEN** `"PROCESSING"` is assigned to an `IdentificationStatusType` variable
- **THEN** it SHALL be accepted by the TypeScript compiler

### Requirement: DocumentTypeMatch interface
The SDK SHALL export a `DocumentTypeMatch` interface with properties: `code` (string), `name` (string), `confidence` (number, 0-1).

#### Scenario: High confidence match
- **WHEN** a match `{ "code": "invoice", "name": "Invoice", "confidence": 0.95 }` is returned
- **THEN** it SHALL be assignable to `DocumentTypeMatch`

### Requirement: IdentificationResult interface
The SDK SHALL export an `IdentificationResult` interface with properties: `documentType` (DocumentTypeMatch), `alternatives` (DocumentTypeMatch[]).

#### Scenario: Identification with alternatives
- **WHEN** identification returns a primary match and 2 alternatives
- **THEN** `documentType` SHALL be the primary `DocumentTypeMatch` and `alternatives` SHALL be an array of 2 `DocumentTypeMatch` objects

### Requirement: IdentificationStatus interface
The SDK SHALL export an `IdentificationStatus` interface with properties: `identificationId` (string), `status` (IdentificationStatusType), `statusUrl` (string | null), `requestTimestamp` (string | null), `responseTimestamp` (string | null), `originalFilename` (string | null), `documentType` (DocumentTypeMatch | null), `alternatives` (DocumentTypeMatch[] | null), `error` (string | null).

#### Scenario: Successful identification
- **WHEN** identification completes with status `"SUCCESS"`
- **THEN** `documentType` SHALL contain the primary match, `alternatives` SHALL contain alternative matches, and `error` SHALL be `null`

#### Scenario: Failed identification
- **WHEN** identification fails with status `"ERROR"`
- **THEN** `error` SHALL contain the error message, `documentType` SHALL be `null`, and `alternatives` SHALL be `null`

### Requirement: IdentifyParams interface
The SDK SHALL export an `IdentifyParams` interface with properties: `file` (FileInput, optional), `url` (string, optional), `base64` (string, optional), `contentType` (ImageContentType, optional), `filename` (string, optional), `wait` (boolean, optional), `webhookUrl` (string, optional).

#### Scenario: File upload identification
- **WHEN** params include `{ file: buffer }`
- **THEN** they SHALL be assignable to `IdentifyParams`

### Requirement: Identification type-guard functions
The SDK SHALL export functions `isIdentificationComplete(status: IdentificationStatus): boolean`, `isIdentificationSuccess(status: IdentificationStatus): boolean`, `isIdentificationError(status: IdentificationStatus): boolean`.

#### Scenario: Check identification complete
- **WHEN** `isIdentificationComplete` is called with status `"ERROR"`
- **THEN** it SHALL return `true` (both SUCCESS and ERROR are complete)

#### Scenario: Check identification success
- **WHEN** `isIdentificationSuccess` is called with status `"SUCCESS"`
- **THEN** it SHALL return `true`

