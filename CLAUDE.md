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
- **HTTP Layer** (`src/http.ts`): `HTTPClient` with retry logic, timeout handling, exponential backoff
- **Exception Layer** (`src/errors.ts`): Error hierarchy with specific types per HTTP status

Resources live in `src/resources/`, types in `src/types/`.

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
