import { describe, it, expect } from 'vitest';
import { server, http, HttpResponse } from '../helpers/mock-server.js';
import { createDocuTrayClient, TEST_BASE_URL } from '../helpers/fixtures.js';
import { APITimeoutError } from '../../src/core/error.js';
import type { ConversionStatus } from '../../src/types/convert.js';

const baseStatus: ConversionStatus = {
  conversion_id: 'conv-poll-1',
  status: 'ENQUEUED',
  status_url: '/api/convert-async/status/conv-poll-1',
  request_timestamp: '2025-01-01T00:00:00Z',
  response_timestamp: null,
  document_type_code: 'invoice',
  original_filename: 'test.pdf',
  data: null,
  error: null,
};

describe('Integration: Polling', () => {
  it('polls through ENQUEUED → PROCESSING → SUCCESS', async () => {
    // runAsync handler
    server.use(
      http.post(`${TEST_BASE_URL}/api/convert-async`, () => {
        return HttpResponse.json(baseStatus);
      }),
    );

    // Status handler with progression
    let pollCount = 0;
    server.use(
      http.get(`${TEST_BASE_URL}/api/convert-async/status/conv-poll-1`, () => {
        pollCount++;
        if (pollCount === 1) {
          return HttpResponse.json({ ...baseStatus, status: 'PROCESSING' });
        }
        return HttpResponse.json({
          ...baseStatus,
          status: 'SUCCESS',
          response_timestamp: '2025-01-01T00:00:02Z',
          data: { field1: 'value1' },
        });
      }),
    );

    const client = createDocuTrayClient();
    const asyncResult = await client.convert.runAsync(
      { url: 'https://example.com/doc.pdf', documentTypeCode: 'invoice' },
    );

    const final = await asyncResult.wait({ pollInterval: 10, timeout: 5000 });
    expect(final.status).toBe('SUCCESS');
    expect(final.data).toEqual({ field1: 'value1' });
  });

  it('resolves with ERROR status when conversion fails', async () => {
    server.use(
      http.post(`${TEST_BASE_URL}/api/convert-async`, () => {
        return HttpResponse.json(baseStatus);
      }),
    );

    server.use(
      http.get(`${TEST_BASE_URL}/api/convert-async/status/conv-poll-1`, () => {
        return HttpResponse.json({
          ...baseStatus,
          status: 'ERROR',
          error: 'Document processing failed',
        });
      }),
    );

    const client = createDocuTrayClient();
    const asyncResult = await client.convert.runAsync(
      { url: 'https://example.com/doc.pdf', documentTypeCode: 'invoice' },
    );

    const result = await asyncResult.wait({ pollInterval: 10, timeout: 5000 });
    expect(result.status).toBe('ERROR');
    expect(result.error).toBe('Document processing failed');
  });

  it('throws APITimeoutError when polling times out', async () => {
    server.use(
      http.post(`${TEST_BASE_URL}/api/convert-async`, () => {
        return HttpResponse.json(baseStatus);
      }),
    );

    server.use(
      http.get(`${TEST_BASE_URL}/api/convert-async/status/conv-poll-1`, () => {
        return HttpResponse.json({ ...baseStatus, status: 'PROCESSING' });
      }),
    );

    const client = createDocuTrayClient();
    const asyncResult = await client.convert.runAsync(
      { url: 'https://example.com/doc.pdf', documentTypeCode: 'invoice' },
    );

    await expect(
      asyncResult.wait({ pollInterval: 10, timeout: 50 }),
    ).rejects.toThrow(APITimeoutError);
  });

  it('invokes onStatus callback for each polled status', async () => {
    server.use(
      http.post(`${TEST_BASE_URL}/api/convert-async`, () => {
        return HttpResponse.json(baseStatus);
      }),
    );

    let pollCount = 0;
    server.use(
      http.get(`${TEST_BASE_URL}/api/convert-async/status/conv-poll-1`, () => {
        pollCount++;
        if (pollCount <= 2) {
          return HttpResponse.json({ ...baseStatus, status: 'PROCESSING' });
        }
        return HttpResponse.json({
          ...baseStatus,
          status: 'SUCCESS',
          response_timestamp: '2025-01-01T00:00:02Z',
          data: { field1: 'value1' },
        });
      }),
    );

    const client = createDocuTrayClient();
    const asyncResult = await client.convert.runAsync(
      { url: 'https://example.com/doc.pdf', documentTypeCode: 'invoice' },
    );

    const statuses: string[] = [];
    await asyncResult.wait({
      pollInterval: 10,
      timeout: 5000,
      onStatus: (s) => statuses.push(s.status),
    });

    expect(statuses.length).toBeGreaterThanOrEqual(2);
    expect(statuses[statuses.length - 1]).toBe('SUCCESS');
  });
});
