import { describe, it, expect } from 'vitest';
import { server, http, HttpResponse } from '../helpers/mock-server.js';
import { createDocuTrayClient, TEST_BASE_URL, mockDocumentType } from '../helpers/fixtures.js';
import { InternalServerError } from '../../src/core/error.js';

describe('Integration: Retry', () => {
  it('retries and succeeds after transient 500', async () => {
    let attempt = 0;
    server.use(
      http.get(`${TEST_BASE_URL}/api/document-types/dt-1`, () => {
        attempt++;
        if (attempt === 1) {
          return HttpResponse.json({ message: 'Internal error' }, { status: 500 });
        }
        return HttpResponse.json({ data: mockDocumentType });
      }),
    );

    const client = createDocuTrayClient();
    const result = await client.documentTypes.get('dt-1');
    expect(result).toEqual(mockDocumentType);
    expect(attempt).toBe(2);
  });

  it('respects maxRetries and throws after exhausting retries', async () => {
    server.use(
      http.get(`${TEST_BASE_URL}/api/document-types/dt-1`, () => {
        return HttpResponse.json({ message: 'Internal error' }, { status: 500 });
      }),
    );

    const client = createDocuTrayClient();
    await expect(
      client.documentTypes.get('dt-1', { maxRetries: 1 }),
    ).rejects.toThrow(InternalServerError);
  });
});
