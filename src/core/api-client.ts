import { VERSION } from '../lib/version.js';
import {
  DEFAULT_BASE_URL,
  DEFAULT_TIMEOUT,
  DEFAULT_MAX_RETRIES,
} from '../lib/constants.js';
import { sleep } from '../lib/utils.js';
import type { ClientOptions, RequestOptions } from './types.js';
import {
  APIError,
  APIConnectionError,
  APITimeoutError,
} from './error.js';
import { calculateRetryDelay, shouldRetry } from './retry.js';
import { RawResponse } from './raw-response.js';

export class APIClient {
  readonly apiKey: string;
  readonly baseURL: string;
  readonly timeout: number;
  readonly maxRetries: number;
  private readonly _fetch: typeof globalThis.fetch;

  constructor(options: ClientOptions) {
    this.apiKey = options.apiKey;
    this.baseURL = (options.baseURL ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this._fetch = options.fetch ?? globalThis.fetch;
  }

  private buildHeaders(extra?: Record<string, string>): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'User-Agent': `docutray-node/${VERSION}`,
      ...extra,
    };
  }

  private buildURL(path: string, query?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseURL}${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<T | RawResponse<T>> {
    const maxRetries = options.maxRetries ?? this.maxRetries;
    const timeout = options.timeout ?? this.timeout;
    const url = this.buildURL(path, options.query);
    const headers = this.buildHeaders(options.headers);

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      // Bail immediately if the caller already aborted
      if (options.signal?.aborted) {
        throw new APITimeoutError(
          `Request to ${method} ${path} was aborted`,
        );
      }

      const controller = new AbortController();
      let timedOut = false;
      const timeoutId = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeout);

      // Forward caller's abort signal, storing the handler for cleanup
      let onSignalAbort: (() => void) | undefined;
      if (options.signal) {
        onSignalAbort = () => controller.abort();
        options.signal.addEventListener('abort', onSignalAbort, { once: true });
      }

      try {
        const fetchOptions: globalThis.RequestInit = {
          method,
          headers,
          signal: controller.signal,
        };

        if (body !== undefined && method !== 'GET') {
          if (body instanceof FormData) {
            fetchOptions.body = body;
            delete (fetchOptions.headers as Record<string, string>)['Content-Type'];
            delete (fetchOptions.headers as Record<string, string>)['content-type'];
          } else {
            (fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json';
            fetchOptions.body = JSON.stringify(body);
          }
        }

        const response = await this._fetch(url, fetchOptions);
        clearTimeout(timeoutId);
        if (onSignalAbort && options.signal) {
          options.signal.removeEventListener('abort', onSignalAbort);
        }

        if (response.ok) {
          if (options.raw) {
            return new RawResponse<T>(response);
          }
          const contentType = response.headers.get('content-type') ?? '';
          if (contentType.includes('application/json')) {
            return (await response.json()) as T;
          }
          return (await response.text()) as T;
        }

        let errorBody: unknown;
        try {
          errorBody = await response.json();
        } catch {
          errorBody = await response.text().catch(() => null);
        }

        const errorMessage =
          (errorBody && typeof errorBody === 'object' && 'message' in errorBody
            ? String((errorBody as Record<string, unknown>).message)
            : undefined) ?? `Request failed with status ${response.status}`;

        const apiError = APIError.generate(
          response.status,
          errorBody,
          errorMessage,
          response.headers,
        );

        if (shouldRetry(attempt, maxRetries, response.status)) {
          const retryAfterHeader = response.headers.get('retry-after');
          const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : undefined;
          const delay = calculateRetryDelay(attempt, {}, retryAfter);
          lastError = apiError;
          await sleep(delay);
          continue;
        }

        throw apiError;
      } catch (error) {
        clearTimeout(timeoutId);
        if (onSignalAbort && options.signal) {
          options.signal.removeEventListener('abort', onSignalAbort);
        }

        if (error instanceof APIError) {
          throw error;
        }

        if (error instanceof Error && error.name === 'AbortError') {
          // User-initiated cancellation: throw immediately, don't retry
          if (!timedOut) {
            throw new APITimeoutError(
              `Request to ${method} ${path} was aborted`,
            );
          }

          // Internal timeout: may retry
          const timeoutError = new APITimeoutError(
            `Request to ${method} ${path} timed out after ${timeout}ms`,
          );
          if (shouldRetry(attempt, maxRetries, undefined, true)) {
            lastError = timeoutError;
            const delay = calculateRetryDelay(attempt);
            await sleep(delay);
            continue;
          }
          throw timeoutError;
        }

        const connectionError = new APIConnectionError(
          `Connection error: ${error instanceof Error ? error.message : String(error)}`,
          { cause: error },
        );

        if (shouldRetry(attempt, maxRetries, undefined, true)) {
          lastError = connectionError;
          const delay = calculateRetryDelay(attempt);
          await sleep(delay);
          continue;
        }

        throw connectionError;
      }
    }

    throw lastError ?? new APIConnectionError('Request failed after all retries');
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T | RawResponse<T>> {
    return this.request<T>('GET', path, undefined, options);
  }

  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T | RawResponse<T>> {
    return this.request<T>('POST', path, body, options);
  }

  async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T | RawResponse<T>> {
    return this.request<T>('PUT', path, body, options);
  }

  async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T | RawResponse<T>> {
    return this.request<T>('PATCH', path, body, options);
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T | RawResponse<T>> {
    return this.request<T>('DELETE', path, undefined, options);
  }
}
