## 1. DocuTray Client Class

- [x] 1.1 Create `src/client.ts` with `DocuTray` class: constructor accepting `ClientOptions` with `apiKey` env var fallback via `readEnv('DOCUTRAY_API_KEY')`, `DocuTrayError` on missing key, internal `APIClient`, and five readonly resource properties (`convert`, `identify`, `documentTypes`, `steps`, `knowledgeBases`)
- [x] 1.2 Update `src/index.ts` to export `DocuTray` as default and named export, re-export `ClientOptions` type

## 2. Client Unit Tests

- [x] 2.1 Create `tests/client.test.ts` testing: explicit API key, env var fallback, missing key error, custom baseURL/timeout, all five resource property types

## 3. Test Fixtures Update

- [x] 3.1 Add `createDocuTrayClient()` helper to `tests/helpers/fixtures.ts` that returns a `DocuTray` instance with test-key and TEST_BASE_URL

## 4. Integration Tests

- [x] 4.1 Create `tests/integration/retry.test.ts`: retry succeeds after transient 500, respects maxRetries limit
- [x] 4.2 Create `tests/integration/timeout-cancellation.test.ts`: timeout via options, AbortSignal cancellation
- [x] 4.3 Create `tests/integration/pagination.test.ts`: multi-page iteration with autoPagingIter, toArray with limit, early break stops fetching
- [x] 4.4 Create `tests/integration/polling.test.ts`: polling lifecycle (ENQUEUED → PROCESSING → SUCCESS), failure path, timeout, onStatus callback

## 5. Validation

- [x] 5.1 Verify all existing + new tests pass (`npm test`), coverage >= 80% (`npm run test:coverage`), typecheck (`npm run typecheck`), lint (`npm run lint`), build (`npm run build`)
