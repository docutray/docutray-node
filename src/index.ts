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
