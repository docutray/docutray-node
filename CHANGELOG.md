# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.5] - 2026-08-11

### Added

- `conversionSpec` field on `DocumentType`, `DocumentTypeCreateParams`, and `DocumentTypeUpdateParams` — the mapping from extracted JSON to CSV/Excel columns used by tray export, now exposed by the API on `GET`/`POST`/`PUT /api/document-types` (docutray/docutray#972). Optional, because list responses do not carry it.
- New exported conversion-spec types: `ConversionSpec` (the union), `ConversionSpecColumn`, `ConversionSpecSheet`, `LegacyConversionSpec` (top-level `columns`), and `MultiSheetConversionSpec` (top-level `sheets`).
- New exported `isMultiSheetConversionSpec(spec)` type guard, which narrows the union and accepts `null`/`undefined` so it can be called directly on `DocumentType.conversionSpec`.

### Notes

- Omitting `conversionSpec` on update leaves the stored spec unchanged; passing `null` clears it. When forwarding a spec read from a `DocumentType`, pass it through as-is (`{ conversionSpec: docType.conversionSpec }`) — do **not** normalize with `?? null`, which would turn the absent field of a `list()` result into a request to clear the stored spec.
- Conversion specs are validated server-side only; a structurally invalid spec is rejected with `BadRequestError` and nothing is persisted.
- Requires an API deployment including docutray/docutray#972. Older deployments omit the field on read and ignore it on write.

## [0.1.4] - 2026-05-07

### Added

- `conversionMode` field on `DocumentType` so consumers can read it directly from API responses without casting (closes #21).
- New exported `ConversionMode` type (`'json' | 'toon' | 'multi_prompt'`), shared across `DocumentType`, `DocumentTypeCreateParams`, and `DocumentTypeUpdateParams`.

## [0.1.3] - 2026-05-07

### Fixed

- `client.documentTypes.get(id)` now correctly unwraps the `{ data }` envelope returned by `GET /api/document-types/:id` and returns a flat `DocumentType`. Previously the wrapper leaked through, causing every field to read as `undefined` despite the declared type. Aligns `get()` with the pattern already used by `create()` and `update()`.

### Changed

- **Breaking (type-only):** `DocumentType.schema` renamed to `DocumentType.jsonSchema` to match the API wire format and the `jsonSchema` field already used in `DocumentTypeCreateParams` and `DocumentTypeUpdateParams`. The runtime field never arrived under the old name, so no real consumer is affected, but TypeScript code reading `.schema` will need to update to `.jsonSchema`.

## [0.1.2] - 2026-04-07

### Added

- `client.documentTypes.create(params)` method for creating custom document types via `POST /api/document-types`
- `client.documentTypes.update(id, params)` method for updating document types via `PUT /api/document-types/{id}`
- `DocumentTypeCreateParams` and `DocumentTypeUpdateParams` type exports
- `status` field on `DocumentType` interface
- `withRawResponse` support for `create()` and `update()` methods
- TSDoc documentation on all public classes, methods, interfaces, and types
- Usage examples for convert, identify, steps, and document-types resources (`examples/`)
- CHANGELOG.md entries for v0.1.0

## [0.1.0] - 2025-06-01

### Added

- **Client class** (`DocuTray`): Main entry point with environment variable fallback for API key
- **Core layer**: `APIClient` with retry logic, timeout handling, exponential backoff with jitter
- **Error hierarchy**: `DocuTrayError`, `APIError` with status-specific subclasses (`BadRequestError`, `AuthenticationError`, `PermissionDeniedError`, `NotFoundError`, `ConflictError`, `UnprocessableEntityError`, `RateLimitError`, `InternalServerError`)
- **Pagination**: Offset-based `Page<T>` with `hasNextPage()`, `nextPage()`, `iterPages()`, `autoPagingIter()`, and `toArray()`
- **Polling**: `waitForCompletion()` for async operations with configurable interval and timeout
- **Raw responses**: `RawResponse<T>` lazy-parsed wrapper via `withRawResponse` accessors
- **File handling**: 3-way file routing (multipart upload, URL JSON, base64 JSON) with automatic content type detection
- **Convert resource**: Synchronous and async document conversion with `run()`, `runAsync()`, and `getStatus()`
- **Identify resource**: Synchronous and async document identification with confidence scores
- **DocumentTypes resource**: List, get, and validate document type definitions
- **Steps resource**: Run predefined processing steps with async polling
- **KnowledgeBases resource**: Full CRUD, semantic search, sync operations, and document sub-resource
- **Type definitions**: Complete TypeScript types for all API request/response shapes
- **Type guards**: `isConversionComplete()`, `isConversionSuccess()`, `isIdentificationComplete()`, `isValidationValid()`, etc.
- Dual ESM/CJS output with `.d.ts` declaration files
- Node.js 18+ support (native fetch/FormData)
- Zero production dependencies
