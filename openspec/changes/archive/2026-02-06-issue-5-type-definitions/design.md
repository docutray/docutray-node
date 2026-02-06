## Context

The SDK has core infrastructure types in `src/core/types.ts` (ClientOptions, RequestOptions, RetryConfig, FileInput) and a base `APIResource` class. Phase 3 adds the domain-level types that model every API response and request parameter. These are pure TypeScript interfaces/type aliases with no runtime code except type-guard functions for status enums.

The Python SDK (`docutray-python/src/docutray/types/`) serves as the canonical reference. Python uses Pydantic BaseModel with snake_case; Node.js uses interfaces with camelCase.

## Goals / Non-Goals

**Goals:**
- Provide complete TypeScript type definitions for all 5 API resources (convert, identify, documentTypes, steps, knowledgeBases)
- Offer full IntelliSense/autocomplete for consumers
- Include standalone type-guard functions for status types (`isComplete`, `isSuccess`, `isError`)
- Export all types through `src/types/index.ts` barrel and `src/index.ts`

**Non-Goals:**
- No runtime validation (Zod, io-ts, etc.) — types are compile-time only
- No class-based models — pure interfaces and type aliases
- No polling methods on status types — polling lives in the resource layer (Phase 5)
- No `_resource` internal fields — that's a Python Pydantic concern for polling; Node.js handles this at the resource level

## Decisions

### 1. Interfaces over classes for response models
**Decision**: Use `interface` for all response/request types.
**Rationale**: Response types represent plain JSON shapes from the API. Interfaces enable structural typing and are erased at compile time. Classes would add unnecessary runtime overhead and complexity. Type-guard functions provide the runtime checks needed for status enums.
**Alternatives**: Classes with methods (rejected — adds runtime weight, couples data to behavior); Zod schemas (rejected — out of scope, adds dependency).

### 2. String unions for status types, not enums
**Decision**: Use `type ConversionStatusType = "ENQUEUED" | "PROCESSING" | "SUCCESS" | "ERROR"` instead of `enum`.
**Rationale**: String unions are idiomatic TypeScript, match the API's string values directly, and produce no runtime JavaScript. TypeScript enums generate runtime objects and have known gotchas (reverse mappings, nominal vs structural). String unions also match the Python SDK's `Literal[...]` approach.
**Alternatives**: `enum` (rejected — runtime overhead, non-structural); `as const` object (rejected — heavier syntax for no benefit here).

### 3. Standalone type-guard functions instead of methods
**Decision**: Export functions like `isConversionComplete(status)`, `isConversionSuccess(status)` instead of methods on a class.
**Rationale**: Since types are interfaces (no methods), standalone functions are the natural pattern. They're tree-shakeable and testable in isolation. Matches stripe-node's approach of keeping types as plain objects.
**Alternatives**: Wrapper classes with methods (rejected — see Decision 1).

### 4. Timestamps as `string` (ISO 8601), not `Date`
**Decision**: All timestamp fields (`requestTimestamp`, `createdAt`, etc.) are typed as `string` (ISO 8601 format).
**Rationale**: The API returns JSON strings. Auto-parsing to `Date` would require runtime transformation which belongs in the resource layer, not in pure type definitions. Consumers can parse with `new Date(value)` if needed. Matches stripe-node convention.
**Alternatives**: `Date` (rejected — requires runtime parsing in type-only layer).

### 5. One file per resource domain
**Decision**: Separate files: `shared.ts`, `convert.ts`, `identify.ts`, `document-type.ts`, `step.ts`, `knowledge-base.ts`, `index.ts`.
**Rationale**: Mirrors the Python SDK's structure and the resource organization. Each file is self-contained and imports only from `shared.ts` when needed. Barrel file re-exports everything.

### 6. `null` for optional API response fields, not `undefined`
**Decision**: Optional fields on response types use `fieldName: string | null` (not `?:` or `| undefined`).
**Rationale**: The API returns explicit `null` values in JSON for absent fields. Using `| null` accurately models this. Request parameter types use `?:` (optional) since callers may omit them.

## Risks / Trade-offs

- **API drift** → Types may diverge from the actual API over time. Mitigation: Phase 5 resource tests will validate response shapes; future integration tests can catch mismatches.
- **No runtime validation** → Malformed API responses won't be caught by types at runtime. Mitigation: This is acceptable for an SDK — the server is trusted. Runtime validation can be added later as an opt-in feature.
- **Breaking changes on type exports** → Adding types to the public API surface means removing/renaming them is a breaking change. Mitigation: Match the Python SDK's proven type surface; version carefully.
