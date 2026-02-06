/** Default base URL for the DocuTray API. */
export const DEFAULT_BASE_URL = 'https://api.docutray.com/v1';
/** Default request timeout in milliseconds (60 seconds). */
export const DEFAULT_TIMEOUT = 60_000;
/** Default maximum number of retry attempts. */
export const DEFAULT_MAX_RETRIES = 2;

/** Initial delay in milliseconds before the first retry. */
export const RETRY_INITIAL_DELAY = 500;
/** Maximum retry delay cap in milliseconds (8 seconds). */
export const RETRY_MAX_DELAY = 8_000;
/** Exponential base for retry delay calculation. */
export const RETRY_EXPONENTIAL_BASE = 2;
/** Minimum jitter factor (0.25 = 25%). */
export const RETRY_JITTER_MIN = 0.25;
/** Maximum jitter factor (0.5 = 50%). */
export const RETRY_JITTER_MAX = 0.5;

/** HTTP status codes that trigger an automatic retry. */
export const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504] as const;

/** Default polling interval in milliseconds for async operations (2 seconds). */
export const POLL_INTERVAL = 2_000;
/** Default polling timeout in milliseconds (5 minutes). */
export const POLL_TIMEOUT = 300_000;
