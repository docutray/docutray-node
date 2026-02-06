# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Node.js/TypeScript SDK for the DocuTray API (document processing: OCR, identification, extraction, knowledge bases). This is the Node.js equivalent of the docutray Python SDK, following patterns from stripe-node and openai-node.

## Commands

```bash
npm run build          # Build with tsup (ESM + CJS dual output)
npm test               # Run tests (vitest, single run)
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
npm run lint           # ESLint on src/
npm run typecheck      # tsc --noEmit
```

## Architecture

3-layer pattern:

- **Client Layer** (`src/client.ts`): Public `DocuTray` class with resource properties (convert, identify, documentTypes, steps, knowledgeBases)
- **Core Layer** (`src/core/`):
  - `api-client.ts`: `APIClient` with retry logic, timeout handling, exponential backoff
  - `error.ts`: Error hierarchy (`DocuTrayError`, `APIError` subclasses per HTTP status)
  - `pagination.ts`: Offset-based `Page<T>` with `hasNextPage()`, `nextPage()`, `toArray()`
  - `polling.ts`: `waitForCompletion()` for async operations
  - `raw-response.ts`: `RawResponse<T>` lazy-parsed wrapper (via `options.raw: true`)
  - `types.ts`: Shared types (`RequestOptions`, `ClientOptions`)
- **Resource Layer** (`src/resources/`): API resources (Convert, Identify, DocumentTypes, Steps, KnowledgeBases) extending `APIResource` base class
- **Types Layer** (`src/types/`): Type definitions for all API response/request shapes
- **Lib Layer** (`src/lib/files.ts`): File handling utilities for multipart, URL, and base64 uploads

### Resource Patterns

- **`withRawResponse`**: Each resource exposes a companion wrapper that returns `RawResponse<T>` (access HTTP status/headers). WithRawResponse classes receive a bound `_run` function (for file-routing resources) or direct `_client` reference
- **`Omit<RequestOptions, 'raw'>`**: All public resource methods exclude `raw` from options to prevent accidental raw responses
- **Async polling**: `runAsync()` returns status with `.wait()` method for automatic polling via `waitForCompletion()`
- **3-way file routing**: Resources accepting files route through multipart (FormData), URL JSON, or base64 JSON via `prepareFileUpload()`, `prepareUrlUpload()`, `prepareBase64Upload()`

## Testing

- **Framework**: Vitest with MSW (Mock Service Worker) v2 for network-level mocking
- **Shared server**: Single MSW server in `tests/helpers/mock-server.ts` with lifecycle hooks in `tests/helpers/setup.ts` (wired via `vitest.config.ts` `setupFiles`)
- **Fixtures**: Shared test data and `createTestClient()` in `tests/helpers/fixtures.ts`
- **Re-exports**: Import `{ server, http, HttpResponse }` from `tests/helpers/mock-server.js` in test files

## Conventions

- All code, comments, and documentation in English (internal docs in `/docs` may be Spanish)
- TypeScript strict mode
- camelCase for methods and properties
- Async-only (Promises), no sync/async dual
- Private modules prefixed with underscore (`_client.ts`, `_http.ts`)
- Node.js 18+ required (native fetch/FormData)
- Each task should be independently testable
- Include TypeScript types in all code tasks

## OpenSpec Workflow

This project uses OpenSpec (spec-driven schema) configured in `openspec/config.yaml`. Use `/opsx:*` commands for structured development workflow (explore, new, continue, apply, verify, archive).
