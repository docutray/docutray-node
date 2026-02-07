# convert-types Specification

## Purpose
TypeScript types and helper functions for document conversion operations: conversion status, results, request parameters, and type guards.
## Requirements
### Requirement: ConversionStatusType union
The SDK SHALL export a `ConversionStatusType` type as a string union: `"ENQUEUED" | "PROCESSING" | "SUCCESS" | "ERROR"`.

#### Scenario: Valid conversion status
- **WHEN** `"ENQUEUED"` is assigned to a `ConversionStatusType` variable
- **THEN** it SHALL be accepted by the TypeScript compiler

#### Scenario: Invalid conversion status
- **WHEN** `"PENDING"` is assigned to a `ConversionStatusType` variable
- **THEN** it SHALL produce a TypeScript compilation error

### Requirement: ConversionResult interface
The SDK SHALL export a `ConversionResult` interface with property: `data` (Record<string, unknown>) representing extracted data according to the document type JSON schema.

#### Scenario: Successful conversion data
- **WHEN** a conversion completes with `{ "data": { "name": "John", "date": "2024-01-01" } }`
- **THEN** it SHALL be assignable to `ConversionResult`

### Requirement: ConversionStatus interface
The SDK SHALL export a `ConversionStatus` interface with snake_case properties matching the API response: `conversion_id` (string), `status` (ConversionStatusType), `status_url` (string | null), `request_timestamp` (string | null), `response_timestamp` (string | null), `document_type_code` (string | null), `original_filename` (string | null), `data` (Record<string, unknown> | null), `error` (string | null), `document_metadata` (Record<string, unknown> | null, optional).

#### Scenario: Enqueued conversion
- **WHEN** a conversion is submitted and returns status `"ENQUEUED"`
- **THEN** `data` SHALL be `null` and `error` SHALL be `null`

#### Scenario: Successful conversion
- **WHEN** a conversion completes with status `"SUCCESS"`
- **THEN** `data` SHALL contain the extracted data and `error` SHALL be `null`

#### Scenario: Failed conversion
- **WHEN** a conversion fails with status `"ERROR"`
- **THEN** `error` SHALL contain the error message and `data` SHALL be `null`

### Requirement: ConvertParams interface
The SDK SHALL export a `ConvertParams` interface with properties: `documentTypeCode` (string), `file` (FileInput, optional), `url` (string, optional), `base64` (string, optional), `contentType` (ImageContentType, optional), `filename` (string, optional), `wait` (boolean, optional), `webhookUrl` (string, optional).

#### Scenario: File upload conversion
- **WHEN** params include `{ documentTypeCode: "invoice", file: buffer }`
- **THEN** they SHALL be assignable to `ConvertParams`

#### Scenario: URL-based conversion
- **WHEN** params include `{ documentTypeCode: "invoice", url: "https://example.com/doc.pdf" }`
- **THEN** they SHALL be assignable to `ConvertParams`

### Requirement: Conversion type-guard functions
The SDK SHALL export functions `isConversionComplete(status: ConversionStatus): boolean`, `isConversionSuccess(status: ConversionStatus): boolean`, `isConversionError(status: ConversionStatus): boolean`.

#### Scenario: Check complete status
- **WHEN** `isConversionComplete` is called with a status where `status` is `"SUCCESS"`
- **THEN** it SHALL return `true`

#### Scenario: Check incomplete status
- **WHEN** `isConversionComplete` is called with a status where `status` is `"PROCESSING"`
- **THEN** it SHALL return `false`

#### Scenario: Check success status
- **WHEN** `isConversionSuccess` is called with a status where `status` is `"SUCCESS"`
- **THEN** it SHALL return `true`

#### Scenario: Check error status
- **WHEN** `isConversionError` is called with a status where `status` is `"ERROR"`
- **THEN** it SHALL return `true`

