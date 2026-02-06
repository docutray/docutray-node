## ADDED Requirements

### Requirement: DocumentTypes resource class
The SDK SHALL export a `DocumentTypes` class extending `APIResource` in `src/resources/document-types.ts`. It SHALL provide methods `list()`, `get()`, and `validate()`.

#### Scenario: Importing DocumentTypes
- **WHEN** a consumer imports from the SDK
- **THEN** the `DocumentTypes` class SHALL be available as a named export

### Requirement: DocumentTypes.list() with pagination
`DocumentTypes.list()` SHALL accept optional `DocumentTypesListParams` (page, limit, search) and GET `/api/document-types`. It SHALL return a `Page<DocumentType>` supporting iteration and `toArray()`.

#### Scenario: Listing document types
- **WHEN** `list()` is called with no params
- **THEN** it SHALL GET `/api/document-types` and return a `Page<DocumentType>`

#### Scenario: Listing with search filter
- **WHEN** `list({ search: 'invoice' })` is called
- **THEN** it SHALL GET `/api/document-types?search=invoice`

#### Scenario: Paginating through results
- **WHEN** `list()` returns a Page and `autoPagingIter()` is used
- **THEN** it SHALL iterate through all document types across pages

### Requirement: DocumentTypes.get()
`DocumentTypes.get()` SHALL accept a document type `id` string and GET `/api/document-types/{id}`, returning a `DocumentType`.

#### Scenario: Getting a document type
- **WHEN** `get('dt-789')` is called
- **THEN** it SHALL GET `/api/document-types/dt-789` and return the document type object

### Requirement: DocumentTypes.validate()
`DocumentTypes.validate()` SHALL accept a document type `id` and POST to `/api/document-types/{id}/validate`, returning a `ValidationResult`.

#### Scenario: Validating a document type
- **WHEN** `validate('dt-789')` is called
- **THEN** it SHALL POST to `/api/document-types/dt-789/validate` and return the validation result

### Requirement: DocumentTypes.withRawResponse
`DocumentTypes` SHALL expose a `withRawResponse` getter returning a `DocumentTypesWithRawResponse` instance.

#### Scenario: Raw response from list
- **WHEN** `documentTypes.withRawResponse.list()` is called
- **THEN** it SHALL return a `RawResponse` with `statusCode` and `headers`
