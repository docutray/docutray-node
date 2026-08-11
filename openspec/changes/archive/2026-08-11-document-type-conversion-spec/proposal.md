## Why

The DocuTray API now exposes `conversionSpec` (the JSON → CSV/Excel column mapping used by tray export) on `GET`, `POST` and `PUT /api/document-types` ([docutray#972](https://github.com/docutray/docutray/pull/972)). The Node SDK's `DocumentType`, `DocumentTypeCreateParams` and `DocumentTypeUpdateParams` types do not know about the field, so consumers (docutray-cli, downstream apps) cannot read it without casting, and cannot send it at all through the typed surface — the field would be dropped by `Omit`-free but untyped param objects and flagged by `tsc`.

## What Changes

- Add `conversionSpec` to the `DocumentType` response interface (`ConversionSpec | null`, optional because the list endpoint does not return it).
- Add optional `conversionSpec` to `DocumentTypeCreateParams` and `DocumentTypeUpdateParams`, accepting `null` to mean "create without spec" / "clear the stored spec".
- Introduce the conversion-spec type family mirroring the API contract: `ConversionSpecColumn`, `ConversionSpecSheet`, `LegacyConversionSpec` (`{ columns }`), `MultiSheetConversionSpec` (`{ sheets }`), and the `ConversionSpec` union.
- Export a narrowing helper `isMultiSheetConversionSpec(spec)` so consumers can discriminate the two formats, following the existing `isValidationValid` / `hasValidationWarnings` helper pattern.
- Re-export all new types and the helper from the public surface (`src/types/index.ts`, `src/index.ts`).
- Document `conversionSpec` in the README document-types section, including the `null`-clears semantics and that structurally invalid specs are rejected by the API with a `400` (`BadRequestError`).

No changes to the Resource or Core layers: the `DocumentTypes` resource already passes create/update params through verbatim and returns the parsed `data` envelope, so widening the types is sufficient.

## Capabilities

### New Capabilities

None — this extends an existing type capability.

### Modified Capabilities

- `document-type-types`: `DocumentType` gains a `conversionSpec` property; `DocumentTypeCreateParams` and `DocumentTypeUpdateParams` gain an optional nullable `conversionSpec`; new requirement for the `ConversionSpec` type family and the `isMultiSheetConversionSpec` type guard.

## Impact

- **Code**: `src/types/document-type.ts` (new types + three interfaces extended), `src/types/index.ts`, `src/index.ts` (re-exports).
- **Tests**: `tests/helpers/fixtures.ts` (fixture gains a `conversionSpec`), `tests/resources/document-types.test.ts` (round-trip get/create/update coverage, `null` clearing, `400` on invalid spec).
- **Docs**: `README.md` document-types section.
- **API dependency**: requires the DocuTray API deployment that includes docutray#972. Older deployments silently ignore `conversionSpec` on write and omit it on read — the optional property keeps the SDK compatible with both.
- **Compatibility**: purely additive, no breaking changes. Consumers currently casting the result to read `conversionSpec` keep working.
