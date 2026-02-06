## 1. Shared Types

- [ ] 1.1 Create `src/types/shared.ts` with `Pagination`, `PaginatedResponse<T>`, `ImageContentType`, `RateLimitInfo`, `QuotaExceededInfo`, `ErrorDetail` interfaces/types

## 2. Resource Types — Convert

- [ ] 2.1 Create `src/types/convert.ts` with `ConversionStatusType` union, `ConversionResult`, `ConversionStatus`, `ConvertParams` interfaces, and `isConversionComplete`, `isConversionSuccess`, `isConversionError` type-guard functions

## 3. Resource Types — Identify

- [ ] 3.1 Create `src/types/identify.ts` with `IdentificationStatusType` union, `DocumentTypeMatch`, `IdentificationResult`, `IdentificationStatus`, `IdentifyParams` interfaces, and `isIdentificationComplete`, `isIdentificationSuccess`, `isIdentificationError` type-guard functions

## 4. Resource Types — Document Type

- [ ] 4.1 Create `src/types/document-type.ts` with `DocumentType`, `ValidationErrorInfo`, `ValidationWarningInfo`, `ValidationResult`, `DocumentTypesListParams` interfaces, and `isValidationValid`, `hasValidationWarnings` type-guard functions

## 5. Resource Types — Step

- [ ] 5.1 Create `src/types/step.ts` with `StepExecutionStatusType` union, `StepExecutionStatus`, `StepsRunParams` interfaces, and `isStepExecutionComplete`, `isStepExecutionSuccess`, `isStepExecutionError` type-guard functions

## 6. Resource Types — Knowledge Base

- [ ] 6.1 Create `src/types/knowledge-base.ts` with `KnowledgeBase`, `KnowledgeBaseDocument`, `SearchResultItem`, `SearchResult`, `SyncResult` interfaces

## 7. Barrel and Exports

- [ ] 7.1 Create `src/types/index.ts` barrel file re-exporting all types and type-guard functions from all type modules
- [ ] 7.2 Update `src/index.ts` to re-export all types from `src/types/index.ts`

## 8. Validation

- [ ] 8.1 Run `npm run typecheck` and fix any errors
- [ ] 8.2 Run `npm run lint` and fix any errors
- [ ] 8.3 Run `npm run build` and verify ESM + CJS output succeeds
