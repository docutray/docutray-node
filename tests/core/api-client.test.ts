import { describe, it, expect, vi, beforeEach } from 'vitest';
import { APIClient } from '../../src/core/api-client.js';
import { RawResponse } from '../../src/core/raw-response.js';
import {
  BadRequestError,
  APITimeoutError,
  APIConnectionError,
  InternalServerError,
} from '../../src/core/error.js';
import { VERSION } from '../../src/lib/version.js';

function createMockFetch(responses: Array<{ status: number; body: unknown; headers?: Record<string, string> }>) {
  let callIndex = 0;
  return vi.fn(async (): Promise<Response> => {
    const config = responses[callIndex] ?? responses[responses.length - 1];
    callIndex++;
    return new Response(JSON.stringify(config.body), {
      status: config.status,
      headers: {
        'content-type': 'application/json',
        ...(config.headers ?? {}),
      },
    });
  });
}

describe('APIClient', () => {
  let client: APIClient;
  let mockFetch: ReturnType<typeof createMockFetch>;

  beforeEach(() => {
    mockFetch = createMockFetch([{ status: 200, body: { ok: true } }]);
    client = new APIClient({
      apiKey: 'dt_test_abc123',
      fetch: mockFetch as unknown as typeof globalThis.fetch,
    });
  });

  describe('constructor', () => {
    it('uses default base URL', () => {
      expect(client.baseURL).toBe('https://api.docutray.com/v1');
    });

    it('accepts custom base URL and strips trailing slashes', () => {
      const c = new APIClient({
        apiKey: 'key',
        baseURL: 'https://custom.api.com/v2/',
        fetch: mockFetch as unknown as typeof globalThis.fetch,
      });
      expect(c.baseURL).toBe('https://custom.api.com/v2');
    });

    it('uses default timeout and maxRetries', () => {
      expect(client.timeout).toBe(60_000);
      expect(client.maxRetries).toBe(2);
    });
  });

  describe('request headers', () => {
    it('sends Authorization header', async () => {
      await client.get('/test');
      const [, init] = mockFetch.mock.calls[0];
      const headers = init?.headers as Record<string, string>;
      expect(headers['Authorization']).toBe('Bearer dt_test_abc123');
    });

    it('sends User-Agent header', async () => {
      await client.get('/test');
      const [, init] = mockFetch.mock.calls[0];
      const headers = init?.headers as Record<string, string>;
      expect(headers['User-Agent']).toBe(`docutray-node/${VERSION}`);
    });

    it('sends Content-Type header', async () => {
      await client.get('/test');
      const [, init] = mockFetch.mock.calls[0];
      const headers = init?.headers as Record<string, string>;
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('merges custom headers', async () => {
      await client.get('/test', { headers: { 'X-Custom': 'value' } });
      const [, init] = mockFetch.mock.calls[0];
      const headers = init?.headers as Record<string, string>;
      expect(headers['X-Custom']).toBe('value');
    });
  });

  describe('HTTP methods', () => {
    it('makes GET request', async () => {
      const result = await client.get('/docs');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api.docutray.com/v1/docs');
      expect(init?.method).toBe('GET');
      expect(result).toEqual({ ok: true });
    });

    it('makes POST request with JSON body', async () => {
      await client.post('/docs', { name: 'test' });
      const [, init] = mockFetch.mock.calls[0];
      expect(init?.method).toBe('POST');
      expect(init?.body).toBe(JSON.stringify({ name: 'test' }));
    });

    it('makes PUT request', async () => {
      await client.put('/docs/1', { name: 'updated' });
      const [, init] = mockFetch.mock.calls[0];
      expect(init?.method).toBe('PUT');
    });

    it('makes PATCH request', async () => {
      await client.patch('/docs/1', { name: 'patched' });
      const [, init] = mockFetch.mock.calls[0];
      expect(init?.method).toBe('PATCH');
    });

    it('makes DELETE request', async () => {
      await client.delete('/docs/1');
      const [, init] = mockFetch.mock.calls[0];
      expect(init?.method).toBe('DELETE');
    });
  });

  describe('error handling', () => {
    it('throws BadRequestError on 400', async () => {
      mockFetch = createMockFetch([
        { status: 400, body: { message: 'Invalid input' } },
      ]);
      client = new APIClient({
        apiKey: 'key',
        maxRetries: 0,
        fetch: mockFetch as unknown as typeof globalThis.fetch,
      });

      await expect(client.get('/test')).rejects.toThrow(BadRequestError);
    });

    it('includes error message from response body', async () => {
      mockFetch = createMockFetch([
        { status: 400, body: { message: 'Field X is required' } },
      ]);
      client = new APIClient({
        apiKey: 'key',
        maxRetries: 0,
        fetch: mockFetch as unknown as typeof globalThis.fetch,
      });

      await expect(client.get('/test')).rejects.toThrow('Field X is required');
    });
  });

  describe('retry behavior', () => {
    it('retries on 500 and succeeds', async () => {
      mockFetch = createMockFetch([
        { status: 500, body: { error: 'fail' } },
        { status: 200, body: { ok: true } },
      ]);
      client = new APIClient({
        apiKey: 'key',
        maxRetries: 2,
        fetch: mockFetch as unknown as typeof globalThis.fetch,
      });

      const result = await client.get('/test');
      expect(result).toEqual({ ok: true });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    }, 10_000);

    it('throws after exhausting retries', async () => {
      mockFetch = createMockFetch([
        { status: 500, body: { error: 'fail' } },
        { status: 500, body: { error: 'fail' } },
        { status: 500, body: { error: 'fail' } },
      ]);
      client = new APIClient({
        apiKey: 'key',
        maxRetries: 2,
        fetch: mockFetch as unknown as typeof globalThis.fetch,
      });

      await expect(client.get('/test')).rejects.toThrow(InternalServerError);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    }, 15_000);

    it('does not retry on 400', async () => {
      mockFetch = createMockFetch([
        { status: 400, body: { error: 'bad' } },
      ]);
      client = new APIClient({
        apiKey: 'key',
        maxRetries: 2,
        fetch: mockFetch as unknown as typeof globalThis.fetch,
      });

      await expect(client.get('/test')).rejects.toThrow(BadRequestError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('timeout', () => {
    it('throws APITimeoutError when request times out', async () => {
      const slowFetch = vi.fn(async (_url: string, init?: RequestInit) => {
        return new Promise<Response>((_, reject) => {
          const signal = init?.signal;
          if (signal) {
            signal.addEventListener('abort', () => {
              reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
            });
          }
        });
      });

      client = new APIClient({
        apiKey: 'key',
        timeout: 50,
        maxRetries: 0,
        fetch: slowFetch as unknown as typeof globalThis.fetch,
      });

      await expect(client.get('/slow')).rejects.toThrow(APITimeoutError);
    });
  });

  describe('connection errors', () => {
    it('throws APIConnectionError on network failure', async () => {
      const failingFetch = vi.fn(async () => {
        throw new TypeError('fetch failed');
      });

      client = new APIClient({
        apiKey: 'key',
        maxRetries: 0,
        fetch: failingFetch as unknown as typeof globalThis.fetch,
      });

      await expect(client.get('/test')).rejects.toThrow(APIConnectionError);
    });
  });

  describe('raw response', () => {
    it('returns RawResponse when raw option is true', async () => {
      const result = await client.get('/test', { raw: true });
      expect(result).toBeInstanceOf(RawResponse);
    });

    it('RawResponse exposes statusCode and headers', async () => {
      const result = (await client.get('/test', { raw: true })) as RawResponse<unknown>;
      expect(result.statusCode).toBe(200);
      expect(result.headers).toBeDefined();
    });

    it('RawResponse.parse() returns parsed body', async () => {
      const result = (await client.get('/test', { raw: true })) as RawResponse<{ ok: boolean }>;
      const body = await result.parse();
      expect(body).toEqual({ ok: true });
    });
  });

  describe('injectable fetch', () => {
    it('uses custom fetch function', async () => {
      const customFetch = vi.fn(async () => {
        return new Response(JSON.stringify({ custom: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      });

      client = new APIClient({
        apiKey: 'key',
        fetch: customFetch as unknown as typeof globalThis.fetch,
      });

      const result = await client.get('/test');
      expect(result).toEqual({ custom: true });
      expect(customFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('query parameters', () => {
    it('appends query parameters to URL', async () => {
      await client.get('/docs', { query: { page: 1, limit: 10 } });
      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('page=1');
      expect(url).toContain('limit=10');
    });

    it('skips undefined query values', async () => {
      await client.get('/docs', { query: { page: 1, filter: undefined } });
      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('page=1');
      expect(url).not.toContain('filter');
    });
  });
});
