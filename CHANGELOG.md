# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-10-28

### Breaking changes

Each item lists what to change when upgrading from 0.1.x.

- **`documentTypes.validate(id, data, params?, options?)`** takes the document data as its second argument. The 0.1.x signature `validate(id, options)` sent no body, which the API rejects. Migration: pass the data, e.g. `validate(id, extracted)`; request options move to the fourth argument.
- **`convert.run()` returns `ConversionResult`** (`{ data, validation, field_locations }`), the body the API actually sends, instead of `ConversionStatus` (types only; runtime is unchanged). Migration: read `result.data` and `result.validation`; `conversion_id`, `status` and `error` were never present on a sync conversion, which throws on failure.
- **`wait` and `webhookUrl` removed from `ConvertParams`, `IdentifyParams` and `StepsRunParams`**, and no longer sent. The API never read them, so a per-request webhook was never configured. Migration: delete them; configure webhooks per organization in DocuTray and type the bodies with `ConversionWebhookPayload`, `IdentificationWebhookPayload` and `StepWebhookPayload`.
- **`identify.run()` returns `IdentificationResult`** (`{ document_type, alternatives? }`), the body the API sends, instead of `IdentificationStatus`. `IdentificationResult` changed from camelCase (`documentType`) to the wire names. Migration: read `result.document_type` (non-null) and `result.alternatives ?? []`.
- **`IdentifyParams.documentTypeCodeOptions` is required.** The API rejects requests without at least one option; the SDK now throws a `DocuTrayError` before sending one. Migration: pass the codes to choose from.
- **`convert.runAsync()`, `identify.runAsync()` and `steps.runAsync()` return the enqueue body** (`ConversionEnqueued` `{ conversion_id, status_url, status }`, `IdentificationEnqueued` `{ id, status, documentTypeCode }` and `StepExecutionEnqueued` `{ id, status, step_id, step_name }`) plus `wait()`, instead of a full status. Migration: before `wait()`, read only the id and `status`; the other status fields were never sent at that point. `wait()` and `getStatus()` still return the full status.
- **`StepExecutionStatus.execution_id`** replaces `id`, which the status endpoint never sent (`id` was always `undefined` after `getStatus()`/`wait()`). `error` is now `StepExecutionError` (`{ message, phase?, timestamp?, reason? }`). `step_id`, `step_name` and `original_filename` were removed (the status endpoint does not send them). Migration: read `status.execution_id` and `status.error?.message`.
- **`IdentificationStatus`**: `status_url` and `original_filename` removed (never sent); `document_type_code_options` added; `response_timestamp`, `document_type`, `alternatives` and `error` are optional, as the API only sends them in terminal states.
- **Knowledge Bases unwrap the `{ data }` envelope.** `get()`, `create()`, `update()`, `sync()` and `documents().get/create/update()` returned the envelope in 0.1.x, so for example `kb.name` was `undefined`. Migration: if you worked around it with `.data`, remove it. `withRawResponse` returns the envelope (`KnowledgeBaseEnvelope<T>`).
- **`KnowledgeBaseCreateParams.description` and `schema` are required**, and **`KBDocumentCreateParams.documentId` is required**, as the API requires them (without them every call failed with 400). Document methods (`get`, `update`, `delete`) take that `documentId`, not the internal `id`.
- **`knowledgeBases.sync(id, params?, options?)`** takes sync params as its second argument; request options move to the third. `sync()` waits until the sync finishes and is no longer retried by default (`maxRetries: 0`): a timed-out sync may still be running on the server, and each retry ran the full sync again. Migration: move request options to the third argument; pass a longer `timeout` for large knowledge bases, and `maxRetries` to opt back into retries.
- **`KnowledgeBase`** matches the API: `documentCount` (never sent) is replaced by `_count?: { documents }`; `organizationId`, `indexingPreferences` and `indexingFields` added. `SyncResult` adds `embeddingsGenerated` and types `status` as `'completed' | 'failed'`.
- **Unknown `DocuTray` client options throw a `DocuTrayError`.** A misspelled option such as `baseUrl` was silently ignored and requests (with the API key) went to the default production URL. The error suggests the right name (`baseUrl (did you mean baseURL?)`). Migration: fix or remove the option.
- **`wait()` accepts only `pollInterval`, `timeout` and `onStatus`** (`WaitOptions<T>`). `isFailed` and `getError` never had an effect, and overriding `getStatus` or `isComplete` could poll past an `ERROR` until the timeout or break polling. `wait()` resolves with the final status on `SUCCESS` and on `ERROR`.

### Added

- `dslRules` on `DocumentType`, `DocumentTypeCreateParams` and `DocumentTypeUpdateParams`: DSL business rules validated against extracted data (docutray/docutray#1111). In `update()`, omitting the field keeps the stored rules and `null` or `''` clears them.
- `documentTypes.validate(id, data, { dslRules })`: pass `dslRules` to test temporary rules without saving them (dry-run). `ValidationResult` now includes `valid` and `issues`, and keeps the `errors`/`warnings` summaries. `undefined` data throws a `DocuTrayError` before any request is sent.
- `DSLValidationError` (subclass of `BadRequestError`) with `diagnostics: DSLDiagnostic[]` (`line`, `column`, `message`), thrown when DSL rules fail to compile.
- `validation: ConversionValidation` on `ConversionResult` and `ConversionStatus`, where `ConversionValidation = ValidationOutcome | ValidationSystemFailure | null`; type guards `isValidationOutcome()` and `isValidationSystemFailure()`.
- New types `ValidationIssue`, `ValidationOutcome`, `ValidationSystemFailure`, `ValidationSummary`, `ValidationSeverity`, `ValidationIssueSource`, `DSLDiagnostic`.
- `field_locations` (`FieldLocations`) on `ConversionResult` and `ConversionStatus`.
- Webhook types `ConversionWebhookPayload` and `WebhookEventType`.
- `promptHints`, `identifyPromptHints`, `keepPropertyOrdering` and `boundingBoxesEnabled` on `DocumentType`; `boundingBoxesEnabled` on create/update params.
- Knowledge Bases parameters: `list({ search, isActive })`, `search({ similarityThreshold, includeMetadata })`, `sync(id, { force, regenerateEmbeddings })`, `documents().list({ search, documentId })`, `generateEmbedding` on document create, `regenerateEmbedding` on document update and `indexingPreferences` on create/update.
- `documentMetadata` on `convert.run/runAsync` and `identify.run/runAsync` (already supported by steps). The API echoes it in conversion and step statuses and in all webhooks; for identify, only in webhooks.
- Webhook types `IdentificationWebhookPayload` and `StepWebhookPayload`.
- `WaitOptions<T>`, `DocumentTypeEnvelope`, `KnowledgeBaseEnvelope<T>`, `KnowledgeBaseSyncParams`, `ConversionEnqueued`, `IdentificationEnqueued`, `StepExecutionEnqueued`, `StepExecutionError` and `EmbeddingStatus` exports.

### Changed

- `StepExecutionStatus.validation` is typed as `ValidationSummary` instead of `Record<string, unknown>` (same runtime shape).
- `ConversionWebhookPayload.status` is typed as `ConversionStatusType` instead of `string`.
- `ValidationErrorInfo` and `ValidationWarningInfo` now live in the validation types module (still exported from the package root).
- `isValidationValid()` uses `valid` when the API returns it.
- API error messages fall back to the body's `error` field, so errors carry the API's message instead of `Request failed with status N`.
- `wait()` documentation states that it resolves with the final status on `ERROR` (it never threw); the unreachable failure check was removed.
- Ids are URL-encoded in request paths.
- `documentTypes.withRawResponse.get/create/update()` are typed with the `{ data }` envelope they return (`DocumentTypeEnvelope`).
- `npm run typecheck` also type-checks `tests/` and `examples/`.

### Fixed

- Base64 uploads with a data URI and no `contentType` failed with 400: the SDK stripped the `data:<type>;base64,` prefix without sending its MIME type. It now sends the data URI's type as `image_content_type`.
- `VERSION` (and the `User-Agent` header) is generated from `package.json` at build time. 0.1.3 to 0.1.5 reported `docutray-node/0.1.2`.
- README code samples now match the implementation (#26): `docType.codeType` instead of `docType.code`; `steps.runAsync({ stepId, ... })` instead of `runAsync(stepId, params)`; `status.conversion_id` and `final.status === 'SUCCESS'` instead of `conversionId` and the nonexistent `isSuccess()`/`isFailed()`; `identify.run()` read through `document_type`; `await list()` before `iterPages()`/`autoPagingIter()`; `response.headers.get()` and `await response.parse()` for raw responses.
- README and `examples/document-types.ts` use a `YOUR_DOCUMENT_TYPE_ID` placeholder instead of `dt_`-prefixed ones, and explain that `get()`, `update()` and `validate()` take the internal id (a cuid), not the `codeType` (resolve it with `list()` first; a code returns 404). The JSDoc of those methods says the same.

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
