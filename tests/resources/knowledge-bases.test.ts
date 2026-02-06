import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { KnowledgeBases } from '../../src/resources/knowledge-bases.js';
import { APIClient } from '../../src/core/api-client.js';
import { RawResponse } from '../../src/core/raw-response.js';
import {
  TEST_BASE_URL,
  mockKnowledgeBase,
  mockKBDocument,
  mockSearchResult,
  mockSyncResult,
} from '../helpers/fixtures.js';

const server = setupServer();

function createKnowledgeBases(): KnowledgeBases {
  const client = new APIClient({ apiKey: 'test-key', baseURL: TEST_BASE_URL });
  return new KnowledgeBases(client);
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('KnowledgeBases', () => {
  describe('list()', () => {
    it('returns a Page of knowledge bases', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/knowledge-bases`, () => {
          return HttpResponse.json({
            data: [mockKnowledgeBase],
            pagination: { total: 1, page: 1, limit: 10 },
          });
        }),
      );

      const kb = createKnowledgeBases();
      const page = await kb.list();

      expect(page.data).toHaveLength(1);
      expect(page.data[0].id).toBe('kb-1');
      expect(page.hasNextPage()).toBe(false);
    });
  });

  describe('get()', () => {
    it('fetches a knowledge base by id', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/knowledge-bases/kb-1`, () => {
          return HttpResponse.json(mockKnowledgeBase);
        }),
      );

      const kb = createKnowledgeBases();
      const result = await kb.get('kb-1');
      expect(result.id).toBe('kb-1');
      expect(result.name).toBe('Test KB');
    });
  });

  describe('create()', () => {
    it('creates a knowledge base', async () => {
      let receivedBody: Record<string, unknown> = {};
      server.use(
        http.post(`${TEST_BASE_URL}/api/knowledge-bases`, async ({ request }) => {
          receivedBody = await request.json() as Record<string, unknown>;
          return HttpResponse.json(mockKnowledgeBase);
        }),
      );

      const kb = createKnowledgeBases();
      const result = await kb.create({ name: 'My KB', description: 'Test' });

      expect(result.id).toBe('kb-1');
      expect(receivedBody.name).toBe('My KB');
      expect(receivedBody.description).toBe('Test');
    });
  });

  describe('update()', () => {
    it('updates a knowledge base', async () => {
      let receivedBody: Record<string, unknown> = {};
      server.use(
        http.put(`${TEST_BASE_URL}/api/knowledge-bases/kb-1`, async ({ request }) => {
          receivedBody = await request.json() as Record<string, unknown>;
          return HttpResponse.json({ ...mockKnowledgeBase, name: 'Updated' });
        }),
      );

      const kb = createKnowledgeBases();
      const result = await kb.update('kb-1', { name: 'Updated' });

      expect(result.name).toBe('Updated');
      expect(receivedBody.name).toBe('Updated');
    });
  });

  describe('delete()', () => {
    it('deletes a knowledge base', async () => {
      let deleteCalled = false;
      server.use(
        http.delete(`${TEST_BASE_URL}/api/knowledge-bases/kb-1`, () => {
          deleteCalled = true;
          return new HttpResponse(null, { status: 204 });
        }),
      );

      const kb = createKnowledgeBases();
      await kb.delete('kb-1');
      expect(deleteCalled).toBe(true);
    });
  });

  describe('search()', () => {
    it('searches a knowledge base', async () => {
      let receivedBody: Record<string, unknown> = {};
      server.use(
        http.post(`${TEST_BASE_URL}/api/knowledge-bases/kb-1/search`, async ({ request }) => {
          receivedBody = await request.json() as Record<string, unknown>;
          return HttpResponse.json(mockSearchResult);
        }),
      );

      const kb = createKnowledgeBases();
      const result = await kb.search('kb-1', { query: 'invoices' });

      expect(result.resultsCount).toBe(1);
      expect(receivedBody.query).toBe('invoices');
    });
  });

  describe('sync()', () => {
    it('syncs a knowledge base', async () => {
      server.use(
        http.post(`${TEST_BASE_URL}/api/knowledge-bases/kb-1/sync`, () => {
          return HttpResponse.json(mockSyncResult);
        }),
      );

      const kb = createKnowledgeBases();
      const result = await kb.sync('kb-1');
      expect(result.status).toBe('completed');
      expect(result.documentsProcessed).toBe(5);
    });
  });

  describe('documents()', () => {
    describe('list()', () => {
      it('lists documents in a knowledge base', async () => {
        server.use(
          http.get(`${TEST_BASE_URL}/api/knowledge-bases/kb-1/documents`, () => {
            return HttpResponse.json({
              data: [mockKBDocument],
              pagination: { total: 1, page: 1, limit: 10 },
            });
          }),
        );

        const kb = createKnowledgeBases();
        const page = await kb.documents('kb-1').list();

        expect(page.data).toHaveLength(1);
        expect(page.data[0].id).toBe('doc-1');
      });
    });

    describe('get()', () => {
      it('gets a document by id', async () => {
        server.use(
          http.get(`${TEST_BASE_URL}/api/knowledge-bases/kb-1/documents/doc-1`, () => {
            return HttpResponse.json(mockKBDocument);
          }),
        );

        const kb = createKnowledgeBases();
        const result = await kb.documents('kb-1').get('doc-1');
        expect(result.id).toBe('doc-1');
      });
    });

    describe('create()', () => {
      it('creates a document', async () => {
        let receivedBody: Record<string, unknown> = {};
        server.use(
          http.post(`${TEST_BASE_URL}/api/knowledge-bases/kb-1/documents`, async ({ request }) => {
            receivedBody = await request.json() as Record<string, unknown>;
            return HttpResponse.json(mockKBDocument);
          }),
        );

        const kb = createKnowledgeBases();
        const result = await kb.documents('kb-1').create({
          content: { title: 'New Doc' },
        });

        expect(result.id).toBe('doc-1');
        expect(receivedBody.content).toEqual({ title: 'New Doc' });
      });
    });

    describe('update()', () => {
      it('updates a document', async () => {
        server.use(
          http.put(`${TEST_BASE_URL}/api/knowledge-bases/kb-1/documents/doc-1`, () => {
            return HttpResponse.json(mockKBDocument);
          }),
        );

        const kb = createKnowledgeBases();
        const result = await kb.documents('kb-1').update('doc-1', {
          content: { title: 'Updated' },
        });

        expect(result.id).toBe('doc-1');
      });
    });

    describe('delete()', () => {
      it('deletes a document', async () => {
        let deleteCalled = false;
        server.use(
          http.delete(`${TEST_BASE_URL}/api/knowledge-bases/kb-1/documents/doc-1`, () => {
            deleteCalled = true;
            return new HttpResponse(null, { status: 204 });
          }),
        );

        const kb = createKnowledgeBases();
        await kb.documents('kb-1').delete('doc-1');
        expect(deleteCalled).toBe(true);
      });
    });

    describe('withRawResponse', () => {
      it('returns RawResponse for documents list()', async () => {
        server.use(
          http.get(`${TEST_BASE_URL}/api/knowledge-bases/kb-1/documents`, () => {
            return HttpResponse.json({
              data: [mockKBDocument],
              pagination: { total: 1, page: 1, limit: 10 },
            });
          }),
        );

        const kb = createKnowledgeBases();
        const raw = await kb.documents('kb-1').withRawResponse.list();
        expect(raw).toBeInstanceOf(RawResponse);
        expect(raw.statusCode).toBe(200);
      });
    });
  });

  describe('withRawResponse', () => {
    it('returns RawResponse for list()', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/knowledge-bases`, () => {
          return HttpResponse.json({
            data: [mockKnowledgeBase],
            pagination: { total: 1, page: 1, limit: 10 },
          });
        }),
      );

      const kb = createKnowledgeBases();
      const raw = await kb.withRawResponse.list();
      expect(raw).toBeInstanceOf(RawResponse);
      expect(raw.statusCode).toBe(200);
    });

    it('returns RawResponse for get()', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/knowledge-bases/kb-1`, () => {
          return HttpResponse.json(mockKnowledgeBase);
        }),
      );

      const kb = createKnowledgeBases();
      const raw = await kb.withRawResponse.get('kb-1');
      expect(raw).toBeInstanceOf(RawResponse);
      expect(raw.statusCode).toBe(200);
    });

    it('returns RawResponse for search()', async () => {
      server.use(
        http.post(`${TEST_BASE_URL}/api/knowledge-bases/kb-1/search`, () => {
          return HttpResponse.json(mockSearchResult);
        }),
      );

      const kb = createKnowledgeBases();
      const raw = await kb.withRawResponse.search('kb-1', { query: 'test' });
      expect(raw).toBeInstanceOf(RawResponse);
      expect(raw.statusCode).toBe(200);
    });
  });
});
