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
  /** The extraction schema definition. */
  schema: Record<string, unknown> | null;
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
  conversionMode?: 'json' | 'toon' | 'multi_prompt';
  /** Whether to preserve property ordering in extraction output. */
  keepPropertyOrdering?: boolean;
  /** Whether the document type is publicly available. */
  isPublic?: boolean;
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
  conversionMode?: 'json' | 'toon' | 'multi_prompt';
  /** Whether to preserve property ordering. */
  keepPropertyOrdering?: boolean;
  /** Whether the document type is publicly available. */
  isPublic?: boolean;
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
