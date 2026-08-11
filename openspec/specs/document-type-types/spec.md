# document-type-types Specification

## Purpose
TypeScript types and helper functions for document type definitions, validation results, and listing parameters.
## Requirements
### Requirement: DocumentType interface
The SDK SHALL export a `DocumentType` interface with properties: `id` (string), `name` (string), `codeType` (string), `description` (string | null), `isPublic` (boolean), `isDraft` (boolean), `status` (string), `createdAt` (string | null, ISO 8601), `updatedAt` (string | null, ISO 8601), `jsonSchema` (Record<string, unknown> | null), the optional `conversionMode` (`ConversionMode`), and the optional `conversionSpec` (`ConversionSpec | null`).

`conversionSpec` is optional because only the single-document-type endpoints return it; responses that omit the field (the list endpoint, or API deployments predating its exposure) MUST still be assignable to `DocumentType`.

#### Scenario: Public document type
- **WHEN** a document type `{ "id": "dt1", "name": "Invoice", "codeType": "invoice", "description": null, "isPublic": true, "isDraft": false, "status": "active", "createdAt": null, "updatedAt": null, "jsonSchema": null }` is returned
- **THEN** it SHALL be assignable to `DocumentType` without supplying `conversionMode` or `conversionSpec`

#### Scenario: Document type with schema
- **WHEN** a document type is retrieved by ID and includes a JSON schema in `jsonSchema`
- **THEN** `jsonSchema` SHALL be `Record<string, unknown>` containing the JSON schema definition

#### Scenario: Document type with conversion spec
- **WHEN** a document type is retrieved by ID and the response includes a `conversionSpec`
- **THEN** the SDK SHALL surface it as `conversionSpec` typed `ConversionSpec | null | undefined`, readable without a cast

#### Scenario: Document type without conversion spec
- **WHEN** the retrieved document type has no stored conversion spec and the API returns `conversionSpec: null`
- **THEN** `conversionSpec` SHALL be `null` and remain assignable to `DocumentType`

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

### Requirement: ConversionSpec type family
The SDK SHALL export the types describing a document type's conversion spec (the mapping from extracted JSON to CSV/Excel columns used by tray export):

- `ConversionSpecColumn`: `header` (string), `jsonPath` (string, optional), `type` (`'data' | 'formula'`, optional), `formula` (string, optional).
- `ConversionSpecSheet`: `name` (string), `columns` (`ConversionSpecColumn[]`).
- `LegacyConversionSpec`: `columns` (`ConversionSpecColumn[]`).
- `MultiSheetConversionSpec`: `sheets` (`ConversionSpecSheet[]`).
- `ConversionSpec`: the union `LegacyConversionSpec | MultiSheetConversionSpec`.

`jsonPath` MUST remain optional: the API accepts placeholder data columns without a path, and formula columns carry `formula` instead.

#### Scenario: Legacy spec assignable
- **WHEN** a spec `{ columns: [{ header: "Invoice Number", jsonPath: "$.invoice_number" }] }` is provided
- **THEN** it SHALL be assignable to `ConversionSpec`

#### Scenario: Multi-sheet spec assignable
- **WHEN** a spec `{ sheets: [{ name: "Items", columns: [{ header: "SKU", jsonPath: "$.items[*].sku" }] }] }` is provided
- **THEN** it SHALL be assignable to `ConversionSpec`

#### Scenario: Formula column without jsonPath
- **WHEN** a column `{ header: "Total", type: "formula", formula: "=SUM(B2:B10)" }` is provided
- **THEN** it SHALL be assignable to `ConversionSpecColumn`

#### Scenario: Empty legacy columns accepted
- **WHEN** a spec `{ columns: [] }` is provided
- **THEN** it SHALL be assignable to `ConversionSpec`, matching the API's tolerance for empty legacy specs

### Requirement: isMultiSheetConversionSpec type guard
The SDK SHALL export a function `isMultiSheetConversionSpec(spec: ConversionSpec | null | undefined): spec is MultiSheetConversionSpec` that returns `true` when the spec carries a `sheets` property, and narrows the union for the caller.

The parameter MUST accept `null` and `undefined` so the guard is callable directly on `DocumentType.conversionSpec`, which is absent on list responses; a nullish argument MUST return `false` rather than throwing.

#### Scenario: Narrowing a multi-sheet spec
- **WHEN** `isMultiSheetConversionSpec` is called with `{ sheets: [...] }`
- **THEN** it SHALL return `true` and the value SHALL narrow to `MultiSheetConversionSpec` so `spec.sheets` is accessible without a cast

#### Scenario: Legacy spec is not multi-sheet
- **WHEN** `isMultiSheetConversionSpec` is called with `{ columns: [...] }`
- **THEN** it SHALL return `false` and the value SHALL narrow to `LegacyConversionSpec`

#### Scenario: Nullish spec
- **WHEN** `isMultiSheetConversionSpec` is called with `null` or `undefined` (for example the `conversionSpec` of a document type obtained from `list()`)
- **THEN** it SHALL return `false` without throwing

#### Scenario: Spec carrying both keys
- **WHEN** `isMultiSheetConversionSpec` is called with an object holding both `sheets` and `columns` (which the API rejects with `400`, so it can only be constructed locally)
- **THEN** it SHALL return `true`, honoring `sheets` rather than falling through to `columns`

### Requirement: DocumentTypeCreateParams interface
The SDK SHALL export a `DocumentTypeCreateParams` interface with required properties `name` (string), `codeType` (string), `description` (string), `jsonSchema` (Record<string, unknown>), and optional properties `isDraft` (boolean), `promptHints` (string), `identifyPromptHints` (string), `conversionMode` (`ConversionMode`), `keepPropertyOrdering` (boolean), `isPublic` (boolean), and `conversionSpec` (`ConversionSpec | null`).

Provided parameters SHALL be sent to the API unchanged; omitted optional parameters MUST NOT appear in the request body.

#### Scenario: Create with a conversion spec
- **WHEN** create params include a valid `conversionSpec`
- **THEN** the request body SHALL include `conversionSpec` verbatim and the returned document type SHALL carry the persisted spec

#### Scenario: Create without a conversion spec
- **WHEN** create params omit `conversionSpec`
- **THEN** the request body SHALL NOT include a `conversionSpec` key and the document type SHALL be created without a spec

#### Scenario: Create with explicit null
- **WHEN** create params include `conversionSpec: null`
- **THEN** the params SHALL type-check and the document type SHALL be created without a spec

### Requirement: DocumentTypeUpdateParams interface
The SDK SHALL export a `DocumentTypeUpdateParams` interface with optional properties `name` (string), `description` (string), `jsonSchema` (Record<string, unknown>), `isDraft` (boolean), `promptHints` (string), `identifyPromptHints` (string), `conversionMode` (`ConversionMode`), `keepPropertyOrdering` (boolean), `isPublic` (boolean), and `conversionSpec` (`ConversionSpec | null`). `codeType` MUST NOT be updatable.

Omitting `conversionSpec` SHALL leave the stored spec unchanged; passing `null` SHALL clear it.

A `conversionSpec` of `undefined` MUST be dropped from the request body rather than serialized, so that forwarding a spec read from a `DocumentType` (`{ conversionSpec: docType.conversionSpec }`) round-trips safely whether or not the source carried the field. The SDK MUST NOT document or rely on `?? null` normalization for that forwarding: document types from `list()` have no `conversionSpec`, so it would convert "not loaded" into "clear the stored spec".

#### Scenario: Update the conversion spec
- **WHEN** update params include a valid `conversionSpec`
- **THEN** the request body SHALL include it verbatim and the returned document type SHALL carry the updated spec

#### Scenario: Update leaves spec untouched
- **WHEN** update params omit `conversionSpec`
- **THEN** the request body SHALL NOT include a `conversionSpec` key and the stored spec SHALL remain unchanged

#### Scenario: Forwarding an absent spec
- **WHEN** update params set `conversionSpec` to the `conversionSpec` of a document type obtained from `list()`, which is `undefined`
- **THEN** the request body SHALL NOT include a `conversionSpec` key and the stored spec SHALL remain unchanged

#### Scenario: Clearing the conversion spec
- **WHEN** update params include `conversionSpec: null`
- **THEN** the request body SHALL send `null` and the stored spec SHALL be cleared

### Requirement: Structurally invalid conversion specs surface as API errors
The SDK SHALL NOT validate the structure of a `conversionSpec` client-side. When the API rejects a spec, the SDK MUST surface the failure through the existing error hierarchy as a `BadRequestError` carrying the API's message, exactly like any other `400`.

#### Scenario: API rejects an invalid spec
- **WHEN** `create` or `update` is called with a `conversionSpec` the API considers structurally invalid and the API responds `400`
- **THEN** the SDK SHALL throw a `BadRequestError` whose message contains the API's validation detail

#### Scenario: No client-side rejection
- **WHEN** a spec the SDK cannot statically prove valid is passed at runtime (for example an object built from parsed JSON)
- **THEN** the SDK SHALL send it to the API rather than throwing locally

