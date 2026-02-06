// Version
export { VERSION } from './lib/version.js';

// Constants
export {
  DEFAULT_BASE_URL,
  DEFAULT_TIMEOUT,
  DEFAULT_MAX_RETRIES,
  RETRY_INITIAL_DELAY,
  RETRY_MAX_DELAY,
  RETRY_EXPONENTIAL_BASE,
  RETRY_JITTER_MIN,
  RETRY_JITTER_MAX,
  RETRYABLE_STATUS_CODES,
  POLL_INTERVAL,
  POLL_TIMEOUT,
} from './lib/constants.js';

// Utilities
export { readEnv, sleep, maskApiKey } from './lib/utils.js';

// File handling
export {
  detectContentType,
  prepareFileUpload,
  prepareUrlUpload,
  prepareBase64Upload,
} from './lib/files.js';
export type {
  FileUpload,
  UrlUploadBody,
  Base64UploadBody,
} from './lib/files.js';

// Types
export type {
  ClientOptions,
  RequestOptions,
  RetryConfig,
  FileInput,
  FileWithMetadata,
} from './core/types.js';

// Errors
export {
  DocuTrayError,
  APIConnectionError,
  APITimeoutError,
  APIError,
  BadRequestError,
  AuthenticationError,
  PermissionDeniedError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  RateLimitError,
  InternalServerError,
} from './core/error.js';

// Core
export { APIClient } from './core/api-client.js';
export { RawResponse } from './core/raw-response.js';
export { Page } from './core/pagination.js';
export type { PageResponse, PageOptions } from './core/pagination.js';
export { waitForCompletion } from './core/polling.js';
export type { PollOptions } from './core/polling.js';
export { calculateRetryDelay, shouldRetry } from './core/retry.js';

// Resource base
export { APIResource } from './resource.js';

// Resources
export {
  Convert,
  Identify,
  DocumentTypes,
  Steps,
  KnowledgeBases,
  KnowledgeBaseDocuments,
} from './resources/index.js';
export type {
  KnowledgeBaseCreateParams,
  KnowledgeBaseUpdateParams,
  KnowledgeBaseSearchParams,
  KnowledgeBaseListParams,
  KBDocumentCreateParams,
  KBDocumentUpdateParams,
  KBDocumentListParams,
} from './resources/index.js';

// Resource types
export type {
  Pagination,
  PaginatedResponse,
  ImageContentType,
  RateLimitInfo,
  QuotaExceededInfo,
  ErrorDetail,
  ConversionStatusType,
  ConversionResult,
  ConversionStatus,
  ConvertParams,
  IdentificationStatusType,
  DocumentTypeMatch,
  IdentificationResult,
  IdentificationStatus,
  IdentifyParams,
  DocumentType,
  ValidationErrorInfo,
  ValidationWarningInfo,
  ValidationResult,
  DocumentTypesListParams,
  StepExecutionStatusType,
  StepExecutionStatus,
  StepsRunParams,
  KnowledgeBase,
  KnowledgeBaseDocument,
  SearchResultItem,
  SearchResult,
  SyncResult,
} from './types/index.js';
export {
  isConversionComplete,
  isConversionSuccess,
  isConversionError,
  isIdentificationComplete,
  isIdentificationSuccess,
  isIdentificationError,
  isValidationValid,
  hasValidationWarnings,
  isStepExecutionComplete,
  isStepExecutionSuccess,
  isStepExecutionError,
} from './types/index.js';
