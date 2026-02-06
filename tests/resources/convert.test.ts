import { describe, it, expect } from 'vitest';
import { server, http, HttpResponse } from '../helpers/mock-server.js';
import { Convert } from '../../src/resources/convert.js';
import { APIClient } from '../../src/core/api-client.js';
import { RawResponse } from '../../src/core/raw-response.js';
import { DocuTrayError } from '../../src/core/error.js';
import {
  TEST_BASE_URL,
  mockConversionStatus,
  mockConversionPending,
} from '../helpers/fixtures.js';

function createConvert(): Convert {
  const client = new APIClient({ apiKey: 'test-key', baseURL: TEST_BASE_URL });
  return new Convert(client);
}

describe('Convert', () => {
  describe('run()', () => {
    it('posts multipart when file is provided', async () => {
      let receivedContentType = '';
      server.use(
        http.post(`${TEST_BASE_URL}/api/convert`, async ({ request }) => {
          receivedContentType = request.headers.get('content-type') ?? '';
          return HttpResponse.json(mockConversionStatus);
        }),
      );

      const convert = createConvert();
      const result = await convert.run({
        documentTypeCode: 'invoice',
        file: Buffer.from('fake-pdf'),
        filename: 'test.pdf',
      });

      expect(result.conversion_id).toBe('conv-123');
      expect(receivedContentType).toContain('multipart/form-data');
    });

    it('posts JSON when url is provided', async () => {
      let receivedBody: Record<string, unknown> = {};
      server.use(
        http.post(`${TEST_BASE_URL}/api/convert`, async ({ request }) => {
          receivedBody = await request.json() as Record<string, unknown>;
          return HttpResponse.json(mockConversionStatus);
        }),
      );

      const convert = createConvert();
      const result = await convert.run({
        documentTypeCode: 'invoice',
        url: 'https://example.com/doc.pdf',
      });

      expect(result.conversion_id).toBe('conv-123');
      expect(receivedBody.image_url).toBe('https://example.com/doc.pdf');
      expect(receivedBody.document_type_code).toBe('invoice');
    });

    it('posts JSON when base64 is provided', async () => {
      let receivedBody: Record<string, unknown> = {};
      server.use(
        http.post(`${TEST_BASE_URL}/api/convert`, async ({ request }) => {
          receivedBody = await request.json() as Record<string, unknown>;
          return HttpResponse.json(mockConversionStatus);
        }),
      );

      const convert = createConvert();
      const result = await convert.run({
        documentTypeCode: 'invoice',
        base64: 'dGVzdA==',
        contentType: 'application/pdf',
      });

      expect(result.conversion_id).toBe('conv-123');
      expect(receivedBody.image_base64).toBe('dGVzdA==');
      expect(receivedBody.image_content_type).toBe('application/pdf');
    });

    it('throws when no file source is provided', async () => {
      const convert = createConvert();
      await expect(
        convert.run({ documentTypeCode: 'invoice' }),
      ).rejects.toThrow(DocuTrayError);
      await expect(
        convert.run({ documentTypeCode: 'invoice' }),
      ).rejects.toThrow('Must provide file, url, or base64');
    });
  });

  describe('runAsync()', () => {
    it('returns status with wait() method', async () => {
      server.use(
        http.post(`${TEST_BASE_URL}/api/convert-async`, () => {
          return HttpResponse.json(mockConversionPending);
        }),
      );

      const convert = createConvert();
      const status = await convert.runAsync({
        documentTypeCode: 'invoice',
        url: 'https://example.com/doc.pdf',
      });

      expect(status.conversion_id).toBe('conv-123');
      expect(status.status).toBe('ENQUEUED');
      expect(typeof status.wait).toBe('function');
    });

    it('wait() polls until complete', async () => {
      let pollCount = 0;
      server.use(
        http.post(`${TEST_BASE_URL}/api/convert-async`, () => {
          return HttpResponse.json(mockConversionPending);
        }),
        http.get(`${TEST_BASE_URL}/api/convert-async/status/conv-123`, () => {
          pollCount++;
          if (pollCount >= 2) {
            return HttpResponse.json(mockConversionStatus);
          }
          return HttpResponse.json({ ...mockConversionPending, status: 'PROCESSING' });
        }),
      );

      const convert = createConvert();
      const status = await convert.runAsync({
        documentTypeCode: 'invoice',
        url: 'https://example.com/doc.pdf',
      });

      const result = await status.wait({ pollInterval: 10 });
      expect(result.status).toBe('SUCCESS');
      expect(pollCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getStatus()', () => {
    it('fetches conversion status by id', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/convert-async/status/conv-123`, () => {
          return HttpResponse.json(mockConversionStatus);
        }),
      );

      const convert = createConvert();
      const result = await convert.getStatus('conv-123');
      expect(result.conversion_id).toBe('conv-123');
      expect(result.status).toBe('SUCCESS');
    });
  });

  describe('withRawResponse', () => {
    it('returns RawResponse for run()', async () => {
      server.use(
        http.post(`${TEST_BASE_URL}/api/convert`, () => {
          return HttpResponse.json(mockConversionStatus);
        }),
      );

      const convert = createConvert();
      const raw = await convert.withRawResponse.run({
        documentTypeCode: 'invoice',
        url: 'https://example.com/doc.pdf',
      });

      expect(raw).toBeInstanceOf(RawResponse);
      expect(raw.statusCode).toBe(200);
      const parsed = await raw.parse();
      expect(parsed.conversion_id).toBe('conv-123');
    });

    it('returns RawResponse for getStatus()', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/convert-async/status/conv-123`, () => {
          return HttpResponse.json(mockConversionStatus);
        }),
      );

      const convert = createConvert();
      const raw = await convert.withRawResponse.getStatus('conv-123');
      expect(raw).toBeInstanceOf(RawResponse);
      expect(raw.statusCode).toBe(200);
    });
  });
});
