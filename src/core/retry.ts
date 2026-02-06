import {
  RETRY_INITIAL_DELAY,
  RETRY_MAX_DELAY,
  RETRY_EXPONENTIAL_BASE,
  RETRY_JITTER_MIN,
  RETRY_JITTER_MAX,
  RETRYABLE_STATUS_CODES,
} from '../lib/constants.js';
import type { RetryConfig } from './types.js';

/** @internal */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  initialDelay: RETRY_INITIAL_DELAY,
  maxDelay: RETRY_MAX_DELAY,
  exponentialBase: RETRY_EXPONENTIAL_BASE,
  jitterMin: RETRY_JITTER_MIN,
  jitterMax: RETRY_JITTER_MAX,
};

/**
 * Calculates the delay before the next retry attempt using exponential backoff with jitter.
 *
 * If a `retryAfter` value is provided (from a `Retry-After` header), the calculated
 * delay will be at least that long.
 *
 * @param attempt - The zero-based retry attempt number.
 * @param config - Partial retry configuration overrides.
 * @param retryAfter - Optional `Retry-After` header value in seconds.
 * @returns The delay in milliseconds before the next retry.
 */
export function calculateRetryDelay(
  attempt: number,
  config: Partial<RetryConfig> = {},
  retryAfter?: number,
): number {
  const {
    initialDelay = DEFAULT_RETRY_CONFIG.initialDelay,
    maxDelay = DEFAULT_RETRY_CONFIG.maxDelay,
    exponentialBase = DEFAULT_RETRY_CONFIG.exponentialBase,
    jitterMin = DEFAULT_RETRY_CONFIG.jitterMin,
    jitterMax = DEFAULT_RETRY_CONFIG.jitterMax,
  } = config;

  const baseDelay = initialDelay * Math.pow(exponentialBase, attempt);
  const jitterFactor = jitterMin + Math.random() * (jitterMax - jitterMin);
  const delayWithJitter = baseDelay + baseDelay * jitterFactor;
  const cappedDelay = Math.min(delayWithJitter, maxDelay);

  if (retryAfter !== undefined) {
    const retryAfterMs = retryAfter * 1000;
    return Math.max(cappedDelay, retryAfterMs);
  }

  return cappedDelay;
}

/**
 * Determines whether a request should be retried.
 *
 * Returns `true` when the attempt count is below `maxRetries` and the failure
 * is either a connection error or a retryable HTTP status code (429, 5xx).
 *
 * @param attempt - The zero-based retry attempt number.
 * @param maxRetries - The maximum number of retries allowed.
 * @param statusCode - The HTTP status code, if available.
 * @param isConnectionError - Whether the failure was a connection error.
 * @returns `true` if the request should be retried.
 */
export function shouldRetry(
  attempt: number,
  maxRetries: number,
  statusCode?: number,
  isConnectionError: boolean = false,
): boolean {
  if (attempt >= maxRetries) {
    return false;
  }

  if (isConnectionError) {
    return true;
  }

  if (statusCode !== undefined) {
    return (RETRYABLE_STATUS_CODES as readonly number[]).includes(statusCode);
  }

  return false;
}
