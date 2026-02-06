import { describe, it, expect } from 'vitest';
import { calculateRetryDelay, shouldRetry } from '../../src/core/retry.js';

describe('calculateRetryDelay', () => {
  it('first attempt delay is approximately 500ms with jitter', () => {
    const delays = Array.from({ length: 100 }, () => calculateRetryDelay(0));
    for (const delay of delays) {
      // 500 * 1.25 = 625, 500 * 1.5 = 750
      expect(delay).toBeGreaterThanOrEqual(625);
      expect(delay).toBeLessThanOrEqual(750);
    }
  });

  it('second attempt delay is approximately 1000ms with jitter', () => {
    const delays = Array.from({ length: 100 }, () => calculateRetryDelay(1));
    for (const delay of delays) {
      // 1000 * 1.25 = 1250, 1000 * 1.5 = 1500
      expect(delay).toBeGreaterThanOrEqual(1250);
      expect(delay).toBeLessThanOrEqual(1500);
    }
  });

  it('delay is capped at maxDelay (8000ms)', () => {
    const delays = Array.from({ length: 100 }, () => calculateRetryDelay(10));
    for (const delay of delays) {
      expect(delay).toBeLessThanOrEqual(8000);
    }
  });

  it('jitter adds between 25% and 50% of base delay', () => {
    const delays = Array.from({ length: 200 }, () => calculateRetryDelay(0));
    const min = Math.min(...delays);
    const max = Math.max(...delays);
    // Base is 500. With jitter: [625, 750]
    expect(min).toBeGreaterThanOrEqual(625);
    expect(max).toBeLessThanOrEqual(750);
  });

  it('respects Retry-After when larger than calculated delay', () => {
    const delay = calculateRetryDelay(0, {}, 5);
    // Retry-After = 5s = 5000ms, which is larger than ~625-750ms
    expect(delay).toBeGreaterThanOrEqual(5000);
  });

  it('uses calculated delay when larger than Retry-After', () => {
    const delay = calculateRetryDelay(0, {}, 0.1);
    // Retry-After = 100ms, calculated is ~625-750ms
    expect(delay).toBeGreaterThanOrEqual(625);
  });

  it('accepts custom retry config', () => {
    const delay = calculateRetryDelay(0, {
      initialDelay: 100,
      maxDelay: 200,
      exponentialBase: 2,
      jitterMin: 0,
      jitterMax: 0,
    });
    // 100 * 2^0 + 0 jitter = 100
    expect(delay).toBe(100);
  });
});

describe('shouldRetry', () => {
  it('returns true for retryable status codes within limit', () => {
    expect(shouldRetry(0, 2, 429)).toBe(true);
    expect(shouldRetry(0, 2, 500)).toBe(true);
    expect(shouldRetry(0, 2, 502)).toBe(true);
    expect(shouldRetry(0, 2, 503)).toBe(true);
    expect(shouldRetry(0, 2, 504)).toBe(true);
  });

  it('returns false for non-retryable status codes', () => {
    expect(shouldRetry(0, 2, 400)).toBe(false);
    expect(shouldRetry(0, 2, 401)).toBe(false);
    expect(shouldRetry(0, 2, 403)).toBe(false);
    expect(shouldRetry(0, 2, 404)).toBe(false);
    expect(shouldRetry(0, 2, 422)).toBe(false);
  });

  it('returns false when attempts exceed maxRetries', () => {
    expect(shouldRetry(2, 2, 500)).toBe(false);
    expect(shouldRetry(3, 2, 500)).toBe(false);
  });

  it('returns true for connection errors within limit', () => {
    expect(shouldRetry(0, 2, undefined, true)).toBe(true);
    expect(shouldRetry(1, 2, undefined, true)).toBe(true);
  });

  it('returns false for connection errors at limit', () => {
    expect(shouldRetry(2, 2, undefined, true)).toBe(false);
  });

  it('returns false with no status code and no connection error', () => {
    expect(shouldRetry(0, 2)).toBe(false);
  });
});
