import { describe, it, expect } from 'vitest';
import { server, http, HttpResponse } from '../helpers/mock-server.js';
import { Identify } from '../../src/resources/identify.js';
import { APIClient } from '../../src/core/api-client.js';
import { RawResponse } from '../../src/core/raw-response.js';
import { DocuTrayError } from '../../src/core/error.js';
import {
  TEST_BASE_URL,
  mockIdentificationStatus,
  mockIdentificationPending,
} from '../helpers/fixtures.js';

function createIdentify(): Identify {
  const client = new APIClient({ apiKey: 'test-key', baseURL: TEST_BASE_URL });
  return new Identify(client);
}

describe('Identify', () => {
  describe('run()', () => {
    it('posts multipart when file is provided', async () => {
      let receivedContentType = '';
      server.use(
        http.post(`${TEST_BASE_URL}/api/identify`, async ({ request }) => {
          receivedContentType = request.headers.get('content-type') ?? '';
          return HttpResponse.json(mockIdentificationStatus);
        }),
      );

      const identify = createIdentify();
      const result = await identify.run({
        file: Buffer.from('fake-pdf'),
        filename: 'test.pdf',
      });

      expect(result.identificationId).toBe('id-456');
      expect(receivedContentType).toContain('multipart/form-data');
    });

    it('posts JSON when url is provided', async () => {
      let receivedBody: Record<string, unknown> = {};
      server.use(
        http.post(`${TEST_BASE_URL}/api/identify`, async ({ request }) => {
          receivedBody = await request.json() as Record<string, unknown>;
          return HttpResponse.json(mockIdentificationStatus);
        }),
      );

      const identify = createIdentify();
      const result = await identify.run({
        url: 'https://example.com/doc.pdf',
      });

      expect(result.identificationId).toBe('id-456');
      expect(receivedBody.image_url).toBe('https://example.com/doc.pdf');
    });

    it('posts JSON when base64 is provided', async () => {
      let receivedBody: Record<string, unknown> = {};
      server.use(
        http.post(`${TEST_BASE_URL}/api/identify`, async ({ request }) => {
          receivedBody = await request.json() as Record<string, unknown>;
          return HttpResponse.json(mockIdentificationStatus);
        }),
      );

      const identify = createIdentify();
      await identify.run({
        base64: 'dGVzdA==',
        contentType: 'application/pdf',
      });

      expect(receivedBody.image_base64).toBe('dGVzdA==');
    });

    it('throws when no file source is provided', async () => {
      const identify = createIdentify();
      await expect(identify.run({})).rejects.toThrow(DocuTrayError);
      await expect(identify.run({})).rejects.toThrow('Must provide file, url, or base64');
    });
  });

  describe('runAsync()', () => {
    it('returns status with wait() method', async () => {
      server.use(
        http.post(`${TEST_BASE_URL}/api/identify-async`, () => {
          return HttpResponse.json(mockIdentificationPending);
        }),
      );

      const identify = createIdentify();
      const status = await identify.runAsync({
        url: 'https://example.com/doc.pdf',
      });

      expect(status.identificationId).toBe('id-456');
      expect(typeof status.wait).toBe('function');
    });

    it('wait() polls until complete', async () => {
      let pollCount = 0;
      server.use(
        http.post(`${TEST_BASE_URL}/api/identify-async`, () => {
          return HttpResponse.json(mockIdentificationPending);
        }),
        http.get(`${TEST_BASE_URL}/api/identify-async/status/id-456`, () => {
          pollCount++;
          if (pollCount >= 2) {
            return HttpResponse.json(mockIdentificationStatus);
          }
          return HttpResponse.json({ ...mockIdentificationPending, status: 'PROCESSING' });
        }),
      );

      const identify = createIdentify();
      const status = await identify.runAsync({
        url: 'https://example.com/doc.pdf',
      });

      const result = await status.wait({ pollInterval: 10 });
      expect(result.status).toBe('SUCCESS');
      expect(pollCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getStatus()', () => {
    it('fetches identification status by id', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/identify-async/status/id-456`, () => {
          return HttpResponse.json(mockIdentificationStatus);
        }),
      );

      const identify = createIdentify();
      const result = await identify.getStatus('id-456');
      expect(result.identificationId).toBe('id-456');
      expect(result.status).toBe('SUCCESS');
    });
  });

  describe('withRawResponse', () => {
    it('returns RawResponse for run()', async () => {
      server.use(
        http.post(`${TEST_BASE_URL}/api/identify`, () => {
          return HttpResponse.json(mockIdentificationStatus);
        }),
      );

      const identify = createIdentify();
      const raw = await identify.withRawResponse.run({
        url: 'https://example.com/doc.pdf',
      });

      expect(raw).toBeInstanceOf(RawResponse);
      expect(raw.statusCode).toBe(200);
    });

    it('returns RawResponse for getStatus()', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/identify-async/status/id-456`, () => {
          return HttpResponse.json(mockIdentificationStatus);
        }),
      );

      const identify = createIdentify();
      const raw = await identify.withRawResponse.getStatus('id-456');
      expect(raw).toBeInstanceOf(RawResponse);
      expect(raw.statusCode).toBe(200);
    });
  });
});
