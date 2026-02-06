import { describe, it, expect } from 'vitest';
import { server, http, HttpResponse } from '../helpers/mock-server.js';
import { DocumentTypes } from '../../src/resources/document-types.js';
import { APIClient } from '../../src/core/api-client.js';
import { RawResponse } from '../../src/core/raw-response.js';
import {
  TEST_BASE_URL,
  mockDocumentType,
  mockValidationResult,
} from '../helpers/fixtures.js';

function createDocumentTypes(): DocumentTypes {
  const client = new APIClient({ apiKey: 'test-key', baseURL: TEST_BASE_URL });
  return new DocumentTypes(client);
}

describe('DocumentTypes', () => {
  describe('list()', () => {
    it('returns a Page of document types', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/document-types`, () => {
          return HttpResponse.json({
            data: [mockDocumentType],
            pagination: { total: 1, page: 1, limit: 10 },
          });
        }),
      );

      const dt = createDocumentTypes();
      const page = await dt.list();

      expect(page.data).toHaveLength(1);
      expect(page.data[0].id).toBe('dt-789');
      expect(page.hasNextPage()).toBe(false);
    });

    it('passes search params as query', async () => {
      let receivedUrl = '';
      server.use(
        http.get(`${TEST_BASE_URL}/api/document-types`, ({ request }) => {
          receivedUrl = request.url;
          return HttpResponse.json({
            data: [],
            pagination: { total: 0, page: 1, limit: 10 },
          });
        }),
      );

      const dt = createDocumentTypes();
      await dt.list({ search: 'invoice', page: 1, limit: 5 });

      expect(receivedUrl).toContain('search=invoice');
      expect(receivedUrl).toContain('page=1');
      expect(receivedUrl).toContain('limit=5');
    });

    it('supports pagination iteration', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/document-types`, ({ request }) => {
          const url = new URL(request.url);
          const page = Number(url.searchParams.get('page') ?? '1');
          if (page === 1) {
            return HttpResponse.json({
              data: [{ ...mockDocumentType, id: 'dt-1' }],
              pagination: { total: 2, page: 1, limit: 1 },
            });
          }
          return HttpResponse.json({
            data: [{ ...mockDocumentType, id: 'dt-2' }],
            pagination: { total: 2, page: 2, limit: 1 },
          });
        }),
      );

      const dt = createDocumentTypes();
      const page = await dt.list({ limit: 1 });
      const items = await page.toArray({ limit: 10 });

      expect(items).toHaveLength(2);
      expect(items[0].id).toBe('dt-1');
      expect(items[1].id).toBe('dt-2');
    });
  });

  describe('get()', () => {
    it('fetches a document type by id', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/document-types/dt-789`, () => {
          return HttpResponse.json(mockDocumentType);
        }),
      );

      const dt = createDocumentTypes();
      const result = await dt.get('dt-789');

      expect(result.id).toBe('dt-789');
      expect(result.name).toBe('Invoice');
    });
  });

  describe('validate()', () => {
    it('validates a document type', async () => {
      server.use(
        http.post(`${TEST_BASE_URL}/api/document-types/dt-789/validate`, () => {
          return HttpResponse.json(mockValidationResult);
        }),
      );

      const dt = createDocumentTypes();
      const result = await dt.validate('dt-789');

      expect(result.errors.count).toBe(0);
      expect(result.warnings.count).toBe(1);
    });
  });

  describe('withRawResponse', () => {
    it('returns RawResponse for list()', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/document-types`, () => {
          return HttpResponse.json({
            data: [mockDocumentType],
            pagination: { total: 1, page: 1, limit: 10 },
          });
        }),
      );

      const dt = createDocumentTypes();
      const raw = await dt.withRawResponse.list();

      expect(raw).toBeInstanceOf(RawResponse);
      expect(raw.statusCode).toBe(200);
    });

    it('returns RawResponse for get()', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/document-types/dt-789`, () => {
          return HttpResponse.json(mockDocumentType);
        }),
      );

      const dt = createDocumentTypes();
      const raw = await dt.withRawResponse.get('dt-789');

      expect(raw).toBeInstanceOf(RawResponse);
      expect(raw.statusCode).toBe(200);
    });

    it('returns RawResponse for validate()', async () => {
      server.use(
        http.post(`${TEST_BASE_URL}/api/document-types/dt-789/validate`, () => {
          return HttpResponse.json(mockValidationResult);
        }),
      );

      const dt = createDocumentTypes();
      const raw = await dt.withRawResponse.validate('dt-789');

      expect(raw).toBeInstanceOf(RawResponse);
      expect(raw.statusCode).toBe(200);
    });
  });
});
