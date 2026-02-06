export class DocuTrayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DocuTrayError';
  }
}

export class APIConnectionError extends DocuTrayError {
  readonly cause: unknown;

  constructor(message: string, { cause }: { cause?: unknown } = {}) {
    super(message);
    this.name = 'APIConnectionError';
    this.cause = cause;
  }
}

export class APITimeoutError extends APIConnectionError {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'APITimeoutError';
  }
}

export class APIError extends DocuTrayError {
  readonly statusCode: number;
  readonly requestId: string | undefined;
  readonly body: unknown;
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

  static generate(
    statusCode: number,
    body: unknown,
    message: string,
    headers: Headers,
  ): APIError {
    switch (statusCode) {
      case 400:
        return new BadRequestError(statusCode, body, message, headers);
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

export class RateLimitError extends APIError {
  readonly retryAfter: number | undefined;
  readonly limitType: string | undefined;
  readonly limit: number | undefined;
  readonly remaining: number | undefined;
  readonly resetTime: Date | undefined;

  constructor(
    statusCode: number,
    body: unknown,
    message: string,
    headers: Headers,
  ) {
    super(statusCode, body, message, headers);
    this.name = 'RateLimitError';

    const retryAfterHeader = headers.get('retry-after');
    this.retryAfter = retryAfterHeader ? Number(retryAfterHeader) : undefined;

    this.limitType = headers.get('x-ratelimit-limit-type') ?? undefined;

    const limitHeader = headers.get('x-ratelimit-limit');
    this.limit = limitHeader ? Number(limitHeader) : undefined;

    const remainingHeader = headers.get('x-ratelimit-remaining');
    this.remaining = remainingHeader ? Number(remainingHeader) : undefined;

    const resetHeader = headers.get('x-ratelimit-reset');
    this.resetTime = resetHeader ? new Date(Number(resetHeader) * 1000) : undefined;
  }
}

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
