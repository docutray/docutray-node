## Context

All five phases of internal SDK components are complete and merged to main: core layer (APIClient, errors, pagination, polling, retry), type definitions, file handling, and resource implementations. The SDK lacks a unified entry point — users must manually instantiate `APIClient` and individual resources. Integration tests that exercise cross-cutting concerns through the full stack do not exist.

## Goals / Non-Goals

**Goals:**
- Provide a single `DocuTray` class that wires `APIClient` with all resources
- Follow stripe-node/openai-node patterns for constructor ergonomics (env var fallback, validation)
- Integration tests covering retry, timeout/cancellation, pagination, polling through the client
- Maintain 80%+ coverage thresholds

**Non-Goals:**
- Custom client configuration beyond `ClientOptions` (e.g., middleware, interceptors)
- Resource lazy-loading or tree-shaking optimizations
- End-to-end tests against a real API

## Decisions

### D1: DocuTray class wraps APIClient internally

The `DocuTray` class instantiates `APIClient` in its constructor and passes it to each resource. Resources remain thin facades. The class stores `_client` as a private field — not exposed publicly.

**Rationale:** Matches stripe-node where `Stripe` class owns the HTTP client. Keeps the public API surface minimal. Users who need low-level access can import `APIClient` directly.

**Alternative considered:** Having `DocuTray` extend `APIClient` — rejected because it would expose HTTP methods (`get`, `post`, etc.) on the public class.

### D2: API key with env var fallback

Constructor reads `apiKey` from options first, then falls back to `readEnv('DOCUTRAY_API_KEY')`. Throws `DocuTrayError` if neither provides a key.

**Rationale:** Standard pattern in stripe-node (`STRIPE_API_KEY`) and openai-node (`OPENAI_API_KEY`). Enables zero-config in environments where the env var is set.

### D3: Resource properties as readonly fields

All five resource properties (`convert`, `identify`, `documentTypes`, `steps`, `knowledgeBases`) are `readonly` fields assigned in the constructor.

**Rationale:** Simpler than getters, no lazy initialization needed since all resources are lightweight (just store a `_client` reference). Readonly prevents accidental reassignment.

### D4: Integration tests use DocuTray client, not raw APIClient

All integration tests instantiate `DocuTray` and exercise the full stack: client → resource → APIClient → MSW. A `createDocuTrayClient()` helper in fixtures creates a pre-configured client.

**Rationale:** Tests should exercise the same code path users will use. Testing through `DocuTray` validates the wiring, not just individual components.

### D5: Integration tests in separate directory

Integration tests go in `tests/integration/` with one file per cross-cutting concern: `retry.test.ts`, `timeout-cancellation.test.ts`, `pagination.test.ts`, `polling.test.ts`.

**Rationale:** Separates unit tests (component isolation) from integration tests (cross-cutting, full-stack). Makes it easy to run subsets via `vitest --dir tests/integration`.

## Risks / Trade-offs

- **Risk: Env var fallback in constructor** — Could cause confusion if `DOCUTRAY_API_KEY` is set unexpectedly → Mitigation: document precedence clearly, explicit apiKey always wins.
- **Risk: Integration test flakiness from timing** — Polling and retry tests depend on timing → Mitigation: Use minimal delays in MSW handlers, override poll/retry intervals to near-zero in tests.
- **Trade-off: Eagerly instantiating all resources** — All 5 resources created even if user only needs one → Acceptable: resource construction is trivial (just stores a reference).
