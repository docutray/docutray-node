import { describe, it, expect } from 'vitest';
import { server, http, HttpResponse } from '../helpers/mock-server.js';
import { createDocuTrayClient, TEST_BASE_URL, mockDocumentType } from '../helpers/fixtures.js';
import { APITimeoutError } from '../../src/core/error.js';

describe('Integration: Timeout & Cancellation', () => {
  it('throws APITimeoutError when request exceeds timeout', async () => {
    server.use(
      http.get(`${TEST_BASE_URL}/api/document-types/dt-1`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return HttpResponse.json({ data: mockDocumentType });
      }),
    );

    const client = createDocuTrayClient();
    await expect(
      client.documentTypes.get('dt-1', { timeout: 50, maxRetries: 0 }),
    ).rejects.toThrow(APITimeoutError);
  });

  it('throws on AbortSignal cancellation', async () => {
    server.use(
      http.get(`${TEST_BASE_URL}/api/document-types/dt-1`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return HttpResponse.json({ data: mockDocumentType });
      }),
    );

    const controller = new AbortController();
    const client = createDocuTrayClient();

    const promise = client.documentTypes.get('dt-1', {
      signal: controller.signal,
      maxRetries: 0,
    });

    setTimeout(() => controller.abort(), 50);

    await expect(promise).rejects.toThrow(APITimeoutError);
  });
});
