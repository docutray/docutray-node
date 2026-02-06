## Context

The docutray-node SDK has project scaffolding (tsconfig, tsup, vitest, eslint) but zero runtime code. The core layer must provide the foundation that all resources and the public client build upon. The Python SDK serves as the reference implementation — we adapt its 3-layer architecture to Node.js idioms (Promises, AsyncIterables, native fetch, AbortController).

Current state: empty `src/index.ts` with `export {}`.

## Goals / Non-Goals

**Goals:**
- Implement the complete error hierarchy with factory-based instantiation from HTTP responses
- Implement an HTTP client with retry, timeout, and injectable fetch for testing
- Implement pagination via `Page<T>` with `AsyncIterable` support
- Implement polling via `waitForCompletion()` for long-running operations
- Implement `APIResource` base class for resource inheritance
- Zero production dependencies — native `fetch`, `AbortController`, `crypto` only
- Full TypeScript strict mode compliance with no `any` leaks

**Non-Goals:**
- File upload handling (Phase 3)
- Public `DocuTray` client class (Phase 4)
- Resource implementations (Phase 4)
- Streaming responses
- Browser/edge runtime support (Node.js 18+ only for now)

## Decisions

### 1. Native fetch over axios/got/undici

**Decision**: Use `globalThis.fetch` (available in Node.js 18+).

**Rationale**: Zero dependencies, consistent with modern Node.js. The SDK targets Node 18+ which has stable native fetch. Custom `fetch` injection via constructor allows testing with mock implementations and future edge runtime support.

**Alternatives considered**: axios (too heavy, adds dependency), got (ESM-only complications), undici (closer to metal but unnecessary given native fetch).

### 2. AbortController for timeouts

**Decision**: Use `AbortController` + `setTimeout` to abort requests after the configured timeout.

**Rationale**: Native API, no external timer libraries. Integrates cleanly with fetch's `signal` option. Matches the pattern used by openai-node.

### 3. Error hierarchy with factory pattern

**Decision**: `DocuTrayError` base → `APIError` (with status) → status-specific subclasses. `APIError.generate()` static factory maps status codes to the right class.

**Rationale**: Allows `catch (e) { if (e instanceof RateLimitError) ... }` pattern. Factory centralizes the mapping. Matches stripe-node and openai-node patterns.

### 4. Retry as pure functions

**Decision**: `calculateRetryDelay()` and `shouldRetry()` as standalone pure functions in `retry.ts`, consumed by the HTTP client.

**Rationale**: Easily testable in isolation without HTTP mocking. Clear separation between retry policy and HTTP execution.

### 5. Page<T> with AsyncIterable protocol

**Decision**: `Page<T>` implements `Symbol.asyncIterator` for `for await...of` support. Provides both page-level (`iterPages()`) and item-level (`autoPagingIter()`) async iteration.

**Rationale**: Idiomatic JavaScript iteration. Users can `for await (const item of page.autoPagingIter())` or `page.toArray({ limit: 100 })` for batch collection.

### 6. File organization: src/lib/ for utilities, src/core/ for core classes

**Decision**: Static utilities (`version.ts`, `constants.ts`, `utils.ts`) go in `src/lib/`. Core classes and logic (`error.ts`, `retry.ts`, `api-client.ts`, etc.) go in `src/core/`. `APIResource` base lives at `src/resource.ts`.

**Rationale**: Follows openai-node's organizational pattern. Clean separation between pure utilities and stateful/behavioral modules.

### 7. Polling via callback pattern

**Decision**: `waitForCompletion<T>()` accepts a `getStatus` callback function rather than coupling to a specific resource class.

**Rationale**: Generic and reusable across any resource that has long-running operations. The resource passes its own status-checking method as the callback.

## Risks / Trade-offs

- **[Native fetch inconsistencies across Node versions]** → Mitigation: target Node 18+ only, document minimum version. Injectable fetch allows workarounds if needed.
- **[Retry jitter bounds not perfectly uniform]** → Mitigation: Use `Math.random()` which is sufficient for retry jitter (not crypto-grade randomness needed).
- **[Page<T> assumes offset-based or cursor-based pagination from API]** → Mitigation: Design `Page<T>` to work with the DocuTray API's actual pagination format (`items`, `next_cursor` or similar). Will adapt once API pagination format is confirmed.
- **[Polling may hold connections open for long periods]** → Mitigation: Configurable timeout (default 300s), interval, and user-provided `AbortSignal` support.
