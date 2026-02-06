## ADDED Requirements

### Requirement: KnowledgeBases resource class
The SDK SHALL export a `KnowledgeBases` class extending `APIResource` in `src/resources/knowledge-bases.ts`. It SHALL provide methods `list()`, `get()`, `create()`, `update()`, `delete()`, `search()`, `sync()`, and `documents()`.

#### Scenario: Importing KnowledgeBases
- **WHEN** a consumer imports from the SDK
- **THEN** the `KnowledgeBases` class SHALL be available as a named export

### Requirement: KnowledgeBases.list() with pagination
`KnowledgeBases.list()` SHALL accept optional params (page, limit) and GET `/api/knowledge-bases`. It SHALL return a `Page<KnowledgeBase>`.

#### Scenario: Listing knowledge bases
- **WHEN** `list()` is called
- **THEN** it SHALL GET `/api/knowledge-bases` and return a `Page<KnowledgeBase>`

### Requirement: KnowledgeBases.get()
`KnowledgeBases.get()` SHALL accept an `id` and GET `/api/knowledge-bases/{id}`.

#### Scenario: Getting a knowledge base
- **WHEN** `get('kb-1')` is called
- **THEN** it SHALL GET `/api/knowledge-bases/kb-1` and return a `KnowledgeBase`

### Requirement: KnowledgeBases.create()
`KnowledgeBases.create()` SHALL accept a body with `name`, optional `description` and `schema`, and POST to `/api/knowledge-bases`.

#### Scenario: Creating a knowledge base
- **WHEN** `create({ name: 'My KB' })` is called
- **THEN** it SHALL POST to `/api/knowledge-bases` and return the created `KnowledgeBase`

### Requirement: KnowledgeBases.update()
`KnowledgeBases.update()` SHALL accept an `id` and body, and PUT to `/api/knowledge-bases/{id}`.

#### Scenario: Updating a knowledge base
- **WHEN** `update('kb-1', { name: 'Updated' })` is called
- **THEN** it SHALL PUT to `/api/knowledge-bases/kb-1`

### Requirement: KnowledgeBases.delete()
`KnowledgeBases.delete()` SHALL accept an `id` and DELETE `/api/knowledge-bases/{id}`.

#### Scenario: Deleting a knowledge base
- **WHEN** `delete('kb-1')` is called
- **THEN** it SHALL DELETE `/api/knowledge-bases/kb-1`

### Requirement: KnowledgeBases.search()
`KnowledgeBases.search()` SHALL accept an `id` and search body, and POST to `/api/knowledge-bases/{id}/search`, returning a `SearchResult`.

#### Scenario: Searching a knowledge base
- **WHEN** `search('kb-1', { query: 'invoices' })` is called
- **THEN** it SHALL POST to `/api/knowledge-bases/kb-1/search` and return a `SearchResult`

### Requirement: KnowledgeBases.sync()
`KnowledgeBases.sync()` SHALL accept an `id` and POST to `/api/knowledge-bases/{id}/sync`, returning a `SyncResult`.

#### Scenario: Syncing a knowledge base
- **WHEN** `sync('kb-1')` is called
- **THEN** it SHALL POST to `/api/knowledge-bases/kb-1/sync` and return a `SyncResult`

### Requirement: KnowledgeBases.documents() sub-resource
`KnowledgeBases.documents()` SHALL accept a `knowledgeBaseId` and return a `KnowledgeBaseDocuments` instance scoped to that KB.

#### Scenario: Accessing documents sub-resource
- **WHEN** `documents('kb-1')` is called
- **THEN** it SHALL return a `KnowledgeBaseDocuments` instance that prefixes all paths with `/api/knowledge-bases/kb-1/documents`

### Requirement: KnowledgeBaseDocuments sub-resource
The SDK SHALL export a `KnowledgeBaseDocuments` class with `list()`, `get()`, `create()`, `update()`, `delete()`, and `withRawResponse`.

#### Scenario: Listing documents
- **WHEN** `documents('kb-1').list()` is called
- **THEN** it SHALL GET `/api/knowledge-bases/kb-1/documents` and return a `Page<KnowledgeBaseDocument>`

#### Scenario: Getting a document
- **WHEN** `documents('kb-1').get('doc-1')` is called
- **THEN** it SHALL GET `/api/knowledge-bases/kb-1/documents/doc-1`

#### Scenario: Creating a document
- **WHEN** `documents('kb-1').create({ content: {...} })` is called
- **THEN** it SHALL POST to `/api/knowledge-bases/kb-1/documents`

#### Scenario: Updating a document
- **WHEN** `documents('kb-1').update('doc-1', { content: {...} })` is called
- **THEN** it SHALL PUT to `/api/knowledge-bases/kb-1/documents/doc-1`

#### Scenario: Deleting a document
- **WHEN** `documents('kb-1').delete('doc-1')` is called
- **THEN** it SHALL DELETE `/api/knowledge-bases/kb-1/documents/doc-1`

### Requirement: KnowledgeBases.withRawResponse
`KnowledgeBases` SHALL expose a `withRawResponse` getter. `KnowledgeBaseDocuments` SHALL also expose `withRawResponse`.

#### Scenario: Raw response from knowledge bases
- **WHEN** `knowledgeBases.withRawResponse.list()` is called
- **THEN** it SHALL return a `RawResponse` with `statusCode` and `headers`
