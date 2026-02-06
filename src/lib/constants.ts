export const DEFAULT_BASE_URL = 'https://api.docutray.com/v1';
export const DEFAULT_TIMEOUT = 60_000;
export const DEFAULT_MAX_RETRIES = 2;

export const RETRY_INITIAL_DELAY = 500;
export const RETRY_MAX_DELAY = 8_000;
export const RETRY_EXPONENTIAL_BASE = 2;
export const RETRY_JITTER_MIN = 0.25;
export const RETRY_JITTER_MAX = 0.5;

export const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504] as const;

export const POLL_INTERVAL = 2_000;
export const POLL_TIMEOUT = 300_000;
