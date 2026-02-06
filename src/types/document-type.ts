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
