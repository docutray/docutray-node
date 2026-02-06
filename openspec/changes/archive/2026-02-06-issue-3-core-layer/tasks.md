## 1. Utilities and Constants

- [x] 1.1 Create `src/lib/version.ts` exporting `VERSION` string matching `package.json` version
- [x] 1.2 Create `src/lib/constants.ts` exporting `DEFAULT_BASE_URL`, `DEFAULT_TIMEOUT`, `DEFAULT_MAX_RETRIES`, retry constants (initial delay, max delay, exponential base, jitter range), `RETRYABLE_STATUS_CODES`, polling defaults (interval, timeout)
- [x] 1.3 Create `src/lib/utils.ts` exporting `readEnv()`, `sleep()`, and `maskApiKey()` functions

## 2. Core Types

- [x] 2.1 Create `src/core/types.ts` exporting `ClientOptions`, `RequestOptions`, `RetryConfig`, and `FileInput` interfaces/types

## 3. Error Hierarchy

- [x] 3.1 Create `src/core/error.ts` with `DocuTrayError` base class, `APIConnectionError`, `APITimeoutError`
- [x] 3.2 Add `APIError` class with `statusCode`, `requestId`, `body`, `headers` properties
- [x] 3.3 Add status-specific error classes: `BadRequestError` (400), `AuthenticationError` (401), `PermissionDeniedError` (403), `NotFoundError` (404), `ConflictError` (409), `UnprocessableEntityError` (422), `RateLimitError` (429), `InternalServerError` (5xx)
- [x] 3.4 Add `RateLimitError` extra properties: `retryAfter`, `limitType`, `limit`, `remaining`, `resetTime`
- [x] 3.5 Implement `APIError.generate()` static factory mapping status codes to error classes
- [x] 3.6 Write `tests/core/error.test.ts` covering factory method, all status codes, RateLimitError properties, inheritance chain

## 4. Retry Logic

- [x] 4.1 Create `src/core/retry.ts` with `calculateRetryDelay()` implementing exponential backoff + jitter + Retry-After respect
- [x] 4.2 Add `shouldRetry()` function checking attempt count, retryable status codes, and connection error retryability
- [x] 4.3 Write `tests/core/retry.test.ts` covering delay bounds, jitter range, Retry-After override, shouldRetry decisions for all cases

## 5. HTTP Client

- [x] 5.1 Create `src/core/raw-response.ts` implementing `RawResponse<T>` with `statusCode`, `headers`, and `parse()` method
- [x] 5.2 Create `src/core/api-client.ts` implementing `APIClient` with constructor accepting `ClientOptions`, default headers (Authorization, User-Agent, Content-Type)
- [x] 5.3 Implement request method with retry loop, timeout via `AbortController`, JSON body serialization/deserialization
- [x] 5.4 Implement convenience methods: `get()`, `post()`, `put()`, `patch()`, `delete()` delegating to the core request method
- [x] 5.5 Implement `{ raw: true }` option returning `RawResponse<T>`
- [x] 5.6 Write `tests/core/api-client.test.ts` covering success, retry on failure, timeout, custom headers, raw response, injectable fetch

## 6. Pagination

- [x] 6.1 Create `src/core/pagination.ts` implementing `Page<T>` with `items`, `hasNextPage()`, `nextPage()`
- [x] 6.2 Implement `iterPages()` returning `AsyncIterableIterator<Page<T>>`
- [x] 6.3 Implement `autoPagingIter()` returning `AsyncIterableIterator<T>` yielding individual items across pages
- [x] 6.4 Implement `toArray({ limit })` collecting items with safety cap
- [x] 6.5 Write `tests/core/pagination.test.ts` covering multi-page iteration, autoPagingIter, toArray with and without limit

## 7. Polling

- [x] 7.1 Create `src/core/polling.ts` implementing `waitForCompletion<T>()` with `getStatus` callback, `pollInterval`, `timeout`, `onStatus` callback
- [x] 7.2 Handle terminal states: success returns result, failure throws `DocuTrayError`, timeout throws `APITimeoutError`
- [x] 7.3 Write `tests/core/polling.test.ts` covering success, failure, timeout, and onStatus callback invocation

## 8. Base Resource

- [x] 8.1 Create `src/resource.ts` implementing `APIResource` base class storing client reference

## 9. Public API and Validation

- [x] 9.1 Update `src/index.ts` to re-export all public types, classes, errors, constants, and utilities
- [x] 9.2 Verify `npm run build` succeeds (ESM + CJS)
- [x] 9.3 Verify `npm run typecheck` succeeds
- [x] 9.4 Verify `npm run lint` succeeds
- [x] 9.5 Verify `npm run test` passes all tests
