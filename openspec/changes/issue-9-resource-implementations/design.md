## Context

The SDK has a complete foundation: APIClient, error hierarchy, types, file handling, pagination, and polling. All five API resource areas (Convert, Identify, DocumentTypes, Steps, KnowledgeBases) have type definitions but no resource classes. This design connects the layers into a usable public API.

The API uses offset-based pagination (`data`/`pagination: {total, page, limit}`) but the current `Page<T>` is cursor-based (`items`/`next_cursor`). This mismatch must be resolved before resources can use pagination.

## Goals / Non-Goals

**Goals:**
- Implement all 5 resource classes matching the Python SDK's public API surface
- Adapt `Page<T>` to offset-based pagination matching the API format
- Provide `withRawResponse` on every resource for accessing headers/status
- Support 3-way file upload routing (multipart, URL, base64) on file-accepting resources
- Attach `wait()` polling to async status objects
- Set up MSW-based test infrastructure for network-level mocking

**Non-Goals:**
- Creating a high-level `DocuTray` client class (deferred to next phase)
- Streaming or chunked upload support
- Webhook verification utilities
- Rate limit middleware or automatic throttling

## Decisions

### 1. Offset-based Page<T> — Replace cursor internals

Change `PageResponse<T>` from `{items, next_cursor}` to `{data, pagination: {total, page, limit}}`. `hasNextPage()` computes from `page * limit < total`. `nextPage()` increments `page` by 1.

**Why over adding a separate OffsetPage class**: Single Page class keeps the API simple. No existing consumers use the cursor-based Page since the SDK isn't released yet. Updating tests is trivial.

### 2. File upload routing — Conditional branching in resource methods

Each resource method that accepts files (convert.run, identify.run, steps.runAsync) branches on `params.file` / `params.url` / `params.base64` to select the upload strategy. The method builds the appropriate body (FormData or JSON) and delegates to `this._client.post()`.

**Why over a shared upload helper**: The branching is 3-way and each resource has slightly different field names and metadata handling. A shared helper would need extensive parameterization for little gain. Direct branching is readable and explicit.

### 3. withRawResponse — Wrapper class pattern

Each resource gets a companion `*WithRawResponse` class that mirrors the resource methods but passes `{ raw: true }` in options. The resource exposes it via a `get withRawResponse()` getter.

**Why over a Proxy-based approach**: Explicit wrapper classes are type-safe and discoverable. The Proxy approach would lose TypeScript autocompletion. The boilerplate cost is acceptable for 5 resources.

### 4. Polling on status objects — Object.assign with wait()

`runAsync()` methods return the API's status object enhanced with a `wait()` method via `Object.assign()`. The `wait()` method calls `waitForCompletion()` from the polling module with the resource's `getStatus()` as the poller.

**Why over returning a custom StatusHandle class**: `Object.assign` preserves the exact API response shape while adding the convenience method. Users can destructure or serialize the status normally. A wrapper class would hide the response data behind accessors.

### 5. Sub-resource pattern — Factory method returning scoped instance

`client.knowledgeBases.documents(kbId)` returns a `KnowledgeBaseDocuments` instance scoped to that knowledge base ID. The sub-resource holds the client and the KB ID, prefixing all paths with `/api/knowledge-bases/{kbId}/documents`.

### 6. MSW test setup — Shared server with per-test handler overrides

A single MSW `setupServer()` in `tests/helpers/mock-server.ts` with default handlers. Tests can override handlers for specific scenarios using `server.use()`. Vitest setup hooks manage server lifecycle.

## Risks / Trade-offs

- **Breaking `Page<T>` interface** → No external consumers yet; update existing tests. Risk is minimal.
- **`Object.assign` for wait()** → The `wait` property could theoretically collide with an API response field named `wait`. Unlikely given the API schema. If it happens, rename to `poll()`.
- **No shared file upload helper** → Some code repetition across Convert, Identify, Steps. Acceptable for 3 resources; can refactor later if more file-accepting resources are added.
- **MSW version compatibility** → Using MSW 2.x which has different API from v1. Must use `http.get()`/`http.post()` handlers (not `rest.get()`).
