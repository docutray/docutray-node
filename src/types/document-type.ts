/**
 * A document type definition from the API.
 */
export interface DocumentType {
  id: string;
  name: string;
  codeType: string;
  description: string | null;
  isPublic: boolean;
  isDraft: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  schema: Record<string, unknown> | null;
}

/**
 * Validation error details.
 */
export interface ValidationErrorInfo {
  count: number;
  messages: string[];
}

/**
 * Validation warning details.
 */
export interface ValidationWarningInfo {
  count: number;
  messages: string[];
}

/**
 * Result of validating a document type schema.
 */
export interface ValidationResult {
  errors: ValidationErrorInfo;
  warnings: ValidationWarningInfo;
}

/**
 * Parameters for listing document types.
 */
export interface DocumentTypesListParams {
  page?: number;
  limit?: number;
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
