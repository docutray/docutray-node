/**
 * Severity of a validation issue. Warnings never make a document invalid.
 */
export type ValidationSeverity = 'error' | 'warning';

/**
 * Validation layer that produced an issue: the document type's JSON Schema
 * (`schema`) or its DSL business rules (`rule`).
 */
export type ValidationIssueSource = 'schema' | 'rule';

/**
 * A structured validation problem found in a document's data.
 *
 * Issue messages are written in Spanish by the API.
 */
export interface ValidationIssue {
  /**
   * Concrete path of the value that failed (e.g. `items[1].amount`), without
   * the `field.` prefix. An empty string identifies the document root.
   */
  field: string;
  /** Machine-readable issue code (e.g. `REQUIRED_FIELD`, `VALIDATION_ERROR`). */
  code: string;
  /** Human-readable description of the problem. */
  message: string;
  /** Whether the issue is blocking (`error`) or informational (`warning`). */
  severity: ValidationSeverity;
  /** Layer that produced the issue. */
  source: ValidationIssueSource;
  /** Name of the rule or operator that failed, when available. */
  rule?: string;
  /** The value that caused the issue, when available. */
  value?: unknown;
  /** Additional details about the issue. */
  details?: Record<string, unknown>;
}

/**
 * Detailed validation result of a conversion whose validation ran.
 */
export interface ValidationOutcome {
  /** Whether the data conforms. Warnings do not make it invalid. */
  valid: boolean;
  /** Blocking issues. */
  errors: ValidationIssue[];
  /** Non-blocking issues worth reviewing. */
  warnings: ValidationIssue[];
}

/**
 * Validation could not be completed, or no validation record exists for the
 * conversion. It does not mean the data is invalid; re-check it later with
 * `documentTypes.validate()`.
 */
export interface ValidationSystemFailure {
  status: 'error';
}

/**
 * Validation attached to a successful conversion.
 *
 * - {@link ValidationOutcome}: validation ran.
 * - {@link ValidationSystemFailure}: validation could not be completed.
 * - `null`: validation was skipped (the document type has no JSON Schema and no rules).
 *
 * Validation is informational: it never changes the conversion status. Use
 * {@link isValidationOutcome} and {@link isValidationSystemFailure} to narrow it.
 */
export type ConversionValidation = ValidationOutcome | ValidationSystemFailure | null;

/**
 * Error summary: the count and messages of the issues found.
 */
export interface ValidationErrorInfo {
  /** Number of errors found. */
  count: number;
  /** List of error messages. */
  messages: string[];
}

/**
 * Warning summary: the count and messages of the warnings found.
 */
export interface ValidationWarningInfo {
  /** Number of warnings found. */
  count: number;
  /** List of warning messages. */
  messages: string[];
}

/**
 * Summary validation format used by step executions and the `STEP_COMPLETED`
 * webhook.
 */
export interface ValidationSummary {
  /** Error summary. */
  errors: ValidationErrorInfo;
  /** Warning summary. */
  warnings: ValidationWarningInfo;
}

/**
 * A DSL compilation diagnostic, returned when rules fail to compile.
 *
 * Messages are written in Spanish by the API.
 */
export interface DSLDiagnostic {
  /** 1-based line of the problem. */
  line: number;
  /** 1-based column of the problem. */
  column: number;
  /** Parser diagnostic. */
  message: string;
}

/**
 * Returns `true` if the conversion validation ran, narrowing it to
 * {@link ValidationOutcome}.
 */
export function isValidationOutcome(
  validation: ConversionValidation | undefined,
): validation is ValidationOutcome {
  return typeof validation === 'object' && validation !== null && 'valid' in validation;
}

/**
 * Returns `true` if the conversion validation could not be completed,
 * narrowing it to {@link ValidationSystemFailure}.
 */
export function isValidationSystemFailure(
  validation: ConversionValidation | undefined,
): validation is ValidationSystemFailure {
  return typeof validation === 'object' && validation !== null && 'status' in validation
    && validation.status === 'error';
}
