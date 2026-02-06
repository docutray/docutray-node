// Shared types
export type {
  Pagination,
  PaginatedResponse,
  ImageContentType,
  RateLimitInfo,
  QuotaExceededInfo,
  ErrorDetail,
} from './shared.js';

// Convert types
export type {
  ConversionStatusType,
  ConversionResult,
  ConversionStatus,
  ConvertParams,
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
  DocumentType,
  ValidationErrorInfo,
  ValidationWarningInfo,
  ValidationResult,
  DocumentTypesListParams,
} from './document-type.js';
export {
  isValidationValid,
  hasValidationWarnings,
} from './document-type.js';

// Step types
export type {
  StepExecutionStatusType,
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
  SearchResultItem,
  SearchResult,
  SyncResult,
} from './knowledge-base.js';
