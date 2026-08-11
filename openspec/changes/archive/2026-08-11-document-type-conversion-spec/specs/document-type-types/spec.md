## ADDED Requirements

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
The SDK SHALL export a function `isMultiSheetConversionSpec(spec: ConversionSpec): spec is MultiSheetConversionSpec` that returns `true` when the spec carries a `sheets` array and no `columns` property, and narrows the union for the caller.

#### Scenario: Narrowing a multi-sheet spec
- **WHEN** `isMultiSheetConversionSpec` is called with `{ sheets: [...] }`
- **THEN** it SHALL return `true` and the value SHALL narrow to `MultiSheetConversionSpec` so `spec.sheets` is accessible without a cast

#### Scenario: Legacy spec is not multi-sheet
- **WHEN** `isMultiSheetConversionSpec` is called with `{ columns: [...] }`
- **THEN** it SHALL return `false` and the value SHALL narrow to `LegacyConversionSpec`

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

Omitting `conversionSpec` SHALL leave the stored spec unchanged; passing `null` SHALL clear it, so the result of a `get` can be fed back into `update` unchanged.

#### Scenario: Update the conversion spec
- **WHEN** update params include a valid `conversionSpec`
- **THEN** the request body SHALL include it verbatim and the returned document type SHALL carry the updated spec

#### Scenario: Update leaves spec untouched
- **WHEN** update params omit `conversionSpec`
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

## MODIFIED Requirements

### Requirement: DocumentType interface
The SDK SHALL export a `DocumentType` interface with properties: `id` (string), `name` (string), `codeType` (string), `description` (string | null), `isPublic` (boolean), `isDraft` (boolean), `status` (string), `createdAt` (string | null, ISO 8601), `updatedAt` (string | null, ISO 8601), `jsonSchema` (Record<string, unknown> | null), the optional `conversionMode` (`ConversionMode`), and the optional `conversionSpec` (`ConversionSpec | null`).

`conversionSpec` is optional because only the single-document-type endpoints return it; responses that omit the field (the list endpoint, or API deployments predating its exposure) MUST still be assignable to `DocumentType`.

#### Scenario: Public document type
- **WHEN** a document type `{ "id": "dt1", "name": "Invoice", "codeType": "invoice", "isPublic": true, "isDraft": false }` is returned
- **THEN** it SHALL be assignable to `DocumentType`

#### Scenario: Document type with schema
- **WHEN** a document type is retrieved by ID and includes a JSON schema in `jsonSchema`
- **THEN** `jsonSchema` SHALL be `Record<string, unknown>` containing the JSON schema definition

#### Scenario: Document type with conversion spec
- **WHEN** a document type is retrieved by ID and the response includes a `conversionSpec`
- **THEN** the SDK SHALL surface it as `conversionSpec` typed `ConversionSpec | null | undefined`, readable without a cast

#### Scenario: Document type without conversion spec
- **WHEN** the retrieved document type has no stored conversion spec and the API returns `conversionSpec: null`
- **THEN** `conversionSpec` SHALL be `null` and remain assignable to `DocumentType`
