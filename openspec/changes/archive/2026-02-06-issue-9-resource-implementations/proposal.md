## Why

The SDK has all foundational layers complete (HTTP client, error hierarchy, types, file handling, pagination, polling) but no resource implementations. Without resources, consumers cannot make any API calls. This phase connects all existing layers into the usable public API surface, completing the SDK for release. Ref: #9

## What Changes

- Adapt `Page<T>` from cursor-based to offset-based pagination to match the API's `data`/`pagination: {total, page, limit}` format
- Implement `Convert` resource with `run()`, `runAsync()`, `getStatus()`, and `withRawResponse`
- Implement `Identify` resource with `run()`, `runAsync()`, `getStatus()`, and `withRawResponse`
- Implement `DocumentTypes` resource with `list()`, `get()`, `validate()`, and `withRawResponse`
- Implement `Steps` resource with `runAsync()`, `getStatus()`, and `withRawResponse`
- Implement `KnowledgeBases` resource with CRUD + `search()`, `sync()`, `documents()`, and `withRawResponse`
- Implement `KnowledgeBaseDocuments` sub-resource with CRUD and `withRawResponse`
- Set up MSW mock server for integration-style tests
- Export all resources from `src/index.ts`

## Capabilities

### New Capabilities
- `convert-resource`: Convert resource class with sync/async conversion, file upload routing (multipart, URL, base64), and polling via `wait()`
- `identify-resource`: Identify resource class with sync/async identification, file upload routing, and polling via `wait()`
- `document-types-resource`: DocumentTypes resource class with listing (paginated), get, and validate methods
- `steps-resource`: Steps resource class with async execution, file upload routing, and polling via `wait()`
- `knowledge-bases-resource`: KnowledgeBases resource class with CRUD, search, sync, and scoped documents sub-resource
- `msw-test-helpers`: MSW mock server setup with handlers, lifecycle hooks, and shared fixtures for resource tests

### Modified Capabilities
- `pagination`: Adapt `Page<T>` from cursor-based to offset-based pagination format (`data`/`pagination` instead of `items`/`next_cursor`)

## Impact

- `src/core/pagination.ts`: Breaking change to `PageResponse<T>` interface and `Page<T>` internals
- `tests/core/pagination.test.ts`: Must be updated for new pagination format
- `src/resources/` (new): All 5 resource files + index
- `src/index.ts`: New exports for resources
- `tests/helpers/` (new): MSW mock server, handlers, fixtures
- `tests/resources/` (new): Per-resource test suites
- No new dependencies required (MSW already in devDependencies)
