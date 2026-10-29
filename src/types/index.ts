// Shared types
export type {
  Pagination,
  PaginatedResponse,
  ImageContentType,
  RateLimitInfo,
  QuotaExceededInfo,
  ErrorDetail,
} from './shared.js';

// Validation types
export type {
  ValidationSeverity,
  ValidationIssueSource,
  ValidationIssue,
  ValidationOutcome,
  ValidationSystemFailure,
  ConversionValidation,
  ValidationErrorInfo,
  ValidationWarningInfo,
  ValidationSummary,
  DSLDiagnostic,
} from './validation.js';
export {
  isValidationOutcome,
  isValidationSystemFailure,
} from './validation.js';

// Webhook types
export type {
  WebhookEventType,
  ConversionWebhookPayload,
  IdentificationWebhookPayload,
  StepWebhookPayload,
} from './webhook.js';

// Convert types
export type {
  ConversionStatusType,
  ConversionResult,
  ConversionStatus,
  ConvertParams,
  FieldLocations,
  FieldLocation,
  FieldLocationBox,
  FieldLocationsPage,
} from './convert.js';
export {
  isConversionComplete,
  isConversionSuccess,
  isConversionError,
} from './convert.js';

// Identify types
export type {
  IdentificationStatusType,
  DocumentTypeMatch,
  IdentificationResult,
  IdentificationEnqueued,
  IdentificationStatus,
  IdentifyParams,
} from './identify.js';
export {
  isIdentificationComplete,
  isIdentificationSuccess,
  isIdentificationError,
} from './identify.js';

// Document type types
export type {
  ConversionMode,
  ConversionSpec,
  ConversionSpecColumn,
  ConversionSpecSheet,
  LegacyConversionSpec,
  MultiSheetConversionSpec,
  DocumentType,
  DocumentTypeCreateParams,
  DocumentTypeUpdateParams,
  DocumentTypeValidateParams,
  ValidationResult,
  DocumentTypesListParams,
} from './document-type.js';
export {
  isValidationValid,
  hasValidationWarnings,
  isMultiSheetConversionSpec,
} from './document-type.js';

// Step types
export type {
  StepExecutionStatusType,
  StepExecutionEnqueued,
  StepExecutionError,
  StepExecutionStatus,
  StepsRunParams,
} from './step.js';
export {
  isStepExecutionComplete,
  isStepExecutionSuccess,
  isStepExecutionError,
} from './step.js';

// Knowledge base types
export type {
  KnowledgeBase,
  KnowledgeBaseDocument,
  EmbeddingStatus,
  SearchResultItem,
  SearchResult,
  SyncResult,
} from './knowledge-base.js';
