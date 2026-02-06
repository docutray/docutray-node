# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- TSDoc documentation on all public classes, methods, interfaces, and types
- Usage examples for all resources (`examples/`)
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
