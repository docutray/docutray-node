import {
  RETRY_INITIAL_DELAY,
  RETRY_MAX_DELAY,
  RETRY_EXPONENTIAL_BASE,
  RETRY_JITTER_MIN,
  RETRY_JITTER_MAX,
  RETRYABLE_STATUS_CODES,
} from '../lib/constants.js';
import type { RetryConfig } from './types.js';

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  initialDelay: RETRY_INITIAL_DELAY,
  maxDelay: RETRY_MAX_DELAY,
  exponentialBase: RETRY_EXPONENTIAL_BASE,
  jitterMin: RETRY_JITTER_MIN,
  jitterMax: RETRY_JITTER_MAX,
};

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
