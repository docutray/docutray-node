import { describe, it, expect } from 'vitest';
import {
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
} from '../../src/core/error.js';

describe('DocuTrayError', () => {
  it('extends Error', () => {
    const error = new DocuTrayError('test');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DocuTrayError);
    expect(error.message).toBe('test');
    expect(error.name).toBe('DocuTrayError');
  });
});

describe('APIConnectionError', () => {
  it('extends DocuTrayError', () => {
    const cause = new Error('ECONNREFUSED');
    const error = new APIConnectionError('Connection failed', { cause });
    expect(error).toBeInstanceOf(DocuTrayError);
    expect(error).toBeInstanceOf(APIConnectionError);
    expect(error.cause).toBe(cause);
  });
});

describe('APITimeoutError', () => {
  it('extends APIConnectionError', () => {
    const error = new APITimeoutError('timed out');
    expect(error).toBeInstanceOf(APIConnectionError);
    expect(error).toBeInstanceOf(APITimeoutError);
    expect(error.name).toBe('APITimeoutError');
  });
});

describe('APIError', () => {
  const headers = new Headers({ 'x-request-id': 'req_123' });

  it('stores status code, body, headers, and requestId', () => {
    const error = new APIError(500, { error: 'fail' }, 'Server error', headers);
    expect(error.statusCode).toBe(500);
    expect(error.body).toEqual({ error: 'fail' });
    expect(error.requestId).toBe('req_123');
    expect(error.headers).toBe(headers);
    expect(error).toBeInstanceOf(DocuTrayError);
  });

  it('requestId is undefined when header missing', () => {
    const error = new APIError(500, null, 'error', new Headers());
    expect(error.requestId).toBeUndefined();
  });
});

describe('APIError.generate', () => {
  const headers = new Headers();

  it.each([
    [400, BadRequestError, 'BadRequestError'],
    [401, AuthenticationError, 'AuthenticationError'],
    [403, PermissionDeniedError, 'PermissionDeniedError'],
    [404, NotFoundError, 'NotFoundError'],
    [409, ConflictError, 'ConflictError'],
    [422, UnprocessableEntityError, 'UnprocessableEntityError'],
    [429, RateLimitError, 'RateLimitError'],
    [500, InternalServerError, 'InternalServerError'],
    [502, InternalServerError, 'InternalServerError'],
    [503, InternalServerError, 'InternalServerError'],
    [504, InternalServerError, 'InternalServerError'],
  ] as const)('status %i returns %s', (status, ErrorClass, name) => {
    const error = APIError.generate(status, {}, 'msg', headers);
    expect(error).toBeInstanceOf(ErrorClass);
    expect(error).toBeInstanceOf(APIError);
    expect(error.name).toBe(name);
  });

  it('unknown status code returns generic APIError', () => {
    const error = APIError.generate(418, {}, 'Teapot', headers);
    expect(error).toBeInstanceOf(APIError);
    expect(error.name).toBe('APIError');
    expect(error.statusCode).toBe(418);
  });
});

describe('RateLimitError', () => {
  it('extracts rate limit headers', () => {
    const headers = new Headers({
      'retry-after': '30',
      'x-ratelimit-limit-type': 'requests',
      'x-ratelimit-limit': '100',
      'x-ratelimit-remaining': '0',
      'x-ratelimit-reset': '1700000000',
    });
    const error = new RateLimitError(429, {}, 'Rate limited', headers);

    expect(error.retryAfter).toBe(30);
    expect(error.limitType).toBe('requests');
    expect(error.limit).toBe(100);
    expect(error.remaining).toBe(0);
    expect(error.resetTime).toEqual(new Date(1700000000 * 1000));
  });

  it('handles missing rate limit headers', () => {
    const error = new RateLimitError(429, {}, 'Rate limited', new Headers());
    expect(error.retryAfter).toBeUndefined();
    expect(error.limitType).toBeUndefined();
    expect(error.limit).toBeUndefined();
    expect(error.remaining).toBeUndefined();
    expect(error.resetTime).toBeUndefined();
  });

  it('handles non-numeric rate limit headers as undefined', () => {
    const headers = new Headers({
      'retry-after': 'abc',
      'x-ratelimit-limit': 'invalid',
      'x-ratelimit-remaining': 'n/a',
      'x-ratelimit-reset': 'not-a-number',
    });
    const error = new RateLimitError(429, {}, 'Rate limited', headers);
    expect(error.retryAfter).toBeUndefined();
    expect(error.limit).toBeUndefined();
    expect(error.remaining).toBeUndefined();
    expect(error.resetTime).toBeUndefined();
  });
});
