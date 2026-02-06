# knowledge-base-types Specification

## Purpose
TBD - created by archiving change issue-5-type-definitions. Update Purpose after archive.
## Requirements
### Requirement: KnowledgeBase interface
The SDK SHALL export a `KnowledgeBase` interface with properties: `id` (string), `name` (string), `description` (string | null), `schema` (Record<string, unknown> | null), `isActive` (boolean), `createdAt` (string | null, ISO 8601), `updatedAt` (string | null, ISO 8601), `documentCount` (number | null).

#### Scenario: Active knowledge base
- **WHEN** a KB `{ "id": "kb1", "name": "Invoices", "isActive": true, "documentCount": 150 }` is returned
- **THEN** it SHALL be assignable to `KnowledgeBase`

#### Scenario: Knowledge base with schema
- **WHEN** a KB includes a JSON schema definition
- **THEN** `schema` SHALL be `Record<string, unknown>` containing the schema

### Requirement: KnowledgeBaseDocument interface
The SDK SHALL export a `KnowledgeBaseDocument` interface with properties: `id` (string), `documentId` (string | null), `content` (Record<string, unknown>), `metadata` (Record<string, unknown> | null), `createdAt` (string | null, ISO 8601), `updatedAt` (string | null, ISO 8601).

#### Scenario: Document with metadata
- **WHEN** a document includes `{ "id": "doc1", "content": { "name": "Acme" }, "metadata": { "source": "upload" } }`
- **THEN** it SHALL be assignable to `KnowledgeBaseDocument`

#### Scenario: Document without metadata
- **WHEN** a document has `metadata` as `null`
- **THEN** it SHALL still be assignable to `KnowledgeBaseDocument`

### Requirement: SearchResultItem interface
The SDK SHALL export a `SearchResultItem` interface with properties: `document` (KnowledgeBaseDocument), `similarity` (number, 0-1).

#### Scenario: Search result with similarity score
- **WHEN** a search returns `{ "document": { ... }, "similarity": 0.87 }`
- **THEN** it SHALL be assignable to `SearchResultItem`

### Requirement: SearchResult interface
The SDK SHALL export a `SearchResult` interface with properties: `data` (SearchResultItem[]), `query` (string | null), `resultsCount` (number).

#### Scenario: Search with results
- **WHEN** a search returns 3 matching documents
- **THEN** `data` SHALL be an array of 3 `SearchResultItem` objects and `resultsCount` SHALL be `3`

#### Scenario: Empty search results
- **WHEN** a search returns no matching documents
- **THEN** `data` SHALL be an empty array and `resultsCount` SHALL be `0`

### Requirement: SyncResult interface
The SDK SHALL export a `SyncResult` interface with properties: `syncId` (string | null), `status` (string), `documentsProcessed` (number | null), `errors` (string[] | null), `startedAt` (string | null, ISO 8601), `completedAt` (string | null, ISO 8601).

#### Scenario: Completed sync
- **WHEN** a sync completes with `{ "status": "completed", "documentsProcessed": 10, "errors": null }`
- **THEN** it SHALL be assignable to `SyncResult`

#### Scenario: Failed sync with errors
- **WHEN** a sync fails with `{ "status": "failed", "errors": ["document 3 invalid"] }`
- **THEN** it SHALL be assignable to `SyncResult` with `errors` as a string array

