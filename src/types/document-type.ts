/**
 * Conversion mode used when extracting from a document type.
 */
export type ConversionMode = 'json' | 'toon' | 'multi_prompt';

/**
 * A single column in a conversion spec.
 *
 * `jsonPath` is optional: formula columns carry a `formula` instead, and the API
 * also accepts placeholder data columns with no path (they export as empty cells).
 */
export interface ConversionSpecColumn {
  /** Column header text in the exported CSV/Excel file. */
  header: string;
  /** JSONPath expression selecting the value for this column. */
  jsonPath?: string;
  /** Column kind. Defaults to `'data'` when omitted. */
  type?: 'data' | 'formula';
  /** Excel formula, used only when `type` is `'formula'`. */
  formula?: string;
}

/**
 * A single sheet in a multi-sheet conversion spec.
 */
export interface ConversionSpecSheet {
  /** Sheet name. Must be unique within the spec. */
  name: string;
  /** Columns exported in this sheet. */
  columns: ConversionSpecColumn[];
}

/**
 * Legacy (single-table) conversion spec.
 */
export interface LegacyConversionSpec {
  /** Columns exported to the single output table. An empty array is valid. */
  columns: ConversionSpecColumn[];
}

/**
 * Multi-sheet conversion spec.
 */
export interface MultiSheetConversionSpec {
  /** Sheets exported to the output workbook. */
  sheets: ConversionSpecSheet[];
}

/**
 * Mapping from extracted JSON to CSV/Excel columns, used by tray export.
 *
 * Either the legacy single-table format (top-level `columns`) or the
 * multi-sheet format (top-level `sheets`). Use
 * {@link isMultiSheetConversionSpec} to narrow the union.
 */
export type ConversionSpec = LegacyConversionSpec | MultiSheetConversionSpec;

/**
 * A document type definition from the API.
 */
export interface DocumentType {
  /** Unique identifier. */
  id: string;
  /** Human-readable name. */
  name: string;
  /** The document type code used in API calls. */
  codeType: string;
  /** Optional description of the document type. */
  description: string | null;
  /** Whether this document type is publicly available. */
  isPublic: boolean;
  /** Whether this document type is in draft mode. */
  isDraft: boolean;
  /** The current status of the document type (e.g. "active", "draft"). */
  status: string;
  /** ISO 8601 creation timestamp. */
  createdAt: string | null;
  /** ISO 8601 last-updated timestamp. */
  updatedAt: string | null;
  /** The JSON Schema defining the extraction structure. */
  jsonSchema: Record<string, unknown> | null;
  /** Conversion mode used when extracting from this document type. */
  conversionMode?: ConversionMode;
  /**
   * Mapping from extracted JSON to CSV/Excel columns for tray export.
   *
   * `null` when no spec is stored. Absent from list responses, which only
   * return it on the single-document-type endpoints.
   */
  conversionSpec?: ConversionSpec | null;
}

/**
 * Validation error details.
 */
export interface ValidationErrorInfo {
  /** Number of errors found. */
  count: number;
  /** List of error messages. */
  messages: string[];
}

/**
 * Validation warning details.
 */
export interface ValidationWarningInfo {
  /** Number of warnings found. */
  count: number;
  /** List of warning messages. */
  messages: string[];
}

/**
 * Result of validating a document type schema.
 */
export interface ValidationResult {
  /** Validation errors that prevent the schema from being used. */
  errors: ValidationErrorInfo;
  /** Validation warnings that may indicate potential issues. */
  warnings: ValidationWarningInfo;
}

/**
 * Parameters for creating a new document type.
 */
export interface DocumentTypeCreateParams {
  /** Human-readable name (minLength: 2). */
  name: string;
  /** Unique code identifier (pattern: ^[a-z0-9_]+$). Cannot be changed after creation. */
  codeType: string;
  /** Description of the document type (minLength: 1). */
  description: string;
  /** The JSON Schema defining the extraction structure. */
  jsonSchema: Record<string, unknown>;
  /** Whether the document type is in draft mode. Defaults to true. */
  isDraft?: boolean;
  /** Hints to guide the extraction prompt. */
  promptHints?: string;
  /** Hints to guide the identification prompt. */
  identifyPromptHints?: string;
  /** The conversion mode to use. */
  conversionMode?: ConversionMode;
  /** Whether to preserve property ordering in extraction output. */
  keepPropertyOrdering?: boolean;
  /** Whether the document type is publicly available. */
  isPublic?: boolean;
  /**
   * Mapping from extracted JSON to CSV/Excel columns for tray export.
   *
   * Omit (or pass `null`) to create the document type without a spec. A
   * structurally invalid spec is rejected by the API with a `BadRequestError`.
   */
  conversionSpec?: ConversionSpec | null;
}

/**
 * Parameters for updating an existing document type.
 */
export interface DocumentTypeUpdateParams {
  /** Updated name. */
  name?: string;
  /** Updated description. */
  description?: string;
  /** Updated JSON Schema. */
  jsonSchema?: Record<string, unknown>;
  /** Whether the document type is in draft mode. */
  isDraft?: boolean;
  /** Updated extraction prompt hints. */
  promptHints?: string;
  /** Updated identification prompt hints. */
  identifyPromptHints?: string;
  /** Updated conversion mode. */
  conversionMode?: ConversionMode;
  /** Whether to preserve property ordering. */
  keepPropertyOrdering?: boolean;
  /** Whether the document type is publicly available. */
  isPublic?: boolean;
  /**
   * Mapping from extracted JSON to CSV/Excel columns for tray export.
   *
   * Omit to leave the stored spec unchanged, or pass `null` to clear it. A
   * structurally invalid spec is rejected by the API with a `BadRequestError`.
   *
   * When forwarding a spec read from a {@link DocumentType}, pass it through
   * as-is (`{ conversionSpec: docType.conversionSpec }`) — `undefined` is
   * dropped from the request body, leaving the stored spec untouched. Do NOT
   * normalize with `?? null`: document types from `list()` (and from API
   * deployments predating the field) have no `conversionSpec`, so `?? null`
   * would turn "not loaded" into "clear the stored spec".
   */
  conversionSpec?: ConversionSpec | null;
}

/**
 * Parameters for listing document types.
 */
export interface DocumentTypesListParams {
  /** Page number (1-based). */
  page?: number;
  /** Maximum items per page. */
  limit?: number;
  /** Search query to filter document types by name. */
  search?: string;
}

/**
 * Returns `true` if the validation result has no errors.
 */
export function isValidationValid(result: ValidationResult): boolean {
  return result.errors.count === 0;
}

/**
 * Returns `true` if the validation result has warnings.
 */
export function hasValidationWarnings(result: ValidationResult): boolean {
  return result.warnings.count > 0;
}

/**
 * Returns `true` if the conversion spec uses the multi-sheet format, narrowing
 * it to {@link MultiSheetConversionSpec}.
 *
 * Accepts `null` and `undefined` (returning `false`) so it can be called
 * directly on `DocumentType.conversionSpec`, which is absent on list responses.
 */
export function isMultiSheetConversionSpec(
  spec: ConversionSpec | null | undefined,
): spec is MultiSheetConversionSpec {
  return typeof spec === 'object' && spec !== null && 'sheets' in spec;
}
