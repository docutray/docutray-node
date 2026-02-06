## Why

The resource layer (Phase 5) needs well-typed request parameters and response models to provide type-safe API interactions. Currently the SDK has core infrastructure types (`ClientOptions`, `RequestOptions`, etc.) but no types for the domain objects — conversions, identifications, document types, steps, and knowledge bases. Without these, resource methods would return `any` and consumers lose IntelliSense/autocomplete. This is Phase 3 of the roadmap and blocks all resource implementation.

## What Changes

- Add `src/types/shared.ts` with pagination, content-type, rate-limit, and error detail types
- Add `src/types/convert.ts` with conversion status types, result, and request params
- Add `src/types/identify.ts` with identification status types, document type matches, and request params
- Add `src/types/document-type.ts` with document type model, validation types, and list params
- Add `src/types/step.ts` with step execution status types and run params
- Add `src/types/knowledge-base.ts` with KB model, documents, search, and sync types
- Add `src/types/index.ts` barrel re-exporting all public types
- Update `src/index.ts` to re-export the types namespace

## Capabilities

### New Capabilities
- `shared-types`: Pagination, PaginatedResponse<T>, ImageContentType, RateLimitInfo, QuotaExceededInfo, ErrorDetail
- `convert-types`: ConversionStatusType, ConversionResult, ConversionStatus, ConvertParams
- `identify-types`: IdentificationStatusType, DocumentTypeMatch, IdentificationResult, IdentificationStatus, IdentifyParams
- `document-type-types`: DocumentType, ValidationErrorInfo, ValidationWarningInfo, ValidationResult, DocumentTypesListParams
- `step-types`: StepExecutionStatusType, StepExecutionStatus, StepsRunParams
- `knowledge-base-types`: KnowledgeBase, KnowledgeBaseDocument, SearchResultItem, SearchResult, SyncResult

### Modified Capabilities
_(none — no existing spec requirements change)_

## Impact

- **New files**: 7 files under `src/types/` + barrel `src/types/index.ts`
- **Modified files**: `src/index.ts` (add type re-exports)
- **Dependencies**: None at runtime — pure type definitions only
- **API surface**: All types become part of the public SDK export; consumers can import them for annotations
- **References**: Python SDK `docutray/types/` as canonical model (adapted to camelCase + TS conventions)
