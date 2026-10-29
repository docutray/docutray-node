import { describe, it, expect } from 'vitest';
import { server, http, HttpResponse } from '../helpers/mock-server.js';
import { Identify } from '../../src/resources/identify.js';
import { APIClient } from '../../src/core/api-client.js';
import { RawResponse } from '../../src/core/raw-response.js';
import { DocuTrayError } from '../../src/core/error.js';
import type { IdentifyParams } from '../../src/types/identify.js';
import {
  TEST_BASE_URL,
  mockIdentificationResult,
  mockIdentificationEnqueued,
  mockIdentificationStatus,
  mockIdentificationPending,
} from '../helpers/fixtures.js';

const options = ['invoice', 'receipt'];

function createIdentify(): Identify {
  const client = new APIClient({ apiKey: 'test-key', baseURL: TEST_BASE_URL });
  return new Identify(client);
}

describe('Identify', () => {
  describe('run()', () => {
    it('posts multipart with the options and metadata when file is provided', async () => {
      let receivedContentType = '';
      let form: FormData | undefined;
      server.use(
        http.post(`${TEST_BASE_URL}/api/identify`, async ({ request }) => {
          receivedContentType = request.headers.get('content-type') ?? '';
          form = await request.formData();
          return HttpResponse.json(mockIdentificationResult);
        }),
      );

      const result = await createIdentify().run({
        file: Buffer.from('fake-pdf'),
        filename: 'test.pdf',
        documentTypeCodeOptions: options,
        documentMetadata: { ref: 'A-1' },
      });

      expect(result.document_type.code).toBe('invoice');
      expect(result.alternatives?.[0].code).toBe('receipt');
      expect(receivedContentType).toContain('multipart/form-data');
      expect(JSON.parse(String(form?.get('document_type_code_options')))).toEqual(options);
      expect(JSON.parse(String(form?.get('document_metadata')))).toEqual({ ref: 'A-1' });
      expect(form?.has('wait')).toBe(false);
      expect(form?.has('webhook_url')).toBe(false);
    });

    it('posts JSON when url is provided', async () => {
      let receivedBody: Record<string, unknown> = {};
      server.use(
        http.post(`${TEST_BASE_URL}/api/identify`, async ({ request }) => {
          receivedBody = await request.json() as Record<string, unknown>;
          return HttpResponse.json(mockIdentificationResult);
        }),
      );

      const result = await createIdentify().run({
        url: 'https://example.com/doc.pdf',
        documentTypeCodeOptions: options,
        documentMetadata: { ref: 'A-1' },
      });

      expect(result).toEqual(mockIdentificationResult);
      expect(receivedBody).toEqual({
        image_url: 'https://example.com/doc.pdf',
        document_type_code_options: options,
        document_metadata: { ref: 'A-1' },
      });
    });

    it('posts JSON when base64 is provided', async () => {
      let receivedBody: Record<string, unknown> = {};
      server.use(
        http.post(`${TEST_BASE_URL}/api/identify`, async ({ request }) => {
          receivedBody = await request.json() as Record<string, unknown>;
          return HttpResponse.json(mockIdentificationResult);
        }),
      );

      await createIdentify().run({
        base64: 'dGVzdA==',
        contentType: 'application/pdf',
        documentTypeCodeOptions: options,
      });

      expect(receivedBody.image_base64).toBe('dGVzdA==');
      expect(receivedBody.document_type_code_options).toEqual(options);
      expect(receivedBody).not.toHaveProperty('document_metadata');
    });

    it('returns a result without alternatives when the API omits them', async () => {
      server.use(
        http.post(`${TEST_BASE_URL}/api/identify`, () =>
          HttpResponse.json({ document_type: { code: 'otro', name: 'Otro/No identificado', confidence: 0.2 } }),
        ),
      );

      const result = await createIdentify().run({ url: 'https://example.com/doc.pdf', documentTypeCodeOptions: options });

      expect(result.document_type.code).toBe('otro');
      expect(result.alternatives).toBeUndefined();
    });

    it('throws when no file source is provided', async () => {
      const params = { documentTypeCodeOptions: options } as IdentifyParams;
      await expect(createIdentify().run(params)).rejects.toThrow(DocuTrayError);
      await expect(createIdentify().run(params)).rejects.toThrow('Must provide file, url, or base64');
    });
  });

  describe('runAsync()', () => {
    it('returns the enqueue response with a wait() method', async () => {
      server.use(
        http.post(`${TEST_BASE_URL}/api/identify-async`, () => HttpResponse.json(mockIdentificationEnqueued)),
      );

      const status = await createIdentify().runAsync({ url: 'https://example.com/doc.pdf', documentTypeCodeOptions: options });

      expect(status.id).toBe('id-456');
      expect(status.status).toBe('ENQUEUED');
      expect(typeof status.wait).toBe('function');
    });

    it('wait() polls until complete', async () => {
      let pollCount = 0;
      server.use(
        http.post(`${TEST_BASE_URL}/api/identify-async`, () => HttpResponse.json(mockIdentificationEnqueued)),
        http.get(`${TEST_BASE_URL}/api/identify-async/status/id-456`, () => {
          pollCount++;
          return HttpResponse.json(pollCount >= 2 ? mockIdentificationStatus : mockIdentificationPending);
        }),
      );

      const status = await createIdentify().runAsync({ url: 'https://example.com/doc.pdf', documentTypeCodeOptions: options });
      const result = await status.wait({ pollInterval: 10 });

      expect(result.status).toBe('SUCCESS');
      expect(result.document_type?.code).toBe('invoice');
      expect(pollCount).toBeGreaterThanOrEqual(2);
    });

    it('wait() resolves with the ERROR status instead of throwing', async () => {
      server.use(
        http.post(`${TEST_BASE_URL}/api/identify-async`, () => HttpResponse.json(mockIdentificationEnqueued)),
        http.get(`${TEST_BASE_URL}/api/identify-async/status/id-456`, () =>
          HttpResponse.json({
            ...mockIdentificationPending,
            status: 'ERROR',
            response_timestamp: '2025-01-01T01:00:00Z',
            error: 'Identification timeout exceeded',
          }),
        ),
      );

      const status = await createIdentify().runAsync({ url: 'https://example.com/doc.pdf', documentTypeCodeOptions: options });
      const result = await status.wait({ pollInterval: 10 });

      expect(result.status).toBe('ERROR');
      expect(result.error).toBe('Identification timeout exceeded');
    });
  });

  describe('getStatus()', () => {
    it('fetches identification status by id', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/identify-async/status/id-456`, () => HttpResponse.json(mockIdentificationStatus)),
      );

      const result = await createIdentify().getStatus('id-456');

      expect(result.id).toBe('id-456');
      expect(result.status).toBe('SUCCESS');
      expect(result.document_type_code_options).toEqual(options);
    });
  });

  describe('withRawResponse', () => {
    it('returns RawResponse for run()', async () => {
      server.use(
        http.post(`${TEST_BASE_URL}/api/identify`, () => HttpResponse.json(mockIdentificationResult)),
      );

      const raw = await createIdentify().withRawResponse.run({ url: 'https://example.com/doc.pdf', documentTypeCodeOptions: options });

      expect(raw).toBeInstanceOf(RawResponse);
      expect(raw.statusCode).toBe(200);
      expect((await raw.parse()).document_type.code).toBe('invoice');
    });

    it('returns RawResponse for getStatus()', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/identify-async/status/id-456`, () => HttpResponse.json(mockIdentificationStatus)),
      );

      const raw = await createIdentify().withRawResponse.getStatus('id-456');

      expect(raw).toBeInstanceOf(RawResponse);
      expect(raw.statusCode).toBe(200);
    });
  });
});
