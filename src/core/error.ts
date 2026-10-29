import type { DSLDiagnostic } from '../types/validation.js';

/** @internal */
function parseNumericHeader(value: string | null): number | undefined {
  if (value === null) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * Base error class for all DocuTray SDK errors.
 */
export class DocuTrayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DocuTrayError';
  }
}

/**
 * Thrown when the SDK cannot establish a connection to the API.
 */
export class APIConnectionError extends DocuTrayError {
  /** The underlying error that caused the connection failure. */
  readonly cause: unknown;

  constructor(message: string, { cause }: { cause?: unknown } = {}) {
    super(message);
    this.name = 'APIConnectionError';
    this.cause = cause;
  }
}

/**
 * Thrown when a request exceeds the configured timeout or is aborted.
 */
export class APITimeoutError extends APIConnectionError {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'APITimeoutError';
  }
}

/**
 * Thrown when the API returns a non-success HTTP status code.
 *
 * Use the {@link APIError.generate} factory to create status-specific subclasses
 * (e.g. {@link BadRequestError}, {@link AuthenticationError}).
 */
export class APIError extends DocuTrayError {
  /** The HTTP status code from the API response. */
  readonly statusCode: number;
  /** The `x-request-id` header from the API response, if present. */
  readonly requestId: string | undefined;
  /** The parsed response body. */
  readonly body: unknown;
  /** The raw response headers. */
  readonly headers: Headers;

  constructor(
    statusCode: number,
    body: unknown,
    message: string,
    headers: Headers,
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.body = body;
    this.headers = headers;
    this.requestId = headers.get('x-request-id') ?? undefined;
  }

  /**
   * Creates a status-specific error subclass based on the HTTP status code.
   *
   * @param statusCode - The HTTP status code.
   * @param body - The parsed response body.
   * @param message - The error message.
   * @param headers - The response headers.
   * @returns A specific error subclass (e.g. {@link RateLimitError} for 429).
   */
  static generate(
    statusCode: number,
    body: unknown,
    message: string,
    headers: Headers,
  ): APIError {
    switch (statusCode) {
      case 400: {
        const diagnostics = parseDSLDiagnostics(body);
        if (diagnostics) {
          return new DSLValidationError(statusCode, body, message, headers, diagnostics);
        }
        return new BadRequestError(statusCode, body, message, headers);
      }
      case 401:
        return new AuthenticationError(statusCode, body, message, headers);
      case 403:
        return new PermissionDeniedError(statusCode, body, message, headers);
      case 404:
        return new NotFoundError(statusCode, body, message, headers);
      case 409:
        return new ConflictError(statusCode, body, message, headers);
      case 422:
        return new UnprocessableEntityError(statusCode, body, message, headers);
      case 429:
        return new RateLimitError(statusCode, body, message, headers);
      default:
        if (statusCode >= 500) {
          return new InternalServerError(statusCode, body, message, headers);
        }
        return new APIError(statusCode, body, message, headers);
    }
  }
}

/**
 * Thrown on HTTP 400 Bad Request responses.
 */
export class BadRequestError extends APIError {
  constructor(
    statusCode: number,
    body: unknown,
    message: string,
    headers: Headers,
  ) {
    super(statusCode, body, message, headers);
    this.name = 'BadRequestError';
  }
}

/**
 * Thrown on HTTP 400 responses when DSL rules fail to compile (on
 * `documentTypes.create()`, `update()` or a `validate()` dry-run).
 *
 * `diagnostics` lists each problem with its 1-based line and column. Messages
 * are written in Spanish by the API. Nothing is saved when this is thrown.
 *
 * @example
 * ```ts
 * try {
 *   await client.documentTypes.update(id, { dslRules });
 * } catch (error) {
 *   if (error instanceof DSLValidationError) {
 *     for (const d of error.diagnostics) console.log(`${d.line}:${d.column} ${d.message}`);
 *   }
 * }
 * ```
 */
export class DSLValidationError extends BadRequestError {
  /** Compilation problems, ordered by position. */
  readonly diagnostics: DSLDiagnostic[];

  constructor(
    statusCode: number,
    body: unknown,
    message: string,
    headers: Headers,
    diagnostics: DSLDiagnostic[],
  ) {
    super(statusCode, body, message, headers);
    this.name = 'DSLValidationError';
    this.diagnostics = diagnostics;
  }
}

/**
 * Returns the DSL diagnostics of a 400 body (`{ error, errors: [{ line, column, message }] }`),
 * or `undefined` when the body is not a DSL compilation error.
 *
 * @internal
 */
function parseDSLDiagnostics(body: unknown): DSLDiagnostic[] | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const errors = (body as Record<string, unknown>).errors;
  if (!Array.isArray(errors) || errors.length === 0) return undefined;
  const isDiagnostic = (entry: unknown): entry is DSLDiagnostic =>
    typeof entry === 'object' && entry !== null
    && typeof (entry as DSLDiagnostic).line === 'number'
    && typeof (entry as DSLDiagnostic).column === 'number'
    && typeof (entry as DSLDiagnostic).message === 'string';
  if (!errors.every(isDiagnostic)) return undefined;
  return errors.map(({ line, column, message }) => ({ line, column, message }));
}

/**
 * Thrown on HTTP 401 Unauthorized responses (invalid or missing API key).
 */
export class AuthenticationError extends APIError {
  constructor(
    statusCode: number,
    body: unknown,
    message: string,
    headers: Headers,
  ) {
    super(statusCode, body, message, headers);
    this.name = 'AuthenticationError';
  }
}

/**
 * Thrown on HTTP 403 Forbidden responses (insufficient permissions).
 */
export class PermissionDeniedError extends APIError {
  constructor(
    statusCode: number,
    body: unknown,
    message: string,
    headers: Headers,
  ) {
    super(statusCode, body, message, headers);
    this.name = 'PermissionDeniedError';
  }
}

/**
 * Thrown on HTTP 404 Not Found responses.
 */
export class NotFoundError extends APIError {
  constructor(
    statusCode: number,
    body: unknown,
    message: string,
    headers: Headers,
  ) {
    super(statusCode, body, message, headers);
    this.name = 'NotFoundError';
  }
}

/**
 * Thrown on HTTP 409 Conflict responses.
 */
export class ConflictError extends APIError {
  constructor(
    statusCode: number,
    body: unknown,
    message: string,
    headers: Headers,
  ) {
    super(statusCode, body, message, headers);
    this.name = 'ConflictError';
  }
}

/**
 * Thrown on HTTP 422 Unprocessable Entity responses (validation errors).
 */
export class UnprocessableEntityError extends APIError {
  constructor(
    statusCode: number,
    body: unknown,
    message: string,
    headers: Headers,
  ) {
    super(statusCode, body, message, headers);
    this.name = 'UnprocessableEntityError';
  }
}

/**
 * Thrown on HTTP 429 Too Many Requests responses.
 *
 * Includes rate-limit metadata extracted from response headers.
 */
export class RateLimitError extends APIError {
  /** Seconds to wait before retrying, from the `Retry-After` header. */
  readonly retryAfter: number | undefined;
  /** The type of rate limit that was hit (e.g. `requests`, `tokens`). */
  readonly limitType: string | undefined;
  /** The maximum number of requests allowed in the current window. */
  readonly limit: number | undefined;
  /** The number of requests remaining in the current window. */
  readonly remaining: number | undefined;
  /** The time when the current rate-limit window resets. */
  readonly resetTime: Date | undefined;

  constructor(
    statusCode: number,
    body: unknown,
    message: string,
    headers: Headers,
  ) {
    super(statusCode, body, message, headers);
    this.name = 'RateLimitError';

    this.retryAfter = parseNumericHeader(headers.get('retry-after'));
    this.limitType = headers.get('x-ratelimit-limit-type') ?? undefined;
    this.limit = parseNumericHeader(headers.get('x-ratelimit-limit'));
    this.remaining = parseNumericHeader(headers.get('x-ratelimit-remaining'));

    const resetSeconds = parseNumericHeader(headers.get('x-ratelimit-reset'));
    this.resetTime = resetSeconds !== undefined ? new Date(resetSeconds * 1000) : undefined;
  }
}

/**
 * Thrown on HTTP 5xx Internal Server Error responses.
 */
export class InternalServerError extends APIError {
  constructor(
    statusCode: number,
    body: unknown,
    message: string,
    headers: Headers,
  ) {
    super(statusCode, body, message, headers);
    this.name = 'InternalServerError';
  }
}
