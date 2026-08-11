## Context

See proposal.md — Why. Relevant current state:

- `src/types/document-type.ts` already models the document-type surface; `conversionMode` was added the same way in #22 (commit `527f7c6`), which is the precedent this change follows.
- The Resource layer (`src/resources/document-types.ts`) forwards create/update params to `_client.post/put` verbatim and unwraps the `{ data }` envelope on `get`. No resource change is needed — the API contract widening is entirely a Types-layer concern.
- The API side (docutray#972) validates `conversionSpec` structurally in the API-key write paths and returns `400` with a Spanish message when it is invalid. `null` clears the spec on `PUT` and creates without one on `POST`.
- The API's own types live in `apps/web/src/lib/json-to-csv.ts` (`ColumnSpec`, `SheetSpec`, `LegacyConversionSpec`, `MultiSheetConversionSpec`) — the shapes mirrored here.
- The main spec `openspec/specs/document-type-types/spec.md` has drifted from the code: it still says `schema` (renamed to `jsonSchema` in `ad82d94`) and omits `status` / `conversionMode`.

## Goals / Non-Goals

**Goals:**

- Read and write `conversionSpec` through the typed surface with no casts.
- Types precise enough that a hand-written spec literal is checked, and permissive enough that every spec the API accepts type-checks.
- Round-trip safety: a `DocumentType` returned by `get` can be passed straight back into `update`.

**Non-Goals:**

- Client-side structural validation of specs. The API is the single source of truth for validity; duplicating `validateConversionSpec` in the SDK would drift and reject specs the API accepts.
- Helpers for building or executing specs (JSON → CSV conversion). The SDK transports the spec; it does not run the export.
- Changes to the Resource or Core layers, or to the Python SDK.

## Decisions

**1. Structured discriminated union over `Record<string, unknown>`.**
`conversionSpec` is typed as `ConversionSpec = LegacyConversionSpec | MultiSheetConversionSpec`, mirroring the API's own types rather than the loose shape used for `jsonSchema`. Rationale: unlike a JSON Schema (open-ended, user-defined), a conversion spec has a small fixed shape the API validates, so the types catch real mistakes (`path` instead of `jsonPath`, columns at the top level of a multi-sheet spec) at compile time. Alternative considered: `Record<string, unknown> | null`, matching `jsonSchema` — rejected because it gives consumers nothing beyond what a cast already gives them, which is the problem this change exists to fix.

**2. Optional fields kept exactly as permissive as the API.**
`jsonPath` is optional on `ConversionSpecColumn` even for data columns: the API deliberately accepts placeholder columns without a path (they export as empty cells) and specs like that already exist, saved from the UI. `columns: []` is likewise valid. The types must not be stricter than `validateConversionSpec` or they would block valid round-trips.

**3. `conversionSpec` is optional on `DocumentType`, nullable everywhere.**
`conversionSpec?: ConversionSpec | null` — optional because the list endpoint omits the field and older API deployments do too; `null` because `GET` returns an explicit `null` when no spec is stored. This is the same shape as `conversionMode?`, and it keeps `get` → `update` round-trips assignable without a cast: `update(id, { conversionSpec: dt.conversionSpec ?? null })` type-checks.

**4. Params accept `ConversionSpec | null`, not `undefined`-as-clear.**
Omitting the key preserves the stored spec; `null` clears it. This mirrors the API exactly and avoids inventing SDK-only semantics. It does mean a caller spreading an object with `conversionSpec: undefined` sends nothing — which is the correct "leave unchanged" behavior, since `JSON.stringify` drops `undefined` keys.

**5. Ship a `isMultiSheetConversionSpec` type guard.**
A bare union is awkward to consume without narrowing, and `'sheets' in spec` is the discriminator the API itself uses (`isMultiSheetConversionSpec` in `json-to-csv.ts`). Exporting a guard keeps consumers off ad-hoc `in` checks and matches the existing `isValidationValid` / `hasValidationWarnings` precedent in this same module.

**6. Correct the drifted `DocumentType` requirement while touching it.**
The delta spec's MODIFIED block restates the requirement against the current code (`jsonSchema`, `status`, `conversionMode`) rather than copying the stale `schema` wording. MODIFIED requires full updated content, so leaving the drift in would re-assert a requirement the code already violates.

## Risks / Trade-offs

- **A future API-side spec field would fail to type-check in SDK consumers** → the union is a closed shape; new column/sheet fields need an SDK release. Accepted: the same is already true of `conversionMode`, and the field set has been stable. Consumers blocked by this can cast at the call site as an escape hatch.
- **Types could reject a spec the API accepts** → mitigated by mirroring `ColumnSpec`/`SheetSpec` field-for-field, keeping `jsonPath` optional, and asserting the permissive cases (empty `columns`, path-less column, formula column) as tests derived from the spec scenarios.
- **Consumers on an API deployment without docutray#972** → writes are silently ignored and reads return `undefined`, not an error. The optional property means no runtime break; the README notes the deployment requirement.
- **Spec-drift correction widens the diff** → confined to the requirement text; no code change beyond this change's scope.

## Migration Plan

Purely additive; no migration. Ships as a minor version bump (new exported types + helper). Rollback is a revert — no consumer can depend on removal.

## Open Questions

None.
