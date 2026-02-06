## Why

The project scaffolding (Phase 1) is complete but there is no runtime code. The core layer is the foundation for all subsequent phases — types, file handling, resources, and the public client. Without it, no API calls can be made. Closes #3.

## What Changes

- Add utility modules (`version.ts`, `constants.ts`, `utils.ts`) with SDK configuration defaults
- Implement complete error hierarchy with `APIError.generate()` factory mapping HTTP status codes to specific error classes
- Implement retry logic with exponential backoff, jitter, and Retry-After header support
- Implement `APIClient` HTTP class using native `fetch` with retry loop, timeout via `AbortController`, Bearer token auth, and injectable fetch
- Implement `RawResponse<T>` wrapper for raw HTTP response access
- Implement `Page<T>` pagination with `AsyncIterable` support (`autoPagingIter`, `toArray`)
- Implement `waitForCompletion()` polling utility with configurable interval, timeout, and status callbacks
- Implement `APIResource` base class that all resource classes will extend
- Add core type definitions (`ClientOptions`, `RequestOptions`, `RetryConfig`, `FileInput`)
- Update `src/index.ts` to re-export the public API

## Capabilities

### New Capabilities
- `error-hierarchy`: Complete error tree (`DocuTrayError` → `APIError` → status-specific errors) with factory pattern for HTTP status code mapping
- `http-client`: HTTP client using native fetch with retry loop, timeout via AbortController, Bearer auth, User-Agent header, and configurable fetch injection
- `retry-logic`: Retry decision and delay calculation with exponential backoff, jitter, and Retry-After header respect
- `pagination`: `Page<T>` implementing AsyncIterable for automatic multi-page iteration with safety limits
- `polling`: Generic `waitForCompletion()` for long-running operations with configurable interval, timeout, and status callbacks
- `core-types`: Core TypeScript interfaces (`ClientOptions`, `RequestOptions`, `RetryConfig`, `FileInput`) and utility modules

### Modified Capabilities
<!-- No existing capabilities are modified — this is all new runtime code -->

## Impact

- **New files**: `src/lib/` (version, constants, utils), `src/core/` (error, retry, api-client, raw-response, pagination, polling, types), `src/resource.ts`
- **Modified files**: `src/index.ts` (re-exports)
- **Tests**: New test suite under `tests/core/` covering errors, retry, HTTP client, pagination, polling
- **Dependencies**: Zero new production dependencies — uses native `fetch`, `AbortController`, `crypto` (Node 18+)
- **APIs**: Establishes the internal API surface that all resources will consume
