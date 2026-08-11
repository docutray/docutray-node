## 1. Conversion spec types

- [x] 1.1 In `src/types/document-type.ts`, add the conversion-spec type family mirroring the API's shapes: `ConversionSpecColumn` (`header: string`, `jsonPath?: string`, `type?: 'data' | 'formula'`, `formula?: string`), `ConversionSpecSheet` (`name: string`, `columns: ConversionSpecColumn[]`), `LegacyConversionSpec` (`{ columns: ConversionSpecColumn[] }`), `MultiSheetConversionSpec` (`{ sheets: ConversionSpecSheet[] }`), and the union `ConversionSpec`. Include TSDoc on each, noting that `jsonPath` is optional (placeholder and formula columns).
- [x] 1.2 Add the exported type guard `isMultiSheetConversionSpec(spec: ConversionSpec): spec is MultiSheetConversionSpec`, returning `true` when `'sheets' in spec && !('columns' in spec)` — same discriminator the API uses. Place it beside `isValidationValid` / `hasValidationWarnings`.

## 2. Document type surface

- [x] 2.1 Add `conversionSpec?: ConversionSpec | null` to the `DocumentType` interface with TSDoc explaining that the list endpoint omits it and `null` means no stored spec.
- [x] 2.2 Add optional `conversionSpec?: ConversionSpec | null` to `DocumentTypeCreateParams` (TSDoc: omit to create without a spec).
- [x] 2.3 Add optional `conversionSpec?: ConversionSpec | null` to `DocumentTypeUpdateParams` (TSDoc: omit to leave unchanged, `null` to clear).

## 3. Public exports

- [x] 3.1 Re-export `ConversionSpec`, `ConversionSpecColumn`, `ConversionSpecSheet`, `LegacyConversionSpec`, `MultiSheetConversionSpec` and `isMultiSheetConversionSpec` from `src/types/index.ts`, following how `ConversionMode` is exported.
- [x] 3.2 Re-export the same names from `src/index.ts` so they are reachable from the package root.
- [x] 3.3 Run `npm run typecheck` and `npm run lint` to confirm the type layer compiles clean.

## 4. Tests

- [x] 4.1 Extend `tests/helpers/fixtures.ts`: give `mockDocumentType` a legacy `conversionSpec` and leave `mockDocumentTypeCreated` without one (verifying the property is genuinely optional).
- [x] 4.2 In `tests/resources/document-types.test.ts`, add a `get` test asserting `conversionSpec` is readable without a cast (assign to a `ConversionSpec | null | undefined` typed variable, as the existing `conversionMode` test does), plus a case where the API returns `conversionSpec: null`.
- [x] 4.3 Add a `create` test asserting a `conversionSpec` in params reaches the request body verbatim, and a test asserting an omitted `conversionSpec` produces a body without that key.
- [x] 4.4 Add an `update` test asserting the spec is sent verbatim, and one asserting `conversionSpec: null` is sent as `null` (clear semantics) rather than dropped.
- [x] 4.5 Add type-level assertions that the permissive cases compile: `{ columns: [] }`, a data column without `jsonPath`, a formula column with `formula` and no `jsonPath`, and a multi-sheet spec.
- [x] 4.6 Add a test that a `400` from the API on an invalid `conversionSpec` surfaces as `BadRequestError` with the API's message, and that the SDK performs no local validation.
- [x] 4.7 Add a test for `isMultiSheetConversionSpec` covering both branches and confirming narrowing (access `.sheets` / `.columns` inside each branch without a cast).
- [x] 4.8 Run `npm test` and confirm the full suite passes.

## 5. Documentation

- [x] 5.1 Document `conversionSpec` in the README document-types section: reading it from `get`, setting it on `create`/`update`, `null` to clear, and that invalid specs raise `BadRequestError`. Include a short legacy and multi-sheet example.
- [x] 5.2 Note in the README that `conversionSpec` requires an API deployment including docutray#972; older deployments omit it on read and ignore it on write.
