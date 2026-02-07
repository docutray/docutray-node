## Why

All internal SDK components exist (core layer, types, file handling, resources) but there is no unified entry point. Users cannot do `import DocuTray from 'docutray'` — the signature usage pattern. This issue creates the public `DocuTray` client class that wires everything together, plus integration tests that exercise cross-cutting concerns through the client interface.

## What Changes

- Add `src/client.ts` with `DocuTray` class that instantiates `APIClient` internally and exposes all five resource properties (`convert`, `identify`, `documentTypes`, `steps`, `knowledgeBases`)
- Update `src/index.ts` to export `DocuTray` as both default and named export
- Add client unit tests covering construction, env var fallback, missing key error, and resource accessors
- Add integration test suite covering retry, timeout/cancellation, pagination, and polling through the `DocuTray` client

## Capabilities

### New Capabilities
- `client-class`: The public `DocuTray` entry point class that wires `APIClient` with all resources
- `integration-tests`: Cross-cutting integration tests exercising retry, timeout, pagination, and polling through the client

### Modified Capabilities
- `msw-test-helpers`: Add `createDocuTrayClient()` helper to fixtures for integration tests

## Impact

- `src/client.ts`: New file — the SDK's public entry point
- `src/index.ts`: Add default + named `DocuTray` export, re-export `ClientOptions`
- `tests/client.test.ts`: New file — client unit tests
- `tests/integration/*.test.ts`: New directory with 4 integration test files
- `tests/helpers/fixtures.ts`: Add `createDocuTrayClient()` helper
- Package consumers: Can now `import DocuTray from 'docutray'`
